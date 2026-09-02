"""
train.py — LoRA fine-tune MedGemma on AfroRadiopedia's own approved cases.

Full fine-tuning a 4B-parameter model isn't realistic on our budget — this
trains a small LoRA adapter instead (a few million trainable params), saved
separately from the base MedGemma weights and loaded on top of them.

Not run yet — there isn't enough approved case volume (prepare_data.py's
output) for this to meaningfully improve anything. Kept here so the path
exists once there is; revisit batch size / epochs once we have real data
and know what compute we're training on.

Expected input: the JSONL produced by prepare_data.py
  {"image_url": "...", "scan_type": "...", "region": "...", "caption": "..."}

Usage
-----
HF_TOKEN=<token with MedGemma terms accepted> \
python train.py --data data/cases.jsonl --output adapters/medgemma-afroradiopedia
"""
import argparse
import io
import json
import os

import requests
import torch
from PIL import Image
from torch.utils.data import DataLoader, Dataset

from model import MODEL_ID

EPOCHS = 3
BATCH_SIZE = 2  # small — a 4B model leaves little memory headroom for batching
LR = 1e-4
LORA_RANK = 8


class CaseDataset(Dataset):
    def __init__(self, jsonl_path: str):
        with open(jsonl_path) as f:
            self.records = [json.loads(line) for line in f if line.strip()]

    def __len__(self) -> int:
        return len(self.records)

    def __getitem__(self, idx: int) -> dict:
        record = self.records[idx]
        response = requests.get(record["image_url"], timeout=15)
        response.raise_for_status()
        image = Image.open(io.BytesIO(response.content)).convert("RGB")
        return {"image": image, "scan_type": record["scan_type"], "region": record.get("region"), "caption": record["caption"]}


def _build_training_messages(scan_type: str, region: str | None, caption: str, image: Image.Image) -> list[dict]:
    scan_label = scan_type.replace("_", " ").title()
    region_label = f" ({region.replace('_', ' ')})" if region else ""
    prompt = f"A {scan_label}{region_label} image has been uploaded. Describe the key findings and likely diagnosis."
    return [
        {"role": "user", "content": [{"type": "image", "image": image}, {"type": "text", "text": prompt}]},
        {"role": "assistant", "content": [{"type": "text", "text": caption}]},
    ]


def train(data_path: str, output_dir: str) -> None:
    from peft import LoraConfig, get_peft_model
    from transformers import AutoModelForImageTextToText, AutoProcessor

    hf_token = os.environ["HF_TOKEN"]
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")

    processor = AutoProcessor.from_pretrained(MODEL_ID, token=hf_token)
    base_model = AutoModelForImageTextToText.from_pretrained(
        MODEL_ID, torch_dtype=torch.bfloat16, token=hf_token,
    ).to(device)

    lora_config = LoraConfig(
        r=LORA_RANK,
        lora_alpha=LORA_RANK * 2,
        target_modules=["q_proj", "v_proj"],
        lora_dropout=0.05,
        task_type="CAUSAL_LM",
    )
    model = get_peft_model(base_model, lora_config)
    model.print_trainable_parameters()

    dataset = CaseDataset(data_path)
    loader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True)
    optimizer = torch.optim.AdamW(model.parameters(), lr=LR)

    model.train()
    for epoch in range(1, EPOCHS + 1):
        total_loss = 0.0
        for batch in loader:
            messages_batch = [
                _build_training_messages(s, r, c, img)
                for s, r, c, img in zip(batch["scan_type"], batch["region"], batch["caption"], batch["image"])
            ]
            inputs = processor.apply_chat_template(
                messages_batch, add_generation_prompt=False, tokenize=True,
                return_dict=True, return_tensors="pt",
            ).to(device, dtype=torch.bfloat16)

            outputs = model(**inputs, labels=inputs["input_ids"])
            loss = outputs.loss

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        print(f"[epoch {epoch}/{EPOCHS}] avg loss = {total_loss / max(len(loader), 1):.4f}")

    os.makedirs(output_dir, exist_ok=True)
    model.save_pretrained(output_dir)
    print(f"LoRA adapter saved → {output_dir}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LoRA fine-tune MedGemma on AfroRadiopedia cases")
    parser.add_argument("--data", default="data/cases.jsonl", help="JSONL from prepare_data.py")
    parser.add_argument("--output", default="adapters/medgemma-afroradiopedia", help="Output adapter directory")
    args = parser.parse_args()
    train(args.data, args.output)
