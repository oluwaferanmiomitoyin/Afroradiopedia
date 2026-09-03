# AfroRadiopedia

AI-powered diagnostic platform for African doctors in remote and underserved areas. Upload medical scans (X-rays, mammograms, MRI, etc.), get AI-powered findings from Gemini Vision, and see notes from real doctors who've treated similar cases.

## Monorepo Structure

```
afroradiopedia/
└── apps/
    └── web/              # Next.js 15 app (Vercel)
```

The diagnostic engine lives in its **own repository** — it is a PyTorch
service that cannot run on Vercel (an 8GB model held in a warm process,
inference well past any serverless timeout), and it is deployed and scaled
independently. This app reaches it over HTTP via `AI_SERVICE_URL`; that
single variable is the entire coupling between them.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend & Backend | Next.js 15 (App Router) |
| Database | Convex |
| Auth | Auth.js v5 (NextAuth) with Google OAuth |
| Image Storage | Cloudinary |
| AI Inference | FastAPI + Gemini 1.5 Flash Vision |
| Deployment | Vercel (web) + Hugging Face Space / Render (AI service, separate repo) |

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

### 2. Diagnostic engine (separate repo)

Only needed if you want live analysis locally — otherwise leave it down and
the analyze page will surface the error rather than silently faking a result.

```bash
git clone <your-diagnostic-engine-repo> afroradiopedia-ai
cd afroradiopedia-ai
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add GEMINI_API_KEY; add HF_TOKEN too if you want the MedGemma engine
uvicorn main:app --reload --port 8000
```

Leave `API_KEY` unset locally — the service is then open, which is what
`apps/web` expects when `AI_SERVICE_API_KEY` is also unset.

## Environment Variables

### apps/web/.env.local — and the same list on Vercel

Everything here except the two marked *local only* must also be set in the
Vercel project (Settings → Environment Variables).

| Variable | Where to get it | Vercel? |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Convex dashboard → Settings → Deployment URL | yes |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | Same page, the `.convex.site` one | yes |
| `CONVEX_DEPLOYMENT` | Written by `npx convex dev` | *local only* |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | yes |
| `NEXTAUTH_URL` | Your deployed origin, e.g. `https://afroradiopedia.vercel.app` | yes |
| `GOOGLE_CLIENT_ID` | [console.cloud.google.com](https://console.cloud.google.com) → Credentials | yes |
| `GOOGLE_CLIENT_SECRET` | Same as above | yes |
| `CLOUDINARY_CLOUD_NAME` | [cloudinary.com](https://cloudinary.com) → Dashboard | yes |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard | yes |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard | yes |
| `CONVEX_JWT_PRIVATE_KEY` | RS256 private key, PKCS#8 PEM (see below) | yes |
| `NEXT_PUBLIC_ADMIN_EMAILS` | Comma-separated admin emails | yes |
| `AI_SERVICE_URL` | `http://localhost:8000` locally; your Space/Render URL in production | yes |
| `AI_SERVICE_API_KEY` | Must equal `API_KEY` on the engine. Leave unset locally | yes |

`NEXTAUTH_URL` must match the deployed origin exactly, and that origin must
also be registered as an authorised redirect URI in the Google console, or
sign-in fails in production while working fine locally.

#### CONVEX_JWT_PRIVATE_KEY

A full PKCS#8 PEM — the `-----BEGIN PRIVATE KEY-----` and
`-----END PRIVATE KEY-----` lines included, with real newlines.
`importPKCS8` in `src/lib/convexToken.ts` rejects a bare base64 body, and it
rejects a PKCS#1 key (`-----BEGIN RSA PRIVATE KEY-----`) too. Generate a
matching pair with:

```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private.pem
openssl rsa -in private.pem -pubout -out public.pem
```

The public half is published as the JWKS in `convex/auth.config.ts`, which is
committed — it is a public key, and Convex needs it to verify the tokens this
app signs. Only the private half is a secret. Pasting the PEM into Vercel
keeps its newlines; if your shell or CI flattens it to `\n`, un-escape it
before `importPKCS8` sees it.

### Diagnostic engine (its own repo, its own host)

| Variable | Notes |
|---|---|
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) → Get API key |
| `HF_TOKEN` | Needed for the MedGemma engine; without it every request serves via Gemini |
| `API_KEY` | Set this in production and mirror it as `AI_SERVICE_API_KEY` on Vercel |
| `ALLOWED_IMAGE_HOSTS` | Optional allowlist, e.g. your Cloudinary host |
| `NEXTJS_URL` | Your Vercel origin, for CORS |

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

### Vercel — the Next.js app

1. Import this repo in Vercel with **root directory `apps/web`**.
2. Add every variable from the table above that is marked *yes*.
3. Deploy, then set `NEXTAUTH_URL` to the resulting origin and add that
   origin to the Google OAuth authorised redirect URIs.

Convex is not deployed by Vercel — it is its own hosted backend. Push schema
and function changes with `npx convex deploy` from `apps/web`.

### The diagnostic engine — not Vercel

It cannot run as a Vercel function: MedGemma is held in a warm process
(~8GB in bf16), a CPU inference runs well past any serverless timeout, and
PyTorch alone exceeds the 250MB bundle cap.

**Hugging Face Space (recommended)** — the engine repo's `Dockerfile` already
targets port 7860 and its README carries the Spaces frontmatter. Create a
Docker Space, push the repo, and set `GEMINI_API_KEY`, `HF_TOKEN` and
`API_KEY` as Space secrets. Free CPU Spaces have the RAM to actually hold the
model, and the weights come from HF with no egress.

**Render** — works, but the free tier cannot fit PyTorch, so the build must
use `requirements-deploy.txt`, which drops torch and silently degrades every
request to Gemini. Fine as a stopgap; it is not running your model.

Either way, copy the resulting URL into `AI_SERVICE_URL` on Vercel and set
`AI_SERVICE_API_KEY` to the same value as the engine's `API_KEY`.
