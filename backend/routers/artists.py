from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from models import ArtistCost, get_db

router = APIRouter()


@router.get("")
def list_artists(category: str | None = None, tier: str | None = None, db: Session = Depends(get_db)):
    query = db.query(ArtistCost)
    if category:
        query = query.filter(ArtistCost.category == category)
    if tier:
        query = query.filter(ArtistCost.tier == tier)
    artists = query.order_by(ArtistCost.category, ArtistCost.cost_min).all()
    return {
        "artists": [
            {
                "id": artist.id,
                "category": artist.category,
                "tier": artist.tier,
                "name": artist.name,
                "cost_min": artist.cost_min,
                "cost_max": artist.cost_max,
                "notes": artist.notes,
            }
            for artist in artists
        ]
    }
