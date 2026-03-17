from __future__ import annotations

import json
import uuid
from datetime import datetime
from pathlib import Path

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

BASE_DIR = Path(__file__).resolve().parent
DATABASE_URL = f"sqlite:///{BASE_DIR / 'weddingbudget.db'}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class DecorImage(Base):
    __tablename__ = "decor_images"

    id = Column(Integer, primary_key=True)
    url = Column(String, unique=True, nullable=False)
    thumbnail_url = Column(String, nullable=False)
    photographer = Column(String, nullable=True)
    function_type = Column(String, nullable=True)
    style = Column(String, nullable=True)
    complexity = Column(String, nullable=True)
    cost_min = Column(Float, nullable=True)
    cost_max = Column(Float, nullable=True)
    embedding = Column(Text, nullable=True)
    is_labelled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ArtistCost(Base):
    __tablename__ = "artist_costs"

    id = Column(Integer, primary_key=True)
    category = Column(String, nullable=False)
    tier = Column(String, nullable=False)
    name = Column(String, nullable=True)
    cost_min = Column(Float, nullable=False)
    cost_max = Column(Float, nullable=False)
    notes = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class LogisticsRule(Base):
    __tablename__ = "logistics_rules"

    id = Column(Integer, primary_key=True)
    city = Column(String, unique=True, nullable=False)
    ghodi_min = Column(Float, nullable=False)
    ghodi_max = Column(Float, nullable=False)
    dholi_per_hour_min = Column(Float, nullable=False)
    dholi_per_hour_max = Column(Float, nullable=False)
    innova_per_day_min = Column(Float, nullable=False)
    innova_per_day_max = Column(Float, nullable=False)
    airport_distance_km = Column(Float, nullable=False)


class FBRate(Base):
    __tablename__ = "fb_rates"

    id = Column(Integer, primary_key=True)
    meal_type = Column(String, nullable=False)
    hotel_tier = Column(String, nullable=False)
    cost_per_head_min = Column(Float, nullable=False)
    cost_per_head_max = Column(Float, nullable=False)


class BudgetEstimate(Base):
    __tablename__ = "budget_estimates"

    id = Column(Integer, primary_key=True)
    session_id = Column(String, unique=True, index=True, default=lambda: str(uuid.uuid4()))
    inputs = Column(Text, nullable=False)
    outputs = Column(Text, nullable=False)
    ai_narrative = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class RSVPEvent(Base):
    __tablename__ = "rsvp_events"

    id = Column(Integer, primary_key=True)
    event_name = Column(String, nullable=False)
    host_name = Column(String, nullable=False)
    event_code = Column(String, unique=True, index=True, default=lambda: str(uuid.uuid4())[:8])
    wedding_date = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class RSVPResponse(Base):
    __tablename__ = "rsvp_responses"

    id = Column(Integer, primary_key=True)
    event_code = Column(String, nullable=False, index=True)
    guest_name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    attending = Column(Boolean, default=True)
    guest_count = Column(Integer, default=1)
    dietary_preferences = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


ARTIST_SEED = [
    ("singer", "a_list", "Bollywood A-List Singer", 1200000, 2500000, "Requires premium hospitality + travel"),
    ("singer", "premium", "Premium Playback Singer", 500000, 1200000, "Great for sangeet headline slot"),
    ("singer", "standard", "Regional Performance Singer", 180000, 450000, "Performs 60-90 minute set"),
    ("singer", "local", "Local Sufi Singer", 45000, 120000, "Popular for mehendi welcome"),
    ("live_band", "premium", "Celebrity Wedding Band", 800000, 1800000, "Includes 8-10 artists"),
    ("live_band", "standard", "Curated Live Band", 250000, 650000, "4-6 piece ensemble"),
    ("live_band", "local", "Acoustic Duo", 50000, 150000, "Cocktail or brunch set"),
    ("dj", "a_list", "Celebrity DJ", 400000, 1000000, "Includes premium setup rider"),
    ("dj", "premium", "Club Headliner DJ", 180000, 400000, "Strong sangeet/reception fit"),
    ("dj", "standard", "Wedding DJ", 100000, 350000, "Common all-rounder"),
    ("dj", "local", "Local DJ Console", 30000, 90000, "Budget-friendly option"),
    ("folk", "premium", "Rajasthani Folk Ensemble", 120000, 250000, "Perfect for baraat or welcome"),
    ("folk", "standard", "Folk Dance Troupe", 80000, 200000, "Traditional performance block"),
    ("choreographer", "premium", "Celebrity Choreography Team", 300000, 800000, "Includes rehearsal planning"),
    ("choreographer", "standard", "Wedding Choreographer", 80000, 250000, "3-5 family performances"),
    ("anchor", "premium", "Celebrity Anchor", 250000, 600000, "Great for sangeet stage flow"),
    ("anchor", "standard", "Professional Wedding MC", 50000, 150000, "Suitable for reception"),
    ("special", "premium", "LED Dhol Act", 150000, 350000, "High-energy baraat feature"),
    ("special", "standard", "Fireworks / Sparkular Team", 80000, 220000, "Venue permissions required"),
    ("special", "local", "Live Bangle Artist", 15000, 60000, "Favours mehendi guest engagement"),
]

