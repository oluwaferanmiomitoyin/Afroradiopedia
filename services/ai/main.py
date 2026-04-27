from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from dotenv import load_dotenv
import httpx
import os
import json

load_dotenv()

app = FastAPI(title="AfroRadiopedia AI Service")

_origins = [o.strip() for o in os.getenv("NEXTJS_URL", "http://localhost:3000").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

SPECIALIST_MAP = {
    "chest_xray": "Pulmonologist / Radiologist",
    "mammogram": "Oncologist / Breast Surgeon",
    "bone_xray": "Orthopedic Surgeon",
    "mri": "Neurologist / Radiologist",
    "ct_scan": "Radiologist",
    "ultrasound": "Radiologist / Obstetrician",
    "other": "General Specialist",
}


class AnalyzeRequest(BaseModel):
    image_url: str
    scan_type: str
    symptoms: str = ""


class AnalyzeResponse(BaseModel):
    findings: str
    confidence: float
    recommendedSpecialist: str
    matchedCaseIds: list[str] = []
    matchedNotes: list[dict] = []


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured")

    scan_label = req.scan_type.replace("_", " ").title()
    specialist = SPECIALIST_MAP.get(req.scan_type, "General Specialist")

    prompt = f"""You are an expert radiologist assisting a doctor in a remote African clinic.

A {scan_label} image has been uploaded.
Patient symptoms / clinical history: {req.symptoms or "Not provided"}

Analyze the image and provide:
1. Key findings visible in the scan (be specific and clinical)
2. Most likely diagnosis or differential diagnoses
3. Confidence level as a decimal between 0 and 1
4. Any red flags or urgent findings

Respond ONLY with valid JSON in this exact format:
{{
  "findings": "...",
  "confidence": 0.85,
  "urgentFlags": "..."
}}"""

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": await _fetch_image_base64(req.image_url),
                        }
                    },
                ]
            }
        ],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 1024},
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            json=payload,
        )

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Gemini API error")

    text = response.json()["candidates"][0]["content"]["parts"][0]["text"]

    # Parse JSON from Gemini response
    try:
        # Strip markdown code blocks if present
        clean = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        result = json.loads(clean)
    except Exception:
        # Fallback if Gemini doesn't return clean JSON
        result = {
            "findings": text,
            "confidence": 0.7,
            "urgentFlags": "",
        }

    return AnalyzeResponse(
        findings=result.get("findings", "Unable to determine findings."),
        confidence=float(result.get("confidence", 0.7)),
        recommendedSpecialist=specialist,
        matchedCaseIds=[],
        matchedNotes=[],
    )


async def _fetch_image_base64(url: str) -> str:
    """Download image from Cloudinary URL and return as base64 string."""
    import base64
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(url)
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Could not fetch image")
    return base64.b64encode(response.content).decode("utf-8")
