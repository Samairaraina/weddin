from __future__ import annotations

import os

import httpx

FALLBACK_IMAGES = {
    "mehendi": ["https://images.unsplash.com/photo-1519741497674-611481863552", "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8"],
    "haldi": ["https://images.unsplash.com/photo-1519225421980-715cb0215aed", "https://images.unsplash.com/photo-1520854221256-17451cc331bf"],
    "sangeet": ["https://images.unsplash.com/photo-1511285560929-80b456fea0bc", "https://images.unsplash.com/photo-1469371670807-013ccf25f16a"],
    "baraat": ["https://images.unsplash.com/photo-1519167758481-83f550bb49b3", "https://images.unsplash.com/photo-1522673607200-164d1b6ce486"],
    "pheras": ["https://images.unsplash.com/photo-1513279922550-250c2129b13a", "https://images.unsplash.com/photo-1519225421980-715cb0215aed"],
    "reception": ["https://images.unsplash.com/photo-1522673607200-164d1b6ce486", "https://images.unsplash.com/photo-1511795409834-ef04bbd61622"],
}


async def fetch_unsplash_images(function_type: str, per_page: int = 12) -> list[dict]:
    access_key = os.getenv("UNSPLASH_ACCESS_KEY")
    query = f"indian wedding {function_type} decor"
    if access_key:
        async with httpx.AsyncClient() as client:
            response = await client.get("https://api.unsplash.com/search/photos", params={"query": query, "per_page": per_page}, headers={"Authorization": f"Client-ID {access_key}"}, timeout=20)
            response.raise_for_status()
            payload = response.json()
            return [{"url": image["urls"]["regular"], "thumbnail_url": image["urls"]["small"], "photographer": image["user"]["name"], "function_type": function_type} for image in payload.get("results", [])]

    images = FALLBACK_IMAGES.get(function_type, FALLBACK_IMAGES["reception"])
    return [{"url": image, "thumbnail_url": f"{image}?auto=format&fit=crop&w=800&q=80", "photographer": "Curated Demo Seed", "function_type": function_type} for image in images[:per_page]]
