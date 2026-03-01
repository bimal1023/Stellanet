# Stellanet

Stellanet is an AI-powered academic outreach platform that helps students find relevant faculty and prepare personalized outreach drafts with confidence.

## What It Does

- Discovers faculty candidates from research signals
- Ranks matches with trust-focused evidence
- Shows recent-paper context and match breakdowns
- Generates editable outreach drafts with rewrite controls
- Surfaces professor contact email when available (verified/likely)

## Project Structure

- `frontend/Stellanet` — React + Vite frontend
- `backend` — FastAPI backend, OpenAlex retrieval, ranking/rewrite pipeline
- `DEPLOYMENT.md` — deployment guide (Render + Vercel)

## Local Development

### 1) Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 2) Frontend

```bash
cd frontend/Stellanet
npm install
npm run dev
```

Set `VITE_API_BASE_URL` in frontend `.env` to your backend URL, e.g.:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Deployment

Follow `DEPLOYMENT.md` for production hosting steps.
