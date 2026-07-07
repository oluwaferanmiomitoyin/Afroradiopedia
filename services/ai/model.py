"""
DiagnosticModel — wraps Google's MedGemma 1.5 4B-it for self-hosted,
multimodal scan interpretation (X-ray / CT / MRI, any body region).

Requires a Hugging Face access token with the Health AI Developer
Foundations terms accepted on the model page — see README.md. If the
token is missing or loading fails for any reason, `mode` stays
"unavailable" and main.py falls back to Gemini instead of crashing.
"""
import logging
import os

import torch
from PIL import Image

from constants import SPECIALIST_MAP

logger = logging.getLogger(__name__)

MODEL_ID = "google/medgemma-1.5-4b-it"
MAX_NEW_TOKENS = 512


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


def _build_prompt(scan_type: str, region: str | None, symptoms: str, similar_cases: list[dict]) -> str:
    scan_label = scan_type.replace("_", " ").title()
    region_label = f" ({region.replace('_', ' ')})" if region else ""
    examples = _format_similar_cases(similar_cases)

    return (
        "You are an expert radiologist assisting a doctor in a remote African clinic.\n\n"
        f"A {scan_label}{region_label} image has been uploaded.\n"
        f"Patient symptoms / clinical history: {symptoms or 'Not provided'}{examples}\n\n"
        "Describe the key findings visible in the image, the most likely diagnosis or "
        "differential diagnoses, and any red flags or urgent findings. Be specific and clinical."
    )


class DiagnosticModel:
    """Loads MedGemma at startup; falls back to 'unavailable' on any failure."""

    def __init__(self) -> None:
        self.version = "medgemma-1.5-4b-it"
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.mode = "unavailable"
        self._model = None
        self._processor = None

        hf_token = os.getenv("HF_TOKEN", "")
        if not hf_token:
            logger.warning("HF_TOKEN not set — MedGemma disabled, Gemini will be used instead.")
            return

        try:
            self._load_model(hf_token)
            self.mode = "real"
        except Exception:
            logger.exception("Failed to load MedGemma — falling back to Gemini.")
            self.mode = "unavailable"

    def _load_model(self, hf_token: str) -> None:
        from transformers import AutoModelForImageTextToText, AutoProcessor

        logger.info("Loading MedGemma (%s) onto %s — this can take a while on first run …", MODEL_ID, self.device)
        self._model = AutoModelForImageTextToText.from_pretrained(
            MODEL_ID, torch_dtype=torch.bfloat16, device_map="auto", token=hf_token,
        )
        self._processor = AutoProcessor.from_pretrained(MODEL_ID, token=hf_token)
        logger.info("MedGemma loaded.")

    def predict(
        self,
        image: Image.Image,
        scan_type: str,
        region: str | None,
        symptoms: str,
        similar_cases: list[dict],
    ) -> dict:
        if self.mode != "real" or self._model is None or self._processor is None:
            raise RuntimeError("MedGemma is not available")

        prompt = _build_prompt(scan_type, region, symptoms, similar_cases)
        messages = [{
            "role": "user",
            "content": [
                {"type": "image", "image": image.convert("RGB")},
                {"type": "text", "text": prompt},
            ],
        }]

        inputs = self._processor.apply_chat_template(
            messages, add_generation_prompt=True, tokenize=True,
            return_dict=True, return_tensors="pt",
        ).to(self._model.device, dtype=torch.bfloat16)

        input_len = inputs["input_ids"].shape[-1]
        with torch.inference_mode():
            generation = self._model.generate(**inputs, max_new_tokens=MAX_NEW_TOKENS, do_sample=False)
            generation = generation[0][input_len:]

        findings = self._processor.decode(generation, skip_special_tokens=True).strip()

        return {
            "findings": findings,
            # MedGemma doesn't emit a calibrated confidence score the way our
            # Gemini JSON prompt does — this is a placeholder until we have
            # enough reviewed cases to calibrate one against ground truth.
            "confidence": 0.75,
            "recommendedSpecialist": SPECIALIST_MAP.get(scan_type, "General Specialist"),
        }
