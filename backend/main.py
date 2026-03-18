from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models import init_db
from routers import admin, artists, budget, decor, logistics, rsvp

load_dotenv()

app = FastAPI(title="WeddingBudget.ai API", version="1.0.0")

# Ensure SQLite tables and seed data exist even in script/test contexts
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(budget.router, prefix="/api/budget", tags=["Budget"])
app.include_router(decor.router, prefix="/api/decor", tags=["Decor"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(logistics.router, prefix="/api/logistics", tags=["Logistics"])
app.include_router(artists.router, prefix="/api/artists", tags=["Artists"])
app.include_router(rsvp.router, prefix="/api/rsvp", tags=["RSVP"])


@app.on_event("startup")
async def startup() -> None:
    init_db()


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "WeddingBudget.ai API is running"}


@app.get("/ping")
async def ping() -> dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
