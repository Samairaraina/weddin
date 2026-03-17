from __future__ import annotations

import hashlib
import io
import json
import os
from functools import lru_cache
from pathlib import Path

import httpx
import numpy as np
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parents[2]
os.environ.setdefault("HF_HOME", str(PROJECT_ROOT / ".hf-home"))

try:
    import torch
    from transformers import CLIPModel, CLIPProcessor
except Exception:
    torch = None
    CLIPModel = None
    CLIPProcessor = None

MODEL_NAME = "openai/clip-vit-base-patch32"


@lru_cache(maxsize=1)
def _load_model():
    if CLIPModel is None or CLIPProcessor is None or torch is None:
        return None, None
    return CLIPModel.from_pretrained(MODEL_NAME), CLIPProcessor.from_pretrained(MODEL_NAME)


def _fallback_embedding(seed: str) -> list[float]:
    values = []
    for idx in range(512):
        digest = hashlib.sha256(f"{seed}:{idx}".encode("utf-8")).digest()
        values.append((int.from_bytes(digest[:4], "big") / 2**32) * 2 - 1)
    vector = np.array(values, dtype=np.float32)
    vector = vector / np.linalg.norm(vector)
    return vector.tolist()


async def embed_image_from_url(url: str) -> list[float]:
    model, processor = _load_model()
    if model is None or processor is None or torch is None:
        return _fallback_embedding(url)

    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=20)
        response.raise_for_status()
        image = Image.open(io.BytesIO(response.content)).convert("RGB")

    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        features = model.get_image_features(**inputs)
        features = features / features.norm(dim=-1, keepdim=True)
    return json.loads(json.dumps(features.squeeze().tolist()))


def cosine_similarity(a: list[float], b: list[float]) -> float:
    vec_a = np.array(a)
    vec_b = np.array(b)
    denom = np.linalg.norm(vec_a) * np.linalg.norm(vec_b)
    if not denom:
        return 0.0
    return float(np.dot(vec_a, vec_b) / denom)
