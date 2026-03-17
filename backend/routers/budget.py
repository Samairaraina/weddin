from __future__ import annotations

import json
import os
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from models import ArtistCost, BudgetEstimate, FBRate, LogisticsRule, get_db
from utils.pdf_generator import generate_budget_pdf

router = APIRouter()

VENUE_RATES = {"5star_palace": (900000, 2000000), "5star_city": (500000, 1100000), "4star": (250000, 550000), "resort": (300000, 750000), "farmhouse": (150000, 350000)}
ROOM_RATES = {"5star_palace": (18000, 42000), "5star_city": (12000, 26000), "4star": (7000, 15000), "resort": (8000, 18000), "farmhouse": (4000, 10000)}
PHOTO_RATES = {"5star_palace": (300000, 900000), "5star_city": (220000, 700000), "4star": (125000, 400000), "resort": (150000, 480000), "farmhouse": (80000, 250000)}
BAR_RATES = {"dry": (0, 0), "beer_wine": (1500, 3500), "full_bar": (2500, 6000)}
DECOR_RATES = {
    "budget": {"mehendi": (80000, 180000), "haldi": (70000, 160000), "sangeet": (160000, 300000), "baraat": (60000, 150000), "pheras": (150000, 300000), "reception": (180000, 350000)},
    "mid": {"mehendi": (150000, 350000), "haldi": (120000, 300000), "sangeet": (280000, 650000), "baraat": (90000, 220000), "pheras": (300000, 650000), "reception": (350000, 900000)},
    "premium": {"mehendi": (250000, 550000), "haldi": (220000, 500000), "sangeet": (450000, 1100000), "baraat": (150000, 350000), "pheras": (500000, 1200000), "reception": (650000, 1600000)},
    "ultra-premium": {"mehendi": (450000, 900000), "haldi": (400000, 800000), "sangeet": (900000, 2000000), "baraat": (300000, 700000), "pheras": (900000, 2200000), "reception": (1200000, 3000000)},
}
ENTERTAINMENT_MULTIPLIER = {"minimal": 0.6, "standard": 1.0, "premium": 1.45}
MEAL_BY_FUNCTION = {"mehendi": "floating_snacks", "haldi": "lunch_buffet", "sangeet": "gala_dinner", "baraat": "floating_snacks", "pheras": "lunch_buffet", "reception": "gala_dinner"}


class WeddingInput(BaseModel):
    city: str
    hotel_tier: str
    hotel_rooms: int = Field(ge=1)
    total_guests: int = Field(ge=20)
    outstation_pct: float = Field(ge=0, le=100)
    num_functions: int = Field(ge=1, le=8)
    functions: list[str]
    bride_hometown: str
    groom_hometown: str
    decor_style: str = "mid"
    entertainment_preference: str = "standard"
    bar_type: str = "beer_wine"
    selected_artists: list[int] | None = None
    include_photography: bool = True
    contingency_pct: float = Field(default=10, ge=0, le=30)


def _range(min_value: float, max_value: float, note: str | None = None) -> dict[str, Any]:
    payload = {"min": round(min_value), "max": round(max_value)}
    if note:
        payload["note"] = note
    return payload


def _section(label: str, items: dict[str, dict[str, Any]]) -> dict[str, Any]:
    return {"label": label, "items": items, "total_min": sum(item["min"] for item in items.values()), "total_max": sum(item["max"] for item in items.values())}


