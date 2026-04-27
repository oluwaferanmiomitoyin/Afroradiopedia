import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get a user by email (used after auth)
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

// Create a new user
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("doctor"), v.literal("patient")),
    specialty: v.optional(v.string()),
    country: v.optional(v.string()),
    hospital: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Prevent duplicate users
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      ...args,
      verified: false,
    });
  },
});
