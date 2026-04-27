import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { OFFICIAL_PATTERNS } from "./trustedDomains";

function checkDomainTrust(domain: string): string | null {
  for (const pattern of OFFICIAL_PATTERNS) {
    if (domain.endsWith(pattern)) return `Official domain: ${pattern}`;
  }
  return null;
}

export const apply = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    specialty: v.string(),
    hospital: v.string(),
    country: v.string(),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const domain = args.email.split("@")[1]?.toLowerCase() ?? "";

    // Check hardcoded official patterns
    let autoReason = checkDomainTrust(domain);

    // Check admin-added trusted domains if no pattern matched
    if (!autoReason) {
      const customDomain = await ctx.db
        .query("trustedDomains")
        .withIndex("by_domain", (q) => q.eq("domain", domain))
        .unique();
      if (customDomain) {
        autoReason = `Verified institution: ${customDomain.institution}`;
      }
    }

    const isAutoApproved = !!autoReason;
    const status = isAutoApproved ? "auto_approved" : "pending";

    // Check for existing application
    const existing = await ctx.db
      .query("doctorApplications")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      if (existing.status === "rejected") {
        await ctx.db.patch(existing._id, {
          ...args, status,
          autoApprovedReason: autoReason ?? undefined,
          rejectionReason: undefined,
          submittedAt: Date.now(),
          reviewedAt: isAutoApproved ? Date.now() : undefined,
        });
      }
      return { applicationId: existing._id, autoApproved: isAutoApproved };
    }

    const id = await ctx.db.insert("doctorApplications", {
      ...args, status,
      autoApprovedReason: autoReason ?? undefined,
      submittedAt: Date.now(),
      reviewedAt: isAutoApproved ? Date.now() : undefined,
    });

    // If auto-approved, immediately verify the user if they already have an account
    if (isAutoApproved) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .unique();
      if (user) {
        await ctx.db.patch(user._id, { verified: true });
      }
    }

    return { applicationId: id, autoApproved: isAutoApproved };
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("doctorApplications")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("doctorApplications").order("desc").collect();
  },
});

export const approve = mutation({
  args: { id: v.id("doctorApplications") },
  handler: async (ctx, { id }) => {
    const application = await ctx.db.get(id);
    if (!application) throw new Error("Application not found");

    await ctx.db.patch(id, { status: "approved", reviewedAt: Date.now() });

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", application.email))
      .unique();
    if (user) await ctx.db.patch(user._id, { verified: true });
  },
});

export const reject = mutation({
  args: { id: v.id("doctorApplications"), reason: v.optional(v.string()) },
  handler: async (ctx, { id, reason }) => {
    const application = await ctx.db.get(id);
    await ctx.db.patch(id, {
      status: "rejected",
      rejectionReason: reason,
      reviewedAt: Date.now(),
    });
    if (application) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", application.email))
        .unique();
      if (user) await ctx.db.patch(user._id, { verified: false });
    }
  },
});
