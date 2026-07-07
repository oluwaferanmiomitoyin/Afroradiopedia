---
title: AfroRadiopedia Diagnostic Engine
emoji: 🩻
colorFrom: teal
colorTo: blue
sdk: docker
app_port: 7860
---

# AfroRadiopedia AI Service

A FastAPI microservice that interprets uploaded scans (X-ray, CT, MRI, ultrasound) and returns findings, a likely diagnosis, and a recommended specialist. Every request is grounded with similar, doctor-reviewed cases pulled from AfroRadiopedia's own knowledge base.

This service offers two engines, selected by the caller (`engine: "gemini" | "medgemma"` in the `/analyze` request):

- **`gemini`** ("Quick check") — calls Gemini 1.5 Flash. Fast (~10s), no self-hosted compute needed.
- **`medgemma`** ("Deep scan") — runs **MedGemma 1.5 4B-it** locally in this service. Slower on CPU (expect well over a minute on a free-tier instance), but it's our own model and the one we intend to fine-tune as the case knowledge base grows. Automatically falls back to `gemini` if MedGemma isn't loaded or inference fails.

---

## Authorship and Attribution

### This service (the wrapper)

The FastAPI service, the Gemini/MedGemma routing and fallback logic, the knowledge-base grounding, and the training scripts in this repository were written by the AfroRadiopedia team.

### The AI model (MedGemma)

The MedGemma model weights, architecture, and license are the work of **Google** / the Health AI Developer Foundations team.

> **Original model:** [google/medgemma-1.5-4b-it](https://huggingface.co/google/medgemma-1.5-4b-it) on Hugging Face
> **License:** Health AI Developer Foundations terms of use — you must accept these on the model page before a Hugging Face access token can download the weights.

We are integrators and licensees of this model — not its authors. Using it requires:
1. A Hugging Face account.
2. Accepting the Health AI Developer Foundations terms on the model page above.
3. A read-access token, set as `HF_TOKEN` (see `.env.example`).

Without `HF_TOKEN`, the `medgemma` engine reports itself as unavailable (`GET /health`) and every request is served by `gemini` instead — no crash, no silent wrong answers.

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service health, active model mode (`real` / `unavailable`), version |
| `POST` | `/analyze` | `{ image_url, scan_type, region?, symptoms?, engine, similar_cases? }` → findings |

### Response shape

```json
{
  "findings": "...",
  "confidence": 0.82,
  "recommendedSpecialist": "Pulmonologist / Radiologist",
  "engineUsed": "gemini",
  "matchedCaseIds": [],
  "matchedNotes": [{ "condition": "...", "notes": "...", "doctor": "AfroRadiopedia contributor" }]
}
```

`engineUsed` tells the caller which engine actually answered — it may differ from the requested `engine` if MedGemma was requested but unavailable and the request fell back to Gemini.

---

## Fine-tuning on our own data (`prepare_data.py` + `train.py`)

As doctors contribute and admins approve cases, `prepare_data.py` exports them into an image+caption dataset, and `train.py` LoRA fine-tunes MedGemma on it (full fine-tuning a 4B model isn't realistic on our budget — a LoRA adapter is). Not run yet — there isn't enough approved case volume for fine-tuning to help. See the scripts' docstrings for usage once there is.
