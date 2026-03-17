import asyncio
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "backend"))

from models import DecorImage, SessionLocal, init_db  # noqa: E402
from utils.scraper import fetch_unsplash_images  # noqa: E402


async def main():
    init_db()
    db = SessionLocal()
    try:
        for function_type in ["mehendi", "haldi", "sangeet", "baraat", "pheras", "reception"]:
            images = await fetch_unsplash_images(function_type, per_page=12)
            for image in images:
                exists = db.query(DecorImage).filter(DecorImage.url == image["url"]).first()
                if not exists:
                    db.add(DecorImage(**image, style="traditional", complexity="mid", is_labelled=False))
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(main())
