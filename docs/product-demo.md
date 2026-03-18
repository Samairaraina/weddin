# Product And Demo Notes

## Goal

WeddingBudget.ai is a hackathon demo for luxury Indian wedding planning. The judging path is simple:

1. Complete the wizard.
2. Show the budget range and breakdown tabs.
3. Open decor inspiration and predict decor cost without live CLIP work.
4. Export the budget PDF.

## Demo-Safe Setup

- `scripts/seed_images.py --total 400` fetches and embeds decor images into SQLite.
- `scripts/cache_narratives.py` stores one narrative for each hotel tier scenario.
- `USE_CACHED_NARRATIVE=true` forces the backend to serve stored narrative text instead of calling Gemini during the live demo.
- `GET /ping` is available for Railway health checks.

## Architecture Asset

- Diagram HTML source: `docs/architecture-diagram.html`
- PNG export target: `docs/architecture-diagram.png`

## Hosted Verification Checklist

1. Open the Vercel URL.
2. Complete the wizard and submit.
3. Confirm the summary, breakdown, scenario, and AI tabs all load.
4. Open decor library, predict a decor cost, and confirm no runtime embedding fetch is needed.
5. Download the PDF from the hosted budget page.
