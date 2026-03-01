# Stellanet Frontend

Stellanet is an AI-powered academic outreach app that helps students discover faculty matches and generate personalized outreach drafts faster.

This folder contains the React + Vite frontend for the Stellanet platform.

## Core Features

- Modern startup-style UX for home, auth, workspace, results, and draft flow
- Faculty discovery workflow with ranking and trust cues
- Results cards with match score, why-match insights, and paper snippets
- Draft editor with rewrite controls and copy actions
- Professor contact email display (verified/likely labeling)

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- ESLint

## Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create env file:
   ```bash
   cp .env.example .env
   ```
3. Set API base URL:
   ```env
   VITE_API_BASE_URL=http://127.0.0.1:8000
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```

## Build for Production

```bash
npm run build
npm run preview
```

## Related Services

- Backend API (FastAPI) lives in `../../backend`
- Full deployment guide is at `../../DEPLOYMENT.md`
