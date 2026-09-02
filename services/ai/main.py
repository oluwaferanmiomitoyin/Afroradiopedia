import io
import logging
import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel

from constants import SPECIALIST_MAP
from gemini_engine import check_is_medical_image, run_gemini
from image_utils import fetch_image_bytes
from model import DiagnosticModel

logger = logging.getLogger(__name__)

_origins = [o.strip() for o in os.getenv("NEXTJS_URL", "http://localhost:3000").split(",") if o.strip()]

_API_KEY = os.getenv("API_KEY", "")
_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def _require_api_key(key: str | None = Depends(_api_key_header)) -> None:
    if not _API_KEY:
        return  # API_KEY not configured — open in dev mode
    if key != _API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")


app = FastAPI(title="AfroRadiopedia AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

diagnostic_model = DiagnosticModel()


class SimilarCase(BaseModel):
    condition: str
    diagnosis: str
    clinicalNotes: str


class AnalyzeRequest(BaseModel):
    image_url: str
    scan_type: str
    region: str | None = None
    symptoms: str = ""
    engine: str = "gemini"  # "gemini" | "medgemma"
    similar_cases: list[SimilarCase] = []


class AnalyzeResponse(BaseModel):
    findings: str
    confidence: float
    recommendedSpecialist: str
    engineUsed: str
    matchedCaseIds: list[str] = []
    matchedNotes: list[dict] = []


@app.get("/health")
def health():
    return {"status": "ok", "model_mode": diagnostic_model.mode, "model_version": diagnostic_model.version}


@app.post("/analyze", response_model=AnalyzeResponse, dependencies=[Depends(_require_api_key)])
async def analyze(req: AnalyzeRequest):
    similar_cases = [c.model_dump() for c in req.similar_cases]
    matched_notes = [
        {"condition": c["condition"], "notes": c["clinicalNotes"], "doctor": "AfroRadiopedia contributor"}
        for c in similar_cases
    ]

    engine_used = "gemini"
    result: dict | None = None

    if req.engine == "medgemma" and diagnostic_model.mode == "real":
        try:
            if not await check_is_medical_image(req.image_url, req.scan_type):
                result = {
                    "findings": (
                        "This doesn't appear to be a valid medical scan. Please upload a clear "
                        "X-ray, CT, MRI, or other diagnostic image for analysis."
                    ),
                    "confidence": 0.0,
                    "recommendedSpecialist": SPECIALIST_MAP.get(req.scan_type, "General Specialist"),
                }
            else:
                image_bytes = await fetch_image_bytes(req.image_url)
                image = Image.open(io.BytesIO(image_bytes))
                result = diagnostic_model.predict(image, req.scan_type, req.region, req.symptoms, similar_cases)
            engine_used = "medgemma"
        except UnidentifiedImageError as exc:
            raise HTTPException(status_code=400, detail="Invalid image format") from exc
        except Exception:
            logger.exception("MedGemma inference failed — falling back to Gemini")
            result = None

    if result is None:
        result = await run_gemini(req.image_url, req.scan_type, req.symptoms, similar_cases)
        engine_used = "gemini"

    return AnalyzeResponse(
        **result,
        engineUsed=engine_used,
        matchedCaseIds=[],
        matchedNotes=matched_notes,
    )
