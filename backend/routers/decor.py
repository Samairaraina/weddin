from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ml.embedder import embed_image_from_url
from ml.predictor import predict_cost
from models import DecorImage, get_db
from utils.scraper import fetch_unsplash_images

router = APIRouter()


class DecorLabelUpdate(BaseModel):
    function_type: str
    style: str
    complexity: str
    cost_min: float
    cost_max: float


@router.get("/library")
def get_decor_library(function_type: str | None = None, style: str | None = None, complexity: str | None = None, page: int = 1, page_size: int = 24, db: Session = Depends(get_db)):
    query = db.query(DecorImage)
    if function_type:
        query = query.filter(DecorImage.function_type == function_type)
    if style:
        query = query.filter(DecorImage.style == style)
    if complexity:
        query = query.filter(DecorImage.complexity == complexity)

    total = query.count()
    images = query.order_by(DecorImage.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {"page": page, "page_size": page_size, "total": total, "images": images}


@router.post("/scrape/{function_type}")
async def scrape_decor(function_type: str, db: Session = Depends(get_db)):
    images = await fetch_unsplash_images(function_type=function_type, per_page=12)
    added = 0
    for image in images:
        exists = db.query(DecorImage).filter(DecorImage.url == image["url"]).first()
        if exists:
            continue
        db.add(DecorImage(**image, style="traditional", complexity="mid", is_labelled=False))
        added += 1
    db.commit()
    return {"status": "ok", "added": added, "function_type": function_type}


@router.patch("/label/{image_id}")
async def label_image(image_id: int, payload: DecorLabelUpdate, db: Session = Depends(get_db)):
    image = db.query(DecorImage).filter(DecorImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Decor image not found")

    image.function_type = payload.function_type
    image.style = payload.style
    image.complexity = payload.complexity
    image.cost_min = payload.cost_min
    image.cost_max = payload.cost_max
    image.embedding = json.dumps(await embed_image_from_url(image.url))
    image.is_labelled = True
    db.commit()
    return {"status": "labelled", "image_id": image_id}


@router.post("/predict/{image_id}")
async def predict_decor_cost(image_id: int, db: Session = Depends(get_db)):
    image = db.query(DecorImage).filter(DecorImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Decor image not found")
    embedding = json.loads(image.embedding) if image.embedding else await embed_image_from_url(image.url)
    if not image.embedding:
        image.embedding = json.dumps(embedding)
        db.commit()
    return predict_cost(embedding)
