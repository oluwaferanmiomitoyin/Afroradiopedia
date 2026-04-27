import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role;

  // Protect doctor routes — login required, role enforcement added when patient portal exists
  if (pathname.startsWith("/doctor")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login?callbackUrl=/doctor/dashboard", req.url));
    }
  }

  // Protect patient routes (loose — allow anonymous access to /analyze)
  if (pathname.startsWith("/patient/history")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/doctor/:path*", "/patient/:path*"],
};
