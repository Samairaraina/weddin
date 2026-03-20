from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from models import ArtistCost, DecorImage, FBRate, LogisticsRule, get_db

router = APIRouter()


class ArtistUpdate(BaseModel):
    cost_min: float
    cost_max: float
    notes: str | None = None


class FBRateUpdate(BaseModel):
    cost_per_head_min: float
    cost_per_head_max: float


class LogisticsUpdate(BaseModel):
    ghodi_min: float
    ghodi_max: float
    dholi_per_hour_min: float
    dholi_per_hour_max: float
    innova_per_day_min: float
    innova_per_day_max: float
    airport_distance_km: float


@router.get("/artists")
def admin_artists(db: Session = Depends(get_db)):
    return {"artists": db.query(ArtistCost).order_by(ArtistCost.category).all()}


@router.patch("/artist/{artist_id}")
def update_artist(artist_id: int, payload: ArtistUpdate, db: Session = Depends(get_db)):
    artist = db.query(ArtistCost).filter(ArtistCost.id == artist_id).first()
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    artist.cost_min = payload.cost_min
    artist.cost_max = payload.cost_max
    artist.notes = payload.notes
    artist.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(artist)
    return {"status": "updated", "artist_id": artist.id}


@router.get("/fb-rates")
def get_fb_rates(db: Session = Depends(get_db)):
    rates = db.query(FBRate).order_by(FBRate.hotel_tier, FBRate.meal_type).all()
    return {"rates": rates}


@router.patch("/fb-rates/{rate_id}")
def update_fb_rate(rate_id: int, payload: FBRateUpdate, db: Session = Depends(get_db)):
    rate = db.query(FBRate).filter(FBRate.id == rate_id).first()
    if not rate:
        raise HTTPException(status_code=404, detail="F&B rate not found")
    rate.cost_per_head_min = payload.cost_per_head_min
    rate.cost_per_head_max = payload.cost_per_head_max
    db.commit()
    return {"status": "updated", "rate_id": rate_id}


@router.get("/logistics")
def admin_logistics(db: Session = Depends(get_db)):
    return {"rules": db.query(LogisticsRule).order_by(LogisticsRule.city).all()}


@router.patch("/logistics/{rule_id}")
def update_logistics(rule_id: int, payload: LogisticsUpdate, db: Session = Depends(get_db)):
    rule = db.query(LogisticsRule).filter(LogisticsRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Logistics rule not found")
    for field, value in payload.model_dump().items():
        setattr(rule, field, value)
    db.commit()
    return {"status": "updated", "rule_id": rule_id}


@router.get("/decor")
def admin_decor(db: Session = Depends(get_db)):
    images = db.query(DecorImage).order_by(DecorImage.created_at.desc()).all()
    return {"images": images}


@router.post("/train")
def train_model():
    from ml.predictor import train_cost_model

    return train_cost_model()
