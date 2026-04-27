"use client";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function ConvexUserSync() {
  const { data: session } = useSession();
  const createUser = useMutation(api.users.create);
  const synced = useRef(false);

  useEffect(() => {
    if (!session?.user?.email || synced.current) return;
    synced.current = true;

    createUser({
      name: session.user.name ?? "Doctor",
      email: session.user.email,
      role: "doctor",
      verified: false,
    });
  }, [session?.user?.email, createUser]);

  return null;
}
