"use client";
import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";

export default function DoctorDashboard() {
  const { data: session } = useSession();
  const convexUser = useQuery(
    api.users.getByEmail,
    session?.user?.email ? { email: session.user.email } : "skip"
  );
  const cases = useQuery(
    api.cases.getByDoctor,
    convexUser?._id ? { doctorId: convexUser._id } : "skip"
  );

  const caseCount = cases?.length ?? 0;
  const recentCases = cases?.slice(0, 3) ?? [];
  const firstName = session?.user?.name?.split(" ")[0] ?? "Doctor";

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Dashboard</p>
        <h1 className="text-2xl font-bold text-white">
          {cases === undefined ? "Loading…" : `Good to see you, ${firstName}.`}
        </h1>
        <p className="mt-1 text-slate-400 text-sm">
          {caseCount === 0
            ? "You haven't contributed any cases yet. Your first upload makes you part of African medical history."
            : `You've contributed ${caseCount} case${caseCount === 1 ? "" : "s"} to the knowledge base.`}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/8 bg-white/3 p-5">
          <p className="text-3xl font-bold text-teal-400">{caseCount}</p>
          <p className="text-xs text-slate-500 mt-1">Cases contributed</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/3 p-5">
          <p className="text-3xl font-bold text-white">—</p>
          <p className="text-xs text-slate-500 mt-1">Notes used in analyses</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/3 p-5 col-span-2 sm:col-span-1">
          <p className="text-3xl font-bold text-white">—</p>
          <p className="text-xs text-slate-500 mt-1">Doctors helped</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/doctor/contribute"
          className="group rounded-xl border border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/10 hover:border-teal-500/40 p-5 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <svg className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-colors mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
          <h2 className="font-semibold text-white text-sm">Contribute a Case</h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Upload a scan with your clinical notes and confirmed diagnosis.
          </p>
        </Link>

        <Link
          href="/doctor/my-cases"
          className="group rounded-xl border border-white/8 bg-white/3 hover:bg-white/5 hover:border-white/15 p-5 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
          <h2 className="font-semibold text-white text-sm">My Cases</h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Review, manage, or delete the cases you have contributed.
          </p>
        </Link>
      </div>

      {/* Recent cases */}
      {recentCases.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Recent contributions</h2>
            <Link href="/doctor/my-cases" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentCases.map((c) => (
              <div key={c._id} className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/3 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.imageUrl} alt={c.condition}
                  className="w-12 h-12 rounded-lg object-cover bg-slate-800 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">
                      {c.scanType.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white truncate">{c.condition}</p>
                  <p className="text-xs text-slate-500 truncate">{c.bodyPart}</p>
                </div>
                <div className="shrink-0">
                  <span className="text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full">
                    Published
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state CTA */}
      {caseCount === 0 && cases !== undefined && (
        <div className="rounded-xl border border-dashed border-white/10 p-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-white font-semibold">Upload your first case</p>
          <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">
            Share a real scan with your notes. It takes 2 minutes and helps doctors across Africa tonight.
          </p>
          <Link
            href="/doctor/contribute"
            className="mt-5 inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold py-2.5 px-6 rounded-lg transition-colors text-sm"
          >
            Contribute a Case
          </Link>
        </div>
      )}
    </div>
  );
}
