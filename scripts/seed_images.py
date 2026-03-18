from __future__ import annotations

import argparse
import asyncio
import json
import math
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

sys.path.append(str(Path(__file__).resolve().parents[1] / "backend"))

from ml.embedder import embed_image_from_url  # noqa: E402
from ml.predictor import train_cost_model  # noqa: E402
from models import DecorImage, SessionLocal, init_db  # noqa: E402
from utils.scraper import fetch_unsplash_images_page  # noqa: E402

FUNCTION_TYPES = ["mehendi", "haldi", "sangeet", "baraat", "pheras", "reception"]
STYLE_BY_FUNCTION = {
    "mehendi": ["floral", "traditional", "minimal", "rustic"],
    "haldi": ["traditional", "minimal", "floral", "rustic"],
    "sangeet": ["modern", "royal", "traditional", "minimal"],
    "baraat": ["traditional", "royal", "modern", "rustic"],
    "pheras": ["royal", "traditional", "floral", "minimal"],
    "reception": ["modern", "royal", "floral", "minimal"],
}
COMPLEXITY_BY_INDEX = ["budget", "mid", "premium", "ultra-premium"]
BASE_COSTS = {
    "mehendi": (140000, 320000),
    "haldi": (120000, 280000),
    "sangeet": (360000, 900000),
    "baraat": (110000, 260000),
    "pheras": (420000, 1050000),
    "reception": (520000, 1350000),
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Seed decor images and embeddings into SQLite.")
    parser.add_argument("--total", type=int, default=400, help="Target number of decor images to seed.")
    parser.add_argument("--per-page", type=int, default=30, help="Unsplash page size per request.")
    return parser.parse_args()


def infer_metadata(function_type: str, index: int) -> dict[str, object]:
    style = STYLE_BY_FUNCTION[function_type][index % len(STYLE_BY_FUNCTION[function_type])]
    complexity = COMPLEXITY_BY_INDEX[index % len(COMPLEXITY_BY_INDEX)]
    base_min, base_max = BASE_COSTS[function_type]
    multiplier = 0.82 + (index % 7) * 0.11
    cost_min = int(base_min * multiplier)
    cost_max = int(base_max * multiplier * 1.08)
    return {
        "style": style,
        "complexity": complexity,
        "cost_min": cost_min,
        "cost_max": max(cost_max, cost_min + 50000),
    }


async def gather_images(total: int, per_page: int) -> list[dict[str, str]]:
    access_key = os.getenv("UNSPLASH_ACCESS_KEY")
    if not access_key:
        raise RuntimeError("UNSPLASH_ACCESS_KEY is required to seed 400 images from Unsplash.")

    target_per_function = math.ceil(total / len(FUNCTION_TYPES))
    collected: list[dict[str, str]] = []
    seen_urls: set[str] = set()

    for function_type in FUNCTION_TYPES:
        page = 1
        function_images: list[dict[str, str]] = []
        while len(function_images) < target_per_function:
            batch = await fetch_unsplash_images_page(function_type=function_type, per_page=per_page, page=page, access_key=access_key)
            if not batch:
                break
            for image in batch:
                if image["url"] in seen_urls:
                    continue
                seen_urls.add(image["url"])
                function_images.append(image)
                if len(function_images) >= target_per_function:
                    break
            page += 1
        collected.extend(function_images)

    return collected[:total]


async def main() -> None:
    args = parse_args()
    load_dotenv()
    init_db()
    images = await gather_images(total=args.total, per_page=args.per_page)

    db = SessionLocal()
    created = 0
    updated = 0
    try:
        for index, image in enumerate(images):
            metadata = infer_metadata(image["function_type"], index)
            embedding = await embed_image_from_url(image["url"])

            existing = db.query(DecorImage).filter(DecorImage.url == image["url"]).first()
            if existing:
                existing.thumbnail_url = image["thumbnail_url"]
                existing.photographer = image["photographer"]
                existing.function_type = image["function_type"]
                existing.style = metadata["style"]
                existing.complexity = metadata["complexity"]
                existing.cost_min = metadata["cost_min"]
                existing.cost_max = metadata["cost_max"]
                existing.embedding = json.dumps(embedding)
                existing.is_labelled = True
                updated += 1
            else:
                db.add(
                    DecorImage(
                        **image,
                        style=metadata["style"],
                        complexity=metadata["complexity"],
                        cost_min=metadata["cost_min"],
                        cost_max=metadata["cost_max"],
                        embedding=json.dumps(embedding),
                        is_labelled=True,
                    )
                )
                created += 1

        db.commit()
    finally:
        db.close()

    train_status = train_cost_model()
    print(
        json.dumps(
            {
                "requested_total": args.total,
                "fetched": len(images),
                "created": created,
                "updated": updated,
                "train_status": train_status,
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    asyncio.run(main())
