"use client";
import { useQuery } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "../../../../../convex/_generated/api";
import { GlassCard } from "@/components/GlassCard";
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Cases</h1>
        <Link
          href="/doctor/contribute"
          className="bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          + New Case
        </Link>
      </div>

      {cases === undefined && (
        <GlassCard className="text-center py-16">
          <p className="text-slate-400 animate-pulse">Loading cases…</p>
        </GlassCard>
      )}

      {cases !== undefined && cases.length === 0 && (
        <GlassCard className="text-center py-16">
          <p className="text-slate-400">You haven&apos;t contributed any cases yet.</p>
          <Link
            href="/doctor/contribute"
            className="mt-4 inline-block text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors"
          >
            Contribute your first case →
          </Link>
        </GlassCard>
      )}

      {cases && cases.length > 0 && (
        <div className="space-y-4">
          {cases.map((c) => (
            <GlassCard key={c._id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono bg-slate-700 text-sky-300 px-2 py-0.5 rounded">
                      {c.scanType.replace("_", " ").toUpperCase()}
                    </span>
                    <h3 className="font-semibold text-white truncate">{c.condition}</h3>
                  </div>
                  <p className="mt-1 text-sm text-slate-400 line-clamp-2">{c.clinicalNotes}</p>
                  {c.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.imageUrl}
                  alt={c.condition}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-slate-700"
                />
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
