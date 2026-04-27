"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";

export default function AdminOverviewPage() {
  const stats = useQuery(api.admin.overviewStats);
  const activity = useQuery(api.admin.recentActivity);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Admin Console</p>
        <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Verified doctors", value: stats?.verifiedDoctors, sub: `of ${stats?.totalDoctors ?? "—"} registered`, color: "text-teal-400" },
          { label: "Pending applications", value: stats?.pendingApplications, href: "/admin/personnel", color: "text-amber-400" },
          { label: "Cases for review", value: stats?.pendingCases, href: "/admin/contributions", color: "text-orange-400" },
          { label: "Analyses run", value: stats?.completedAnalyses, sub: `of ${stats?.totalAnalyses ?? "—"} submitted`, color: "text-purple-400" },
        ].map((s) => (
          <div key={s.label}
            className={`rounded-xl border border-white/8 bg-white/3 p-5 ${s.href ? "hover:bg-white/5 transition-colors cursor-pointer" : ""}`}
            onClick={() => s.href && (window.location.href = s.href)}>
            <p className={`text-3xl font-bold ${s.color}`}>
              {stats === undefined ? "—" : (s.value ?? 0)}
            </p>
            <p className="text-xs font-medium text-white mt-1">{s.label}</p>
            {s.sub && <p className="text-xs text-slate-600 mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Knowledge base health */}
      <div className="rounded-xl border border-white/8 bg-white/3 p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Knowledge base</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold text-white">{stats?.approvedCases ?? "—"}</p>
            <p className="text-xs text-slate-500 mt-0.5">Approved cases in DB</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats?.pendingCases ?? "—"}</p>
            <p className="text-xs text-slate-500 mt-0.5">Awaiting moderation</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats?.totalCases ?? "—"}</p>
            <p className="text-xs text-slate-500 mt-0.5">Total cases submitted</p>
          </div>
        </div>
        {(stats?.pendingCases ?? 0) > 0 && (
          <Link href="/admin/contributions"
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            {stats?.pendingCases} cases need review →
          </Link>
        )}
      </div>

      {/* Recent activity */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Recent applications</h2>
          {activity?.recentApps.length === 0 && <p className="text-slate-500 text-xs">None yet.</p>}
          <div className="space-y-2">
            {activity?.recentApps.map((a) => (
              <div key={a._id} className="flex items-center gap-3 rounded-lg border border-white/6 bg-white/2 px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{a.name}</p>
                  <p className="text-xs text-slate-500 truncate">{a.specialty} · {a.country}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${
                  a.status === "pending" ? "text-amber-400 border-amber-500/20 bg-amber-500/5" :
                  a.status === "approved" || a.status === "auto_approved" ? "text-teal-400 border-teal-500/20 bg-teal-500/10" :
                  "text-red-400 border-red-500/20 bg-red-500/5"
                }`}>
                  {a.status === "auto_approved" ? "auto" : a.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Recent analyses</h2>
          {activity?.recentAnalyses.length === 0 && <p className="text-slate-500 text-xs">None yet.</p>}
          <div className="space-y-2">
            {activity?.recentAnalyses.map((a) => (
              <div key={a._id} className="flex items-center gap-3 rounded-lg border border-white/6 bg-white/2 px-3 py-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.imageUrl} alt="scan" className="w-8 h-8 rounded object-cover bg-slate-800 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white">{a.scanType.replace(/_/g, " ")}</p>
                  <p className="text-xs text-slate-500 truncate">{a.symptoms || "No symptoms noted"}</p>
                </div>
                <span className={`text-xs shrink-0 ${a.status === "complete" ? "text-teal-400" : a.status === "failed" ? "text-red-400" : "text-slate-500"}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
