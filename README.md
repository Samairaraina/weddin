# WeddingBudget.ai

WeddingBudget.ai is a hackathon-ready planning platform for luxury Indian weddings. It combines a FastAPI budget engine, a React dashboard, decor intelligence hooks, PDF export, and a bonus RSVP workflow.

## Stack

- Backend: FastAPI, SQLAlchemy, SQLite
- Frontend: React, Vite, Tailwind CSS, Recharts
- ML: CLIP-compatible embedding layer with local fallback, sklearn prediction
- Integrations: Gemini narrative generation, Unsplash decor ingestion

## Project structure

- `backend/`: API, models, routers, ML helpers, PDF utility
- `frontend/`: React app, wizard, results dashboard, decor library, admin, RSVP
- `scripts/seed_images.py`: batch-seeds decor images into SQLite

## Local setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:8000`.

## Environment

Copy `.env.example` to `.env` and fill in:

- `GEMINI_API_KEY`
- `UNSPLASH_ACCESS_KEY`
- `VITE_API_BASE` for production frontend builds

## Key routes

- `POST /api/budget/estimate`
- `GET /api/budget/estimate/{session_id}`
- `POST /api/budget/narrative/{session_id}`
- `GET /api/budget/pdf/{session_id}`
- `GET /api/decor/library`
- `POST /api/decor/scrape/{function_type}`
- `POST /api/decor/predict/{id}`
- `GET /api/artists`
- `GET /api/logistics/estimate`
- `POST /api/rsvp/event`
- `POST /api/rsvp/respond`

## Notes

- Admin routes are intentionally unauthenticated for the hackathon prototype.
- The embedding layer falls back to deterministic vectors if CLIP is unavailable, so the demo still works offline.
- The narrative endpoint falls back to a local summary when Gemini credentials are absent.
