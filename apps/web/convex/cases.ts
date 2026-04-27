import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const TRUSTED_CONTRIBUTOR_THRESHOLD = 10;

export const contribute = mutation({
  args: {
    doctorId: v.id("users"),
    scanType: v.union(
      v.literal("chest_xray"), v.literal("mammogram"), v.literal("bone_xray"),
      v.literal("mri"), v.literal("ct_scan"), v.literal("ultrasound"), v.literal("other")
    ),
    bodyPart: v.string(),
    condition: v.string(),
    diagnosis: v.string(),
    clinicalNotes: v.string(),
    imageUrl: v.string(),
    imagePublicId: v.string(),
    recommendedSpecialist: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const doctor = await ctx.db.get(args.doctorId);
    const isTrusted = doctor?.trustedContributor === true;

    return await ctx.db.insert("cases", {
      ...args,
      isPublished: isTrusted,
      moderationStatus: isTrusted ? "approved" : "pending_review",
    });
  },
});

export const getByDoctor = query({
  args: { doctorId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cases")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .order("desc")
      .collect();
  },
});

// Only returns approved cases — used by the AI knowledge base
export const getByScanType = query({
  args: {
    scanType: v.union(
      v.literal("chest_xray"), v.literal("mammogram"), v.literal("bone_xray"),
      v.literal("mri"), v.literal("ct_scan"), v.literal("ultrasound"), v.literal("other")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cases")
      .withIndex("by_scan_type", (q) => q.eq("scanType", args.scanType))
      .filter((q) =>
        q.and(
          q.eq(q.field("isPublished"), true),
          q.eq(q.field("moderationStatus"), "approved")
        )
      )
      .order("desc")
      .take(10);
  },
});

export const getById = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.caseId);
  },
});

// Admin: get all cases pending review
export const getPendingReview = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("cases")
      .withIndex("by_moderation", (q) => q.eq("moderationStatus", "pending_review"))
      .order("desc")
      .collect();
  },
});

// Admin: approve a case
export const approveCase = mutation({
  args: { caseId: v.id("cases") },
  handler: async (ctx, { caseId }) => {
    const c = await ctx.db.get(caseId);
    if (!c) throw new Error("Case not found");

    await ctx.db.patch(caseId, {
      moderationStatus: "approved",
      isPublished: true,
      reviewedAt: Date.now(),
    });

    // Increment doctor's contribution count and check for trusted status
    const doctor = await ctx.db.get(c.doctorId);
    if (doctor) {
      const newCount = (doctor.contributionCount ?? 0) + 1;
      await ctx.db.patch(c.doctorId, {
        contributionCount: newCount,
        trustedContributor: newCount >= TRUSTED_CONTRIBUTOR_THRESHOLD,
      });
    }
  },
});

// Admin: reject a case
export const rejectCase = mutation({
  args: { caseId: v.id("cases"), note: v.optional(v.string()) },
  handler: async (ctx, { caseId, note }) => {
    await ctx.db.patch(caseId, {
      moderationStatus: "rejected",
      isPublished: false,
      moderationNote: note,
      reviewedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { caseId: v.id("cases"), doctorId: v.id("users") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.caseId);
    if (!existing || existing.doctorId !== args.doctorId) {
      throw new Error("Unauthorized");
    }
    await ctx.db.delete(args.caseId);
  },
});
