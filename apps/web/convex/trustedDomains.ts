import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Hardcoded patterns for African institutional emails — auto-approved on match
export const OFFICIAL_PATTERNS = [
  // Government health ministries & hospitals
  ".gov.ng", ".gov.gh", ".gov.ke", ".gov.za", ".gov.ug",
  ".gov.tz", ".gov.rw", ".gov.et", ".gov.mw", ".gov.zm",
  ".gov.zw", ".gov.sn", ".gov.ci", ".gov.cm", ".gov.bj",
  // Academic / teaching hospitals
  ".edu.ng", ".edu.gh",
  ".ac.za", ".ac.ke", ".ac.ug", ".ac.tz", ".ac.mw", ".ac.zm",
  ".ac.rw", ".ac.gh",
];

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("trustedDomains").order("asc").collect();
  },
});

export const add = mutation({
  args: {
    domain: v.string(),
    institution: v.string(),
    country: v.string(),
  },
  handler: async (ctx, args) => {
    const clean = args.domain.toLowerCase().replace(/^@/, "");
    const existing = await ctx.db
      .query("trustedDomains")
      .withIndex("by_domain", (q) => q.eq("domain", clean))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("trustedDomains", {
      domain: clean,
      institution: args.institution,
      country: args.country,
      addedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("trustedDomains") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// Check if an email is from a trusted domain (used in apply mutation)
export const checkEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const domain = email.split("@")[1]?.toLowerCase() ?? "";

    // Check hardcoded patterns
    for (const pattern of OFFICIAL_PATTERNS) {
      if (domain.endsWith(pattern)) {
        return { trusted: true, reason: `Official domain: ${pattern}` };
      }
    }

    // Check admin-added domains
    const custom = await ctx.db
      .query("trustedDomains")
      .withIndex("by_domain", (q) => q.eq("domain", domain))
      .unique();

    if (custom) {
      return { trusted: true, reason: `Verified institution: ${custom.institution}` };
    }

    return { trusted: false, reason: null };
  },
});
