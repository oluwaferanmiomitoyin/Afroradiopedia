import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Validate a code — called before showing the register form
export const validate = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const invite = await ctx.db
      .query("inviteCodes")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();

    if (!invite || invite.isUsed) return null;
    if (invite.expiresAt && invite.expiresAt < Date.now()) return null;

    return { valid: true, email: invite.email ?? null };
  },
});

// Claim a code — called after successful Google sign-in
export const claim = mutation({
  args: { code: v.string(), email: v.string() },
  handler: async (ctx, { code, email }) => {
    const invite = await ctx.db
      .query("inviteCodes")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();

    if (!invite || invite.isUsed) throw new Error("Invalid or already used invite");
    if (invite.expiresAt && invite.expiresAt < Date.now()) throw new Error("Invite expired");
    if (invite.email && invite.email !== email) throw new Error("This invite is for a different email address");

    await ctx.db.patch(invite._id, { isUsed: true, usedByEmail: email });
  },
});

// Generate a new invite code — called from the admin page
export const generate = mutation({
  args: {
    email: v.optional(v.string()),
    expiresInDays: v.optional(v.number()),
  },
  handler: async (ctx, { email, expiresInDays }) => {
    const part = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `AFRO-${part()}-${part()}`;

    const id = await ctx.db.insert("inviteCodes", {
      code,
      email,
      isUsed: false,
      createdAt: Date.now(),
      expiresAt: expiresInDays
        ? Date.now() + expiresInDays * 86_400_000
        : undefined,
    });

    return { id, code };
  },
});

// List all codes — admin view
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("inviteCodes").order("desc").collect();
  },
});

// Revoke a code
export const revoke = mutation({
  args: { id: v.id("inviteCodes") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { isUsed: true });
  },
});
