# AfroRadiopedia

AI-powered diagnostic platform for African doctors in remote and underserved areas. Upload medical scans (X-rays, mammograms, MRI, etc.), get AI-powered findings from Gemini Vision, and see notes from real doctors who've treated similar cases.

## Monorepo Structure

```
afroradiopedia/
├── apps/
│   └── web/              # Next.js 15 app (Vercel)
└── services/
    └── ai/               # FastAPI AI microservice (Render)
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend & Backend | Next.js 15 (App Router) |
| Database | Convex |
| Auth | Auth.js v5 (NextAuth) with Google OAuth |
| Image Storage | Cloudinary |
| AI Inference | FastAPI + Gemini 1.5 Flash Vision |
| Deployment | Vercel (web) + Render (AI service) |

## Getting Started

### 1. Next.js App

```bash
cd apps/web
cp .env.example .env.local
# Fill in all values in .env.local
npm install
npx convex dev          # Start Convex local backend
npm run dev             # Start Next.js dev server
```

### 2. FastAPI AI Service

```bash
cd services/ai
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add your GEMINI_API_KEY to .env
uvicorn main:app --reload --port 8000
```

## Environment Variables

### apps/web/.env.local

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | `npx convex dev` outputs this |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | [console.cloud.google.com](https://console.cloud.google.com) → Credentials |
| `GOOGLE_CLIENT_SECRET` | Same as above |
| `CLOUDINARY_CLOUD_NAME` | [cloudinary.com](https://cloudinary.com) → Dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard |
| `AI_SERVICE_URL` | `http://localhost:8000` locally, Render URL in production |

### services/ai/.env

| Variable | Where to get it |
|---|---|
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) → Get API key (free) |

## App Routes

### Public
- `/` — Landing page
- `/analyze` — Upload scan + get AI analysis (no login required)
- `/login` — Sign in
- `/register` — Register as doctor or patient

### Doctor (requires login + doctor role)
- `/doctor/dashboard` — Overview + stats
- `/doctor/contribute` — Upload case with clinical notes
- `/doctor/my-cases` — Manage contributed cases

## Deployment

### Vercel (Next.js)
1. Push to GitHub
2. Import repo in Vercel
3. Add all env variables from `.env.example`
4. Deploy

### Render (FastAPI)
1. Create a new Web Service pointing to `services/ai/`
2. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add `GEMINI_API_KEY` as environment variable
5. Copy the Render URL to `AI_SERVICE_URL` in Vercel env vars
