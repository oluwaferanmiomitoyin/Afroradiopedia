"""
prepare_data.py — export approved AfroRadiopedia cases into an image+caption
dataset for fine-tuning MedGemma (see train.py).

Not run yet — there isn't enough approved case volume for fine-tuning to
help. Kept here so the path exists once there is.

Requires an admin-authenticated bearer token (the same RS256 JWT bridge used
by the rest of the app — see apps/web/convex/lib/auth.ts / requireAdmin).
For one-off offline tooling like this, mint one with a short Node snippet
using the `jose` package and the same CONVEX_JWT_PRIVATE_KEY used in
apps/web/.env.local:

    node -e '
    const { SignJWT, importPKCS8 } = require("jose");
    (async () => {
      const key = await importPKCS8(process.env.CONVEX_JWT_PRIVATE_KEY, "RS256");
      const token = await new SignJWT({ email: "you@example.com", name: "You" })
        .setProtectedHeader({ alg: "RS256", kid: "convex-1" })
        .setSubject("offline-export").setIssuer("https://afroradiopedia.app")
        .setAudience("afroradiopedia").setIssuedAt().setExpirationTime("1h")
        .sign(key);
      console.log(token);
    })();'

(run from apps/web, with CONVEX_JWT_PRIVATE_KEY set in the environment, using
an email listed in the Convex ADMIN_EMAILS env var).

Usage
-----
CONVEX_URL=https://your-deployment.convex.cloud \
CONVEX_ADMIN_TOKEN=<token from above> \
python prepare_data.py --output data/cases.jsonl
"""
import argparse
import json
import os

import requests


def fetch_approved_cases(convex_url: str, admin_token: str) -> list[dict]:
    response = requests.post(
        f"{convex_url}/api/query",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"path": "cases:getAllApproved", "args": {}, "format": "json"},
        timeout=30,
    )
    response.raise_for_status()
    body = response.json()
    if body.get("status") != "success":
        raise RuntimeError(f"Convex query failed: {body.get('errorMessage')}")
    return body["value"]


def to_training_record(case: dict) -> dict:
    """One row per case: an image URL plus the caption MedGemma should learn
    to produce for it (condition + diagnosis + clinical notes)."""
    caption = (
        f"Findings: {case['condition']}. "
        f"Diagnosis: {case['diagnosis']}. "
        f"{case['clinicalNotes']}"
    )
    return {
        "image_url": case["imageUrl"],
        "scan_type": case["scanType"],
        "region": case.get("region"),
        "caption": caption,
    }


def prepare(convex_url: str, admin_token: str, output_path: str) -> None:
    cases = fetch_approved_cases(convex_url, admin_token)
    print(f"Fetched {len(cases)} approved cases")

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "w") as f:
        for case in cases:
            f.write(json.dumps(to_training_record(case)) + "\n")

    print(f"Wrote {len(cases)} records → {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export approved cases for MedGemma fine-tuning")
    parser.add_argument("--output", default="data/cases.jsonl", help="Output JSONL path")
    args = parser.parse_args()

    convex_url = os.environ["CONVEX_URL"]
    admin_token = os.environ["CONVEX_ADMIN_TOKEN"]
    prepare(convex_url, admin_token, args.output)
