"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";

export default function ContributionsPage() {
  const pending = useQuery(api.cases.getPendingReview);
  const approveCase = useMutation(api.cases.approveCase);
  const rejectCase = useMutation(api.cases.rejectCase);

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setLoading(id);
    await approveCase({ caseId: id as any });
    setLoading(null);
  }

  async function handleReject(id: string) {
    setLoading(id);
    await rejectCase({ caseId: id as any, note: rejectNote || undefined });
    setRejectingId(null);
    setRejectNote("");
    setLoading(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Admin</p>
        <h1 className="text-2xl font-bold text-white">Contributions</h1>
        <p className="mt-1 text-slate-400 text-sm">
          Review cases submitted by doctors. Approved cases enter the knowledge base.
        </p>
      </div>

      {pending === undefined && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-xl border border-white/6 bg-white/2 animate-pulse" />)}
        </div>
      )}

      {pending?.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 py-16 text-center">
          <div className="w-10 h-10 rounded-xl border border-teal-500/20 bg-teal-500/5 flex items-center justify-center text-teal-400 mx-auto mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-white font-semibold text-sm">All caught up</p>
          <p className="text-slate-500 text-xs mt-1">No cases pending review.</p>
        </div>
      )}

      <div className="space-y-4">
        {pending?.map((c) => (
          <div key={c._id} className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.imageUrl} alt={c.condition}
                className="w-20 h-20 rounded-lg object-cover bg-slate-800 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-mono text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">
                    {c.scanType.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    pending review
                  </span>
                </div>
                <h3 className="font-semibold text-white">{c.condition}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{c.bodyPart}</p>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="rounded-lg border border-white/6 bg-white/2 p-3 space-y-2">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">Confirmed diagnosis</p>
                <p className="text-sm text-slate-200">{c.diagnosis}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">Clinical notes</p>
                <p className="text-sm text-slate-300 leading-relaxed">{c.clinicalNotes}</p>
              </div>
              {c.recommendedSpecialist && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-0.5">Specialist</p>
                  <p className="text-sm text-teal-400">{c.recommendedSpecialist}</p>
                </div>
              )}
            </div>

            {c.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {c.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-full border border-white/8">{tag}</span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button onClick={() => handleApprove(c._id)} disabled={loading === c._id}
                className="flex-1 py-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-semibold rounded-lg text-sm transition-colors">
                {loading === c._id ? "Approving…" : "Approve — add to knowledge base"}
              </button>
              {rejectingId === c._id ? (
                <div className="flex-1 space-y-2">
                  <input value={rejectNote} onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="Rejection reason (optional)"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500" />
                  <div className="flex gap-2">
                    <button onClick={() => handleReject(c._id)} disabled={loading === c._id}
                      className="flex-1 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 font-semibold rounded-lg text-xs hover:bg-red-500/30 transition-colors">
                      Confirm
                    </button>
                    <button onClick={() => setRejectingId(null)}
                      className="flex-1 py-1.5 border border-white/10 text-slate-400 rounded-lg text-xs hover:text-white transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setRejectingId(c._id)}
                  className="px-4 py-2 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 font-semibold rounded-lg text-sm transition-colors">
                  Reject
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
