from __future__ import annotations

import asyncio
import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import text

sys.path.append(str(Path(__file__).resolve().parents[1] / "backend"))

from models import BudgetEstimate, SessionLocal, init_db  # noqa: E402
from routers.budget import WeddingInput, _scenario_key, calculate_budget, generate_narrative_text  # noqa: E402

SCENARIOS = [
    ("5star_palace", "Udaipur"),
    ("5star_city", "Mumbai"),
    ("4star", "Jaipur"),
    ("resort", "Goa"),
    ("farmhouse", "Delhi"),
]


async def main() -> None:
    load_dotenv()
    init_db()
    db = SessionLocal()
    try:
        for hotel_tier, city in SCENARIOS:
            payload = WeddingInput(
                city=city.lower(),
                hotel_tier=hotel_tier,
                hotel_rooms=70,
                total_guests=320,
                outstation_pct=55,
                num_functions=5,
                functions=["mehendi", "haldi", "sangeet", "pheras", "reception"],
                bride_hometown="Delhi",
                groom_hometown="Mumbai",
                decor_style="premium",
                entertainment_preference="standard",
                bar_type="full_bar",
                selected_artists=[],
                include_photography=True,
                contingency_pct=10,
            )
            outputs = calculate_budget(payload, db)
            estimate = BudgetEstimate(inputs=json.dumps(payload.model_dump()), outputs=json.dumps(outputs))
            narrative = await generate_narrative_text(estimate)
            db.execute(
                text(
                    """
                INSERT INTO cached_narratives (scenario_key, hotel_tier, narrative, source, created_at, updated_at)
                VALUES (:scenario_key, :hotel_tier, :narrative, :source, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT(scenario_key) DO UPDATE SET
                  hotel_tier = excluded.hotel_tier,
                  narrative = excluded.narrative,
                  source = excluded.source,
                  updated_at = CURRENT_TIMESTAMP
                """
                ),
                {
                    "scenario_key": _scenario_key(payload.model_dump()),
                    "hotel_tier": hotel_tier,
                    "narrative": narrative,
                    "source": "gemini" if os.getenv("GEMINI_API_KEY") else "fallback",
                },
            )
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(main())
