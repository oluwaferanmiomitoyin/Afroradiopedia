import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("doctor"), v.literal("patient")),
    specialty: v.optional(v.string()),
    country: v.optional(v.string()),
    hospital: v.optional(v.string()),
    verified: v.optional(v.boolean()),
    // After N accepted contributions, auto-publish is unlocked
    trustedContributor: v.optional(v.boolean()),
    contributionCount: v.optional(v.number()),
  }).index("by_email", ["email"]),

  cases: defineTable({
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
    isPublished: v.boolean(),
    // Moderation
    moderationStatus: v.union(
      v.literal("pending_review"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    moderationNote: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_doctor", ["doctorId"])
    .index("by_scan_type", ["scanType"])
    .index("by_condition", ["condition"])
    .index("by_moderation", ["moderationStatus"]),

  analyses: defineTable({
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
    aiFindings: v.optional(v.string()),
    aiConfidence: v.optional(v.number()),
    recommendedSpecialist: v.optional(v.string()),
    matchedCaseIds: v.optional(v.array(v.id("cases"))),
    status: v.union(
      v.literal("pending"),
      v.literal("complete"),
      v.literal("failed")
    ),
  }).index("by_user", ["submittedBy"]),

  // Doctor applications — self-submitted, reviewed by admin
  doctorApplications: defineTable({
    email: v.string(),
    name: v.string(),
    specialty: v.string(),
    hospital: v.string(),
    country: v.string(),
    note: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("auto_approved") // institutional email matched
    ),
    autoApprovedReason: v.optional(v.string()), // which domain pattern matched
    rejectionReason: v.optional(v.string()),
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  // Admin-managed list of trusted email domains
  trustedDomains: defineTable({
    domain: v.string(),       // e.g. "luth.gov.ng"
    institution: v.string(),  // e.g. "Lagos University Teaching Hospital"
    country: v.string(),
    addedAt: v.number(),
  }).index("by_domain", ["domain"]),

  // Kept for emergency direct invites
  inviteCodes: defineTable({
    code: v.string(),
    email: v.optional(v.string()),
    isUsed: v.boolean(),
    usedByEmail: v.optional(v.string()),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  }).index("by_code", ["code"]),
});
