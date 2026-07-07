import { SignJWT, importPKCS8 } from "jose";

const ISSUER = "https://afroradiopedia.app";
const AUDIENCE = "afroradiopedia";

let cachedKey: Awaited<ReturnType<typeof importPKCS8>> | null = null;

async function getPrivateKey() {
  if (cachedKey) return cachedKey;
  const pem = process.env.CONVEX_JWT_PRIVATE_KEY;
  if (!pem) throw new Error("CONVEX_JWT_PRIVATE_KEY is not set");
  cachedKey = await importPKCS8(pem, "RS256");
  return cachedKey;
}

// Mints a short-lived RS256 token Convex verifies via convex/auth.config.ts.
// Separate from NextAuth's own session JWT (which is HS256 and not
// independently verifiable by Convex) — see the RBAC plan for why.
export async function signConvexToken(params: { userId: string; email: string; name: string }) {
  const key = await getPrivateKey();
  return await new SignJWT({ email: params.email, name: params.name })
    .setProtectedHeader({ alg: "RS256", kid: "convex-1" })
    .setSubject(params.userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
}
