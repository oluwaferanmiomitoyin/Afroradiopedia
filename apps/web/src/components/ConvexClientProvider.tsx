"use client";
import { useCallback } from "react";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { SessionProvider, useSession } from "next-auth/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Bridges NextAuth's session into Convex's ctx.auth — see /api/convex-token
// and convex/auth.config.ts for the other half of this.
function useAuthFromNextAuth() {
  const { status } = useSession();

  const fetchAccessToken = useCallback(async () => {
    const res = await fetch("/api/convex-token");
    if (!res.ok) return null;
    const { token } = await res.json();
    return token ?? null;
  }, []);

  return {
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    fetchAccessToken,
  };
}

function ConvexProviderWithNextAuth({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useAuthFromNextAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ConvexProviderWithNextAuth>{children}</ConvexProviderWithNextAuth>
    </SessionProvider>
  );
}
