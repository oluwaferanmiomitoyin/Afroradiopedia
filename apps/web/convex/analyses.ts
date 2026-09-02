import { query, mutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { requireUser } from "./lib/auth";

// If the analysis was submitted anonymously, anyone holding its (unguessable)
// id may update it — same trust model as the anonymous /analyze flow itself.
// If it was submitted by a signed-in user, only that user may update it.
async function requireOwnsAnalysis(ctx: MutationCtx, analysisId: Id<"analyses">) {
  const analysis = await ctx.db.get(analysisId);
  if (!analysis) throw new Error("Analysis not found");
  if (analysis.submittedBy) {
    const user = await requireUser(ctx);
    if (user._id !== analysis.submittedBy) throw new Error("Unauthorized");
  }
  return analysis;
}

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
    await requireOwnsAnalysis(ctx, analysisId);
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
    await requireOwnsAnalysis(ctx, args.analysisId);
    await ctx.db.patch(args.analysisId, { status: "failed" });
  },
});

// Get analyses for the signed-in user
export const getByUser = query({
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    return await ctx.db
      .query("analyses")
      .withIndex("by_user", (q) => q.eq("submittedBy", user._id))
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
