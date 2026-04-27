import { NextResponse } from "next/server";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl, scanType, symptoms } = body;

    if (!imageUrl || !scanType) {
      return NextResponse.json(
        { error: "imageUrl and scanType are required" },
        { status: 400 }
      );
    }

    // Call the FastAPI AI microservice
    const aiResponse = await fetch(`${AI_SERVICE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: imageUrl, scan_type: scanType, symptoms }),
      signal: AbortSignal.timeout(30000), // 30s timeout
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