def calculate_budget(inp: WeddingInput, db: Session) -> dict[str, Any]:
    functions = inp.functions[: inp.num_functions] or ["mehendi", "sangeet", "pheras", "reception"]
    logistics = db.query(LogisticsRule).filter(LogisticsRule.city == inp.city).first()
    if not logistics:
        raise HTTPException(status_code=404, detail="Unsupported city")

    venue_min, venue_max = VENUE_RATES[inp.hotel_tier]
    room_min, room_max = ROOM_RATES[inp.hotel_tier]
    decor_book = DECOR_RATES.get(inp.decor_style, DECOR_RATES["mid"])

    venue_items = {
        "venue_block": _range(venue_min * len(functions), venue_max * len(functions), f"{inp.hotel_tier.replace('_', ' ').title()} across {len(functions)} events"),
        "hotel_rooms": _range(room_min * inp.hotel_rooms * len(functions), room_max * inp.hotel_rooms * len(functions), f"{inp.hotel_rooms} rooms for {len(functions)} nights"),
    }
    decor_items = {function_name: _range(*decor_book.get(function_name, decor_book["reception"]), function_name.title()) for function_name in functions}

    fb_items = {}
    for function_name in functions:
        meal_type = MEAL_BY_FUNCTION.get(function_name, "gala_dinner")
        rate = db.query(FBRate).filter(FBRate.hotel_tier == inp.hotel_tier, FBRate.meal_type == meal_type).first()
        if rate:
            fb_items[function_name] = _range(rate.cost_per_head_min * inp.total_guests, rate.cost_per_head_max * inp.total_guests, f"{meal_type.replace('_', ' ').title()} for {function_name.title()}")

    bar_min, bar_max = BAR_RATES[inp.bar_type]
    fb_items["bar_program"] = _range(bar_min * inp.total_guests, bar_max * inp.total_guests, inp.bar_type.replace("_", " ").title())

    outstation_guests = inp.total_guests * (inp.outstation_pct / 100.0)
    transfer_units = max(1, round((outstation_guests / 3) * 2))
    logistics_items = {"guest_transfer": _range(transfer_units * logistics.innova_per_day_min, transfer_units * logistics.innova_per_day_max, "Airport and venue transfer fleet")}
    if "baraat" in functions:
        logistics_items["ghodi"] = _range(logistics.ghodi_min, logistics.ghodi_max, "Baraat ghodi")
        logistics_items["dholi"] = _range(2 * 3 * logistics.dholi_per_hour_min, 2 * 3 * logistics.dholi_per_hour_max, "2 dholi players for 3 hours")

    selected_artists = db.query(ArtistCost).filter(ArtistCost.id.in_(inp.selected_artists)).all() if inp.selected_artists else []
    artist_items = {}
    multiplier = ENTERTAINMENT_MULTIPLIER.get(inp.entertainment_preference, 1.0)
    for artist in selected_artists:
        artist_items[f"artist_{artist.id}"] = _range(artist.cost_min * multiplier, artist.cost_max * multiplier, artist.name or f"{artist.category.title()} ({artist.tier})")
    if not artist_items:
        baseline = {"minimal": (60000, 180000), "standard": (180000, 500000), "premium": (450000, 1200000)}[inp.entertainment_preference]
        artist_items["programming"] = _range(*baseline, f"{inp.entertainment_preference.title()} entertainment package")

    photography_items = {"photo_video_team": _range(*PHOTO_RATES[inp.hotel_tier], "Photography + cinematography")} if inp.include_photography else {}
    sundry_items = {
        "room_baskets": _range(1200 * inp.hotel_rooms, 4000 * inp.hotel_rooms, "Welcome room baskets"),
        "gift_hampers": _range(500 * inp.total_guests, 2200 * inp.total_guests, "Guest gifting"),
        "stationery": _range(200 * inp.total_guests, 800 * inp.total_guests, "Invites, signage, stationery"),
    }

    breakdown = {
        "venue": _section("Venue & Stay", venue_items),
        "decor": _section("Decor", decor_items),
        "food_beverage": _section("Food & Beverage", fb_items),
        "logistics": _section("Logistics", logistics_items),
        "artists": _section("Entertainment", artist_items),
        "photography": _section("Photography", photography_items),
        "sundries": _section("Sundries", sundry_items),
    }
    subtotal_min = sum(section["total_min"] for section in breakdown.values())
    subtotal_max = sum(section["total_max"] for section in breakdown.values())
    breakdown["contingency"] = _section("Contingency", {"reserve": _range(subtotal_min * (inp.contingency_pct / 100.0), subtotal_max * (inp.contingency_pct / 100.0), f"{inp.contingency_pct}% planning reserve")})

    confidence = 85 + (5 if inp.selected_artists else 0) + (3 if inp.outstation_pct > 0 else 0) - (5 if inp.decor_style in {"ultra-premium", "budget"} else 0)
    confidence = min(95, max(60, confidence))

    section_totals = {key: {"label": section["label"], "min": section["total_min"], "max": section["total_max"], "mid": round((section["total_min"] + section["total_max"]) / 2)} for key, section in breakdown.items()}
    return {"inputs": inp.model_dump(), "breakdown": breakdown, "section_totals": section_totals, "grand_total_min": sum(section["total_min"] for section in breakdown.values()), "grand_total_max": sum(section["total_max"] for section in breakdown.values()), "confidence": confidence, "meta": {"outstation_guests": round(outstation_guests), "functions_considered": functions, "city": inp.city}}


