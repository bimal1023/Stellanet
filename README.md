# Stellanet

Stellanet is an AI-assisted research outreach platform that helps students find relevant faculty and prepare higher-quality first-contact emails.

The product combines grounded discovery, transparent match reasoning, and controllable draft rewriting in a single workflow.

## Core Features

- Discover professor candidates from real publication and affiliation signals.
- Rank matches based on user research interest and profile context.
- Show trust details such as why-match bullets, score breakdowns, and recent paper snippets.
- Provide contact email signals when available (direct, inferred, or unavailable).
- Generate outreach drafts and rewrite by tone while keeping human review in control.
- Support authentication flows including signup/signin, email verification, and password reset.
- Support Google OAuth sign-in.

## Product Workflow

1. Set your interest, profile, and target universities.
2. Review ranked faculty matches with reasoning signals.
3. Generate and refine draft outreach.
4. Send only after manual review.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** FastAPI, Python
- **Model layer:** Amazon Nova (Bedrock)
- **Research data source:** OpenAlex
- **Auth and session store:** SQLite (local) or PostgreSQL (production)
- **Deployments:** Vercel (frontend), AWS App Runner (backend)

## Repository Structure

- `frontend/Stellanet` - frontend application
- `backend` - API, retrieval, ranking, rewrite, auth, and mailer logic

## Local Development

### 1) Create local environment files

```bash
cp backend/.env.example backend/.env
cp frontend/Stellanet/.env.example frontend/Stellanet/.env
```

### 2) Run backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 3) Run frontend

```bash
cd frontend/Stellanet
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

## Required Environment Notes

- Set `VITE_API_BASE_URL` in frontend env to your backend base URL.
- Set Bedrock credentials and model env vars in backend env for Nova-powered generation.
- Set `OPENALEX_MAILTO` for OpenAlex requests.
- For contact form delivery, set `CONTACT_TO_EMAIL` and either Resend or SMTP env vars.
- For Google sign-in, set frontend `VITE_GOOGLE_CLIENT_ID` and backend `GOOGLE_OAUTH_CLIENT_IDS`.

## Roadmap

- Improve ranking calibration and confidence transparency.
- Add saved workspaces and outreach history.
- Add stronger observability and automated quality checks.
- Expand personalization controls for draft generation and rewriting.

