import { QueryCtx, MutationCtx } from "../_generated/server";

export async function requireIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || !identity.email) throw new Error("Unauthorized: sign-in required");
  return identity;
}

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const identity = await requireIdentity(ctx);
  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", identity.email!))
    .unique();
  if (!user) throw new Error("Unauthorized: no account found");
  return user;
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await requireUser(ctx);
  if (user.role !== "admin") throw new Error("Unauthorized: admin only");
  return user;
}

export async function requireDoctor(ctx: QueryCtx | MutationCtx) {
  const user = await requireUser(ctx);
  if (user.role !== "doctor" || !user.verified) {
    throw new Error("Unauthorized: verified doctor only");
  }
  return user;
}
