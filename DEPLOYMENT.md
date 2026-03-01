# Stellanet Deployment Guide

This project is easiest to host as:

- Frontend (React + Vite): Vercel
- Backend (FastAPI): Render

---

## 0) Security first (required)

Before deploying, rotate any secrets that were stored in local `.env` files.

- Rotate SMTP app password
- Rotate AWS keys/tokens if exposed
- Never commit `.env` files

---

## 1) Push code to GitHub

1. Create a GitHub repo.
2. Push this project.
3. Confirm these files exist:
   - `backend/main.py`
   - `backend/requirements.txt`
   - `frontend/Stellanet/package.json`

---

## 2) Deploy backend on Render

1. Go to Render dashboard → **New** → **Web Service**.
2. Connect GitHub and select your repo.
3. Use these settings:
   - **Root directory:** `backend`
   - **Environment:** `Python`
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables in Render:
   - `AWS_REGION`
   - `NOVA_ENABLED`
   - `NOVA_TEXT_MODEL_ID`
   - `OPENALEX_MAILTO`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USERNAME`
   - `SMTP_PASSWORD`
   - `SMTP_FROM`
   - `SMTP_USE_TLS`
   - `AUTH_EXPOSE_TOKENS=false`
   - `FRONTEND_URL` (set this after frontend deploy URL is known)
5. Deploy and copy backend URL, for example:
   - `https://stellanet-api.onrender.com`
6. Test:
   - `GET https://stellanet-api.onrender.com/` should return running message.

---

## 3) Deploy frontend on Vercel

1. Go to Vercel → **Add New Project** → import same repo.
2. Configure:
   - **Root directory:** `frontend/Stellanet`
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
3. Add env var:
   - `VITE_API_BASE_URL=https://YOUR_RENDER_BACKEND_URL`
4. Deploy and copy frontend URL, for example:
   - `https://stellanet.vercel.app`

---

## 4) Final wiring

1. In Render backend env vars, set:
   - `FRONTEND_URL=https://YOUR_VERCEL_FRONTEND_URL`
2. Redeploy backend.

---

## 5) Smoke test checklist

1. Sign up / sign in works.
2. Discover works without CORS errors.
3. Results show matches and contact email badges.
4. Draft rewrite works.
5. Copy email button copies professor email.

---

## Optional custom domain

- Vercel: add domain in Project Settings → Domains.
- Render: add custom domain in service settings.
- Update `FRONTEND_URL` to custom frontend domain.