LOGISTICS_SEED = [
    ("udaipur", 25000, 60000, 8000, 18000, 5500, 8500, 24),
    ("jaipur", 20000, 50000, 6000, 15000, 4500, 7500, 18),
    ("mumbai", 35000, 80000, 10000, 25000, 6000, 10000, 14),
    ("delhi", 30000, 70000, 8000, 20000, 5000, 8000, 16),
    ("goa", 28000, 65000, 7000, 18000, 5500, 9000, 28),
    ("jodhpur", 22000, 55000, 7000, 16000, 5000, 7800, 12),
    ("hyderabad", 25000, 60000, 7000, 17000, 4800, 7600, 20),
]

FB_RATE_GRID = {
    "5star_palace": {"welcome_dinner": (2200, 4200), "lunch_buffet": (1800, 3200), "gala_dinner": (3000, 6500), "floating_snacks": (900, 1800)},
    "5star_city": {"welcome_dinner": (1800, 3400), "lunch_buffet": (1500, 2600), "gala_dinner": (2400, 4800), "floating_snacks": (800, 1600)},
    "4star": {"welcome_dinner": (1200, 2200), "lunch_buffet": (1100, 2000), "gala_dinner": (1600, 3200), "floating_snacks": (550, 1100)},
    "resort": {"welcome_dinner": (1400, 2600), "lunch_buffet": (1200, 2100), "gala_dinner": (1800, 3600), "floating_snacks": (650, 1300)},
    "farmhouse": {"welcome_dinner": (900, 1800), "lunch_buffet": (850, 1500), "gala_dinner": (1200, 2400), "floating_snacks": (450, 900)},
}

DECOR_SEED = [
    {"url": "https://images.unsplash.com/photo-1519741497674-611481863552", "thumbnail_url": "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80", "photographer": "Mock Seed", "function_type": "mehendi", "style": "floral", "complexity": "mid", "cost_min": 150000, "cost_max": 350000, "is_labelled": True},
    {"url": "https://images.unsplash.com/photo-1520854221256-17451cc331bf", "thumbnail_url": "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80", "photographer": "Mock Seed", "function_type": "reception", "style": "royal", "complexity": "premium", "cost_min": 550000, "cost_max": 1200000, "is_labelled": True},
    {"url": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc", "thumbnail_url": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80", "photographer": "Mock Seed", "function_type": "sangeet", "style": "modern", "complexity": "premium", "cost_min": 400000, "cost_max": 900000, "is_labelled": True},
]


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _seed_artists(db: Session) -> None:
    if db.query(ArtistCost).count():
        return
    for category, tier, name, cost_min, cost_max, notes in ARTIST_SEED:
        db.add(ArtistCost(category=category, tier=tier, name=name, cost_min=cost_min, cost_max=cost_max, notes=notes))


def _seed_logistics(db: Session) -> None:
    if db.query(LogisticsRule).count():
        return
    for city, ghodi_min, ghodi_max, dholi_min, dholi_max, innova_min, innova_max, airport_distance in LOGISTICS_SEED:
        db.add(LogisticsRule(city=city, ghodi_min=ghodi_min, ghodi_max=ghodi_max, dholi_per_hour_min=dholi_min, dholi_per_hour_max=dholi_max, innova_per_day_min=innova_min, innova_per_day_max=innova_max, airport_distance_km=airport_distance))


def _seed_fb_rates(db: Session) -> None:
    if db.query(FBRate).count():
        return
    for hotel_tier, meals in FB_RATE_GRID.items():
        for meal_type, (cost_min, cost_max) in meals.items():
            db.add(FBRate(meal_type=meal_type, hotel_tier=hotel_tier, cost_per_head_min=cost_min, cost_per_head_max=cost_max))


def _seed_decor(db: Session) -> None:
    if db.query(DecorImage).count():
        return
    for item in DECOR_SEED:
        db.add(DecorImage(**item, embedding=json.dumps([0.0] * 512)))


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        _seed_artists(db)
        _seed_logistics(db)
        _seed_fb_rates(db)
        _seed_decor(db)
        db.commit()
    finally:
        db.close()
