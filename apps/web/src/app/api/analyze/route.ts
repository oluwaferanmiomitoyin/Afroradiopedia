import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

// The engine only enforces this when it has API_KEY set (open in local dev),
// so an unset value here is correct locally and a 401 in production.
const AI_SERVICE_API_KEY = process.env.AI_SERVICE_API_KEY;

// "Quick check" (Gemini) is fast and predictable; "Deep scan" (self-hosted
// MedGemma, CPU-only for now) can legitimately take well over a minute.
const TIMEOUTS_MS = { gemini: 30_000, medgemma: 150_000 } as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl, scanType, region, symptoms, engine } = body;

    if (!imageUrl || !scanType) {
      return NextResponse.json(
        { error: "imageUrl and scanType are required" },
        { status: 400 }
      );
    }

    const selectedEngine: "gemini" | "medgemma" = engine === "medgemma" ? "medgemma" : "gemini";

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const similarCases = await convex.query(api.cases.getSimilarCases, {
      scanType,
      region: region || undefined,
    });

    // Call the FastAPI AI microservice
    const aiResponse = await fetch(`${AI_SERVICE_URL}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(AI_SERVICE_API_KEY ? { "X-API-Key": AI_SERVICE_API_KEY } : {}),
      },
      body: JSON.stringify({
        image_url: imageUrl,
        scan_type: scanType,
        symptoms,
        engine: selectedEngine,
        similar_cases: similarCases,
      }),
      signal: AbortSignal.timeout(TIMEOUTS_MS[selectedEngine]),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI service responded with ${aiResponse.status}`);
    }

    const result = await aiResponse.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
