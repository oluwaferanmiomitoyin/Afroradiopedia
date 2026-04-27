"use client";
import { useQuery } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";

export default function MyCasesPage() {
  const { data: session } = useSession();
  const convexUser = useQuery(
    api.users.getByEmail,
    session?.user?.email ? { email: session.user.email } : "skip"
  );
  const cases = useQuery(
    api.cases.getByDoctor,
    convexUser?._id ? { doctorId: convexUser._id } : "skip"
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Doctor Portal</p>
          <h1 className="text-2xl font-bold text-white">My Cases</h1>
        </div>
        <Link
          href="/doctor/contribute"
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Case
        </Link>
      </div>

      {/* Loading */}
      {cases === undefined && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl border border-white/6 bg-white/2 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty */}
      {cases !== undefined && cases.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mx-auto mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-white font-semibold text-sm">No cases yet</p>
          <p className="text-slate-500 text-xs mt-1">Contribute your first case to get started.</p>
          <Link href="/doctor/contribute"
            className="mt-4 inline-flex items-center gap-1.5 text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors">
            Upload a case →
          </Link>
        </div>
      )}

      {/* Cases list */}
      {cases && cases.length > 0 && (
        <div className="space-y-3">
          {cases.map((c) => (
            <div key={c._id} className="flex items-start gap-4 rounded-xl border border-white/8 bg-white/3 hover:bg-white/5 transition-colors p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.imageUrl}
                alt={c.condition}
                className="w-14 h-14 rounded-lg object-cover bg-slate-800 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-mono text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">
                    {c.scanType.replace(/_/g, " ")}
                  </span>
                  <h3 className="text-sm font-semibold text-white">{c.condition}</h3>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{c.clinicalNotes}</p>
                {c.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-full border border-white/8">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full shrink-0">
                Published
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
