from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from models import RSVPEvent, RSVPResponse, get_db

router = APIRouter()


class RSVPEventCreate(BaseModel):
    event_name: str
    host_name: str
    wedding_date: str | None = None


class RSVPResponseCreate(BaseModel):
    event_code: str
    guest_name: str
    email: str | None = None
    phone: str | None = None
    attending: bool = True
    guest_count: int = 1
    dietary_preferences: str | None = None
    notes: str | None = None


@router.post("/event")
def create_event(payload: RSVPEventCreate, db: Session = Depends(get_db)):
    event = RSVPEvent(**payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return {"event_code": event.event_code, "event_name": event.event_name}


@router.post("/respond")
def submit_response(payload: RSVPResponseCreate, db: Session = Depends(get_db)):
    response = RSVPResponse(**payload.model_dump())
    db.add(response)
    db.commit()
    db.refresh(response)
    return {"status": "recorded", "response_id": response.id}
