import base64
import json
import os

import httpx
from fastapi import HTTPException

from constants import SPECIALIST_MAP
from image_utils import fetch_image_bytes

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"


def _format_similar_cases(similar_cases: list[dict]) -> str:
    if not similar_cases:
        return ""
    formatted = "\n".join(
        f"- Condition: {c['condition']}. Diagnosis: {c['diagnosis']}. Notes: {c['clinicalNotes']}"
        for c in similar_cases
    )
    return (
        "\n\nFor reference, here are similar cases previously contributed and reviewed "
        f"by doctors on this platform:\n{formatted}"
    )


def _build_prompt(scan_type: str, symptoms: str, similar_cases: list[dict]) -> str:
    scan_label = scan_type.replace("_", " ").title()
    examples = _format_similar_cases(similar_cases)

    return f"""You are an expert radiologist assisting a doctor in a remote African clinic.

A {scan_label} image has been uploaded.
Patient symptoms / clinical history: {symptoms or "Not provided"}{examples}

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


async def check_is_medical_image(image_url: str, scan_type: str) -> bool:
    """Fast Gemini pre-check for the MedGemma path: is this actually a genuine
    scan, or a placeholder/photo/drawing? MedGemma doesn't reliably self-report
    this (it's heavily fine-tuned to always produce a clinical report), so we
    gate it externally instead. Fails open (returns True) on any error — a
    flaky pre-check should never block a real scan."""
    gemini_api_key = os.getenv("GEMINI_API_KEY", "")
    if not gemini_api_key:
        return True

    scan_label = scan_type.replace("_", " ").title()
    try:
        image_bytes = await fetch_image_bytes(image_url)
        payload = {
            "contents": [{"parts": [
                {"text": (
                    f"Is this image a genuine {scan_label} medical scan — not a placeholder, "
                    "photo, drawing, or blank/corrupted image? Answer with exactly one word: YES or NO."
                )},
                {"inline_data": {"mime_type": "image/jpeg", "data": base64.b64encode(image_bytes).decode("utf-8")}},
            ]}],
            "generationConfig": {"temperature": 0.0, "maxOutputTokens": 5},
        }
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(f"{GEMINI_URL}?key={gemini_api_key}", json=payload)
        if response.status_code != 200:
            return True
        text = response.json()["candidates"][0]["content"]["parts"][0]["text"].strip().upper()
        return "NO" not in text
    except Exception:
        return True


async def run_gemini(image_url: str, scan_type: str, symptoms: str, similar_cases: list[dict]) -> dict:
    gemini_api_key = os.getenv("GEMINI_API_KEY", "")
    if not gemini_api_key:
        raise HTTPException(status_code=503, detail="AI service not configured")

    image_bytes = await fetch_image_bytes(image_url)
    prompt = _build_prompt(scan_type, symptoms, similar_cases)

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": base64.b64encode(image_bytes).decode("utf-8"),
                        }
                    },
                ]
            }
        ],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 1024},
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(f"{GEMINI_URL}?key={gemini_api_key}", json=payload)

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Gemini API error")

    text = response.json()["candidates"][0]["content"]["parts"][0]["text"]

    try:
        clean = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        result = json.loads(clean)
    except Exception:
        result = {"findings": text, "confidence": 0.7, "urgentFlags": ""}

    return {
        "findings": result.get("findings", "Unable to determine findings."),
        "confidence": float(result.get("confidence", 0.7)),
        "recommendedSpecialist": SPECIALIST_MAP.get(scan_type, "General Specialist"),
    }
