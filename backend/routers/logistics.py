from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models import LogisticsRule, get_db

router = APIRouter()


@router.get("/estimate")
def get_logistics_estimate(city: str, guest_count: int = 0, db: Session = Depends(get_db)):
    rule = db.query(LogisticsRule).filter(LogisticsRule.city == city).first()
    if not rule:
        raise HTTPException(status_code=404, detail="City not supported")

    cars = max(1, round(guest_count / 12)) if guest_count else 1
    return {
        "city": city,
        "airport_distance_km": rule.airport_distance_km,
        "ghodi": {"min": rule.ghodi_min, "max": rule.ghodi_max},
        "dholi_block": {"min": 2 * 3 * rule.dholi_per_hour_min, "max": 2 * 3 * rule.dholi_per_hour_max},
        "transfers": {"min": cars * rule.innova_per_day_min, "max": cars * rule.innova_per_day_max},
    }
