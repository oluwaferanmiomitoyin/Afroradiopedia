import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("doctor"), v.literal("patient")),
    // Doctor-specific fields
    specialty: v.optional(v.string()),
    country: v.optional(v.string()),
    hospital: v.optional(v.string()),
    verified: v.optional(v.boolean()),
  }).index("by_email", ["email"]),

  cases: defineTable({
    // Contributed by doctors
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
    condition: v.string(),         // e.g. "Pneumonia", "Leg Fracture"
    diagnosis: v.string(),         // confirmed final diagnosis
    clinicalNotes: v.string(),     // doctor's detailed notes
    imageUrl: v.string(),          // Cloudinary URL
    imagePublicId: v.string(),     // Cloudinary public_id for management
    recommendedSpecialist: v.optional(v.string()),
    tags: v.array(v.string()),     // searchable tags
    isPublished: v.boolean(),
  })
    .index("by_doctor", ["doctorId"])
    .index("by_scan_type", ["scanType"])
    .index("by_condition", ["condition"]),

  analyses: defineTable({
    // Submitted by patients or remote doctors seeking help
    submittedBy: v.optional(v.id("users")), // optional — allow anonymous
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
    // Results
    aiFindings: v.optional(v.string()),         // Gemini response
    aiConfidence: v.optional(v.number()),
    recommendedSpecialist: v.optional(v.string()),
    matchedCaseIds: v.optional(v.array(v.id("cases"))), // similar cases from DB
    status: v.union(
      v.literal("pending"),
      v.literal("complete"),
      v.literal("failed")
    ),
  }).index("by_user", ["submittedBy"]),
});
