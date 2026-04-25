import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Save a new analysis request
export const create = mutation({
  args: {
    submittedBy: v.optional(v.id("users")),
    scanType: v.union(
      v.literal("chest_xray"),
      v.literal("mammogram"),
      v.literal("bone_xray"),
      v.literal("mri"),
      v.literal("ct_scan"),
      v.literal("ultrasound"),
      v.literal("other")
    ),
    symptoms: v.string(),
    imageUrl: v.string(),
    imagePublicId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("analyses", {
      ...args,
      status: "pending",
    });
  },
});

// Update analysis with AI results
export const updateWithResults = mutation({
  args: {
    analysisId: v.id("analyses"),
    aiFindings: v.string(),
    aiConfidence: v.number(),
    recommendedSpecialist: v.string(),
    matchedCaseIds: v.array(v.id("cases")),
  },
  handler: async (ctx, args) => {
    const { analysisId, ...results } = args;
    await ctx.db.patch(analysisId, {
      ...results,
      status: "complete",
    });
  },
});

// Mark analysis as failed
export const markFailed = mutation({
  args: { analysisId: v.id("analyses") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.analysisId, { status: "failed" });
  },
});

// Get analyses for a user
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("analyses")
      .withIndex("by_user", (q) => q.eq("submittedBy", args.userId))
      .order("desc")
      .collect();
  },
});

// Get a single analysis
export const getById = query({
  args: { analysisId: v.id("analyses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.analysisId);
  },
});
