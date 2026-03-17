from __future__ import annotations

import json
import pickle
from pathlib import Path

import numpy as np
from sklearn.ensemble import RandomForestRegressor

from models import DecorImage, SessionLocal

MODEL_DIR = Path(__file__).resolve().parent
MODEL_MIN = MODEL_DIR / "model_min.pkl"
MODEL_MAX = MODEL_DIR / "model_max.pkl"


def train_cost_model() -> dict:
    db = SessionLocal()
    try:
        labelled = db.query(DecorImage).filter(DecorImage.is_labelled.is_(True), DecorImage.embedding.isnot(None)).all()
        if len(labelled) < 3:
            return {"error": "Need at least 3 labelled images to train in prototype mode"}

        x = np.array([json.loads(img.embedding) for img in labelled])
        y_min = np.array([img.cost_min or 0 for img in labelled])
        y_max = np.array([img.cost_max or 0 for img in labelled])

        model_min = RandomForestRegressor(n_estimators=50, random_state=42)
        model_max = RandomForestRegressor(n_estimators=50, random_state=42)
        model_min.fit(x, y_min)
        model_max.fit(x, y_max)

        with MODEL_MIN.open("wb") as file_min:
            pickle.dump(model_min, file_min)
        with MODEL_MAX.open("wb") as file_max:
            pickle.dump(model_max, file_max)
        return {"trained_on": len(labelled), "status": "success"}
    finally:
        db.close()


def predict_cost(embedding: list[float]) -> dict:
    if not MODEL_MIN.exists() or not MODEL_MAX.exists():
        mean_value = int(np.mean(np.abs(np.array(embedding))) * 700000)
        return {"predicted_min": max(60000, mean_value), "predicted_max": max(120000, int(mean_value * 1.8)), "confidence": "heuristic_fallback"}

    with MODEL_MIN.open("rb") as file_min:
        model_min = pickle.load(file_min)
    with MODEL_MAX.open("rb") as file_max:
        model_max = pickle.load(file_max)

    x = np.array(embedding).reshape(1, -1)
    return {"predicted_min": int(model_min.predict(x)[0]), "predicted_max": int(model_max.predict(x)[0]), "confidence": "ml_predicted"}
