"use client";
import { useSession, signOut } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";

export default function PatientDashboard() {
  const { data: session } = useSession();
  const convexUser = useQuery(
    api.users.getByEmail,
    session?.user?.email ? { email: session.user.email } : "skip"
  );
  const analyses = useQuery(
    api.analyses.getByUser,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const initials = session?.user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "U";

  return (
    <div className="min-h-screen bg-[#060d17]">

      {/* Top nav */}
      <header className="border-b border-white/6 bg-[#060d17]/90 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span className="text-sm font-semibold text-white">AfroRadiopedia</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/analyze" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">
              New Scan
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-xs font-bold text-teal-400">
                {initials}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-10">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            {analyses === undefined ? "Loading…" : `Hi, ${firstName}.`}
          </h1>
          <p className="mt-1 text-slate-400 text-sm">
            {analyses === undefined
              ? ""
              : analyses.length === 0
              ? "Your scan history will appear here once you run an analysis."
              : `You have ${analyses.length} scan${analyses.length === 1 ? "" : "s"} in your history.`}
          </p>
        </div>

        {/* Quick action */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <Link
            href="/analyze"
            className="group rounded-xl border border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/10 hover:border-teal-500/40 p-5 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-white">Analyze a new scan</p>
            <p className="text-xs text-slate-400 mt-1">Upload an X-ray or scan and get AI-powered findings.</p>
          </Link>

          <div className="rounded-xl border border-white/8 bg-white/3 p-5">
            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-white">Total scans</p>
            <p className="text-2xl font-bold text-white mt-1">{analyses?.length ?? "—"}</p>
          </div>
        </div>

        {/* History */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-4">Scan History</h2>

          {analyses === undefined && (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-xl border border-white/6 bg-white/2 animate-pulse" />
              ))}
            </div>
          )}

          {analyses !== undefined && analyses.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/10 p-12 text-center">
              <p className="text-slate-500 text-sm">No scans yet.</p>
              <Link href="/analyze" className="mt-3 inline-flex items-center gap-1.5 text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors">
                Run your first analysis →
              </Link>
            </div>
          )}

          {analyses && analyses.length > 0 && (
            <div className="space-y-3">
              {analyses.map((a) => (
                <div key={a._id} className="flex items-start gap-4 rounded-xl border border-white/8 bg-white/3 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.imageUrl} alt="scan"
                    className="w-12 h-12 rounded-lg object-cover bg-slate-800 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">
                        {a.scanType.replace(/_/g, " ")}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        a.status === "complete"
                          ? "text-teal-400 bg-teal-500/10 border-teal-500/20"
                          : a.status === "failed"
                          ? "text-red-400 bg-red-500/10 border-red-500/20"
                          : "text-slate-400 bg-white/5 border-white/10"
                      }`}>
                        {a.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{a.symptoms || "No symptoms noted"}</p>
                    {a.aiFindings && (
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{a.aiFindings}</p>
                    )}
                  </div>
                  {a.recommendedSpecialist && (
                    <span className="text-xs text-slate-400 shrink-0 hidden sm:block">{a.recommendedSpecialist}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
