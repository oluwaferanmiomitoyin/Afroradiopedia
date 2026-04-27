import { query } from "./_generated/server";

// Overview stats for the admin dashboard
export const overviewStats = query({
  handler: async (ctx) => {
    const [users, cases, analyses, applications] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("cases").collect(),
      ctx.db.query("analyses").collect(),
      ctx.db.query("doctorApplications").collect(),
    ]);

    const doctors = users.filter((u) => u.role === "doctor");
    const verifiedDoctors = doctors.filter((u) => u.verified);
    const pendingApplications = applications.filter((a) => a.status === "pending");
    const pendingCases = cases.filter((c) => c.moderationStatus === "pending_review");
    const approvedCases = cases.filter((c) => c.moderationStatus === "approved");
    const completedAnalyses = analyses.filter((a) => a.status === "complete");

    return {
      totalDoctors: doctors.length,
      verifiedDoctors: verifiedDoctors.length,
      pendingApplications: pendingApplications.length,
      totalCases: cases.length,
      pendingCases: pendingCases.length,
      approvedCases: approvedCases.length,
      totalAnalyses: analyses.length,
      completedAnalyses: completedAnalyses.length,
    };
  },
});

// Recent platform activity
export const recentActivity = query({
  handler: async (ctx) => {
    const [recentCases, recentAnalyses, recentApps] = await Promise.all([
      ctx.db.query("cases").order("desc").take(5),
      ctx.db.query("analyses").order("desc").take(5),
      ctx.db.query("doctorApplications").order("desc").take(5),
    ]);

    return { recentCases, recentAnalyses, recentApps };
  },
});

// All doctors with their stats
export const allDoctors = query({
  handler: async (ctx) => {
    const doctors = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "doctor"))
      .order("desc")
      .collect();

    return doctors;
  },
});