async def generate_narrative_text(estimate: BudgetEstimate) -> str:
    outputs = json.loads(estimate.outputs)
    inputs = json.loads(estimate.inputs)
    prompt = f"Write a concise luxury wedding budget analysis in under 140 words. City: {inputs['city']}. Hotel tier: {inputs['hotel_tier']}. Budget range: Rs {outputs['grand_total_min']:,.0f} to Rs {outputs['grand_total_max']:,.0f}. Mention key drivers and tradeoffs."
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        async with httpx.AsyncClient() as client:
            response = await client.post(url, params={"key": api_key}, json=payload, timeout=25)
            response.raise_for_status()
            data = response.json()
            try:
                return data["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError):
                pass
    return f"This estimate for a {inputs['hotel_tier'].replace('_', ' ')} celebration in {inputs['city'].title()} lands between Rs {outputs['grand_total_min']:,.0f} and Rs {outputs['grand_total_max']:,.0f}. Venue stay, decor, and hospitality are the biggest cost drivers, and the {outputs['confidence']}% confidence score reflects the level of detail provided."


@router.post("/estimate")
def create_estimate(payload: WeddingInput, db: Session = Depends(get_db)):
    outputs = calculate_budget(payload, db)
    estimate = BudgetEstimate(inputs=json.dumps(payload.model_dump()), outputs=json.dumps(outputs))
    db.add(estimate)
    db.commit()
    db.refresh(estimate)
    outputs["session_id"] = estimate.session_id
    outputs["estimate_id"] = estimate.id
    return outputs


@router.get("/estimate/{session_id}")
def get_estimate(session_id: str, db: Session = Depends(get_db)):
    estimate = db.query(BudgetEstimate).filter(BudgetEstimate.session_id == session_id).first()
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")
    outputs = json.loads(estimate.outputs)
    outputs["session_id"] = estimate.session_id
    outputs["estimate_id"] = estimate.id
    outputs["ai_narrative"] = estimate.ai_narrative
    return outputs


@router.post("/narrative/{session_id}")
async def create_narrative(session_id: str, db: Session = Depends(get_db)):
    estimate = db.query(BudgetEstimate).filter(BudgetEstimate.session_id == session_id).first()
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")
    narrative = await generate_narrative_text(estimate)
    estimate.ai_narrative = narrative
    db.commit()
    return {"session_id": session_id, "narrative": narrative}


@router.get("/pdf/{session_id}")
def download_estimate_pdf(session_id: str, db: Session = Depends(get_db)):
    estimate = db.query(BudgetEstimate).filter(BudgetEstimate.session_id == session_id).first()
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")
    outputs = json.loads(estimate.outputs)
    pdf_bytes = generate_budget_pdf(outputs, estimate.ai_narrative or "")
    headers = {"Content-Disposition": f'attachment; filename="weddingbudget-{session_id}.pdf"'}
    return StreamingResponse(iter([pdf_bytes]), media_type="application/pdf", headers=headers)
