# Stellanet

Stellanet helps students and early researchers find the right professors faster and send better outreach emails.
It combines research discovery, fit scoring, and AI-assisted drafting in one workflow.

## What Stellanet Does Today

- Finds professor candidates from real publication and affiliation signals.
- Ranks matches by your research interest and profile context.
- Shows trust-focused details: why-match bullets, score breakdowns, and recent paper snippets.
- Includes professor contact email when available (verified or likely-inferred).
- Generates editable outreach drafts and supports rewrite actions by tone/goal.
- Supports account flows (signup, verify email, sign in, password reset).

## What I Am Building Next

Stellanet is being built toward a full academic networking and outreach copilot.

Planned direction:

- Better ranking quality with stronger relevance and recency controls.
- More reliable contact enrichment and transparent confidence signals.
- Saved projects/workspaces so users can manage outreach campaigns over time.
- Draft history/versioning and higher-quality personalization controls.
- Team or advisor review workflow before sending.
- Production-grade monitoring, testing, and quality guardrails.

## Who Can Use Stellanet

- Undergraduate students looking for research opportunities.
- Master’s and PhD applicants preparing targeted faculty outreach.
- Current grad students seeking collaborators or lab transitions.
- Career changers entering research-heavy domains.
- Advisors/mentors helping students run structured outreach.

## Why This Matters

Most students waste time sending generic emails to poorly matched professors.
Stellanet is designed to make outreach more focused, evidence-based, and respectful of faculty time.

## Project Structure

- `frontend/Stellanet` - React + Vite frontend.
- `backend` - FastAPI backend, OpenAlex retrieval, ranking, rewrite, and auth APIs.
- `DEPLOYMENT.md` - deployment notes for Render + Vercel.

## Local Development

Create local env files from examples:

```bash
cp backend/.env.example backend/.env
cp frontend/Stellanet/.env.example frontend/Stellanet/.env
```

### 1) Start backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 2) Start frontend

```bash
cd frontend/Stellanet
npm install
npm run dev
```

Then update the copied `.env` files with your own keys (AWS/email/database) as needed.

