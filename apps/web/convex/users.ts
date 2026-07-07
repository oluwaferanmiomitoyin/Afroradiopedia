import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

// Called server-side (from /api/convex-token) right after a verified
// NextAuth sign-in. Decides admin status from the Convex-only ADMIN_EMAILS
// env var — this is the one place that env var is read.
export const upsertFromAuth = mutation({
  args: { name: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const isAdmin = adminEmails.includes(args.email.toLowerCase());

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      if (isAdmin && existing.role !== "admin") {
        await ctx.db.patch(existing._id, { role: "admin", verified: true });
      }
      return existing._id;
    }

    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      role: isAdmin ? "admin" : "doctor",
      verified: isAdmin,
    });
  },
});
