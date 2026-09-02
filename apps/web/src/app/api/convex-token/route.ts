import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { auth } from "@/auth";
import { signConvexToken } from "@/lib/convexToken";
import { api } from "../../../../convex/_generated/api";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ token: null }, { status: 401 });
  }

  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const userId = await convex.mutation(api.users.upsertFromAuth, {
    name: session.user.name ?? "Doctor",
    email: session.user.email,
  });

  const token = await signConvexToken({
    userId,
    email: session.user.email,
    name: session.user.name ?? "",
  });

  return NextResponse.json({ token });
}
