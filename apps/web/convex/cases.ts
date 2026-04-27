import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Doctor submits a new case to the knowledge base
export const contribute = mutation({
  args: {
    doctorId: v.id("users"),
    scanType: v.union(
      v.literal("chest_xray"),
      v.literal("mammogram"),
      v.literal("bone_xray"),
      v.literal("mri"),
      v.literal("ct_scan"),
      v.literal("ultrasound"),
      v.literal("other")
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
    return await ctx.db.insert("cases", {
      ...args,
      isPublished: true,
    });
  },
});

// Get all cases for a doctor's dashboard
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

// Search knowledge base by scan type (for matching patient uploads)
export const getByScanType = query({
  args: {
    scanType: v.union(
      v.literal("chest_xray"),
      v.literal("mammogram"),
      v.literal("bone_xray"),
      v.literal("mri"),
      v.literal("ct_scan"),
      v.literal("ultrasound"),
      v.literal("other")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cases")
      .withIndex("by_scan_type", (q) => q.eq("scanType", args.scanType))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .order("desc")
      .take(10);
  },
});

// Get a single case by ID
export const getById = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.caseId);
  },
});

// Delete a case (doctor can remove their own)
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
