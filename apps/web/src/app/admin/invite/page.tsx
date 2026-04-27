"use client";
import { useSession, signOut } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",").map((e) => e.trim());

type Tab = "pending" | "approved" | "rejected";

export default function AdminPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Shell><div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-white/10 border-t-teal-400 rounded-full animate-spin" /></div></Shell>;
  }

  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email);

  if (!session || !isAdmin) {
    return (
      <Shell>
        <div className="text-center space-y-3 py-8">
          <p className="text-white font-semibold">Access denied</p>
          <p className="text-slate-500 text-sm">Admin only.</p>
          {session
            ? <button onClick={() => signOut({ callbackUrl: "/" })} className="text-xs text-red-400 hover:text-red-300">Sign out</button>
            : <a href="/login" className="text-xs text-teal-400 hover:text-teal-300">Sign in</a>}
        </div>
      </Shell>
    );
  }

  return <Shell><AdminPanel /></Shell>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#060d17] px-5 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Admin</span>
            </div>
            <h1 className="text-xl font-bold text-white">Doctor Applications</h1>
          </div>
          <a href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">← Back to site</a>
        </div>
        {children}
      </div>
    </div>
  );
}

function AdminPanel() {
  const all = useQuery(api.doctorApplications.list);
  const approve = useMutation(api.doctorApplications.approve);
  const reject = useMutation(api.doctorApplications.reject);
  const [tab, setTab] = useState<Tab>("pending");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filtered = all?.filter((a) => a.status === tab) ?? [];
  const counts = {
    pending: all?.filter((a) => a.status === "pending").length ?? 0,
    approved: all?.filter((a) => a.status === "approved").length ?? 0,
    rejected: all?.filter((a) => a.status === "rejected").length ?? 0,
  };

  async function handleApprove(id: string) {
    setActionLoading(id);
    await approve({ id: id as any });
    setActionLoading(null);
  }

  async function handleReject(id: string) {
    setActionLoading(id);
    await reject({ id: id as any, reason: rejectReason || undefined });
    setRejectingId(null);
    setRejectReason("");
    setActionLoading(null);
  }

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-white/8 bg-white/3 p-1">
        {(["pending", "approved", "rejected"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
            }`}>
            {t}
            {counts[t] > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${
                t === "pending" ? "bg-amber-500/20 text-amber-400" :
                t === "approved" ? "bg-teal-500/20 text-teal-400" :
                "bg-red-500/20 text-red-400"
              }`}>{counts[t]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {all === undefined && (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-24 rounded-xl border border-white/6 bg-white/2 animate-pulse" />)}
        </div>
      )}

      {/* Empty */}
      {all !== undefined && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 py-12 text-center">
          <p className="text-slate-500 text-sm">No {tab} applications.</p>
        </div>
      )}

      {/* Application cards */}
      {filtered.map((app) => (
        <div key={app._id} className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-white">{app.name}</p>
              <p className="text-sm text-teal-400">{app.specialty} · {app.hospital}</p>
              <p className="text-xs text-slate-500">{app.email} · {app.country}</p>
            </div>
            <span className="text-xs text-slate-500 shrink-0">
              {new Date(app.submittedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Note */}
          <div className="rounded-lg border border-white/6 bg-white/2 px-4 py-3">
            <p className="text-xs font-medium text-slate-500 mb-1">Why they want to contribute</p>
            <p className="text-sm text-slate-300 leading-relaxed">{app.note}</p>
          </div>

          {/* Rejection reason if rejected */}
          {app.status === "rejected" && app.rejectionReason && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
              <p className="text-xs text-red-400">Rejection reason: {app.rejectionReason}</p>
            </div>
          )}

          {/* Actions */}
          {app.status === "pending" && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleApprove(app._id)}
                disabled={actionLoading === app._id}
                className="flex-1 py-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-semibold rounded-lg text-sm transition-colors"
              >
                {actionLoading === app._id ? "Approving…" : "Approve"}
              </button>
              {rejectingId === app._id ? (
                <div className="flex-1 space-y-2">
                  <input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason (optional)"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleReject(app._id)} disabled={actionLoading === app._id}
                      className="flex-1 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-semibold rounded-lg text-xs transition-colors">
                      Confirm reject
                    </button>
                    <button onClick={() => setRejectingId(null)}
                      className="flex-1 py-1.5 border border-white/10 text-slate-400 rounded-lg text-xs hover:text-white transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setRejectingId(app._id)}
                  className="flex-1 py-2 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 font-semibold rounded-lg text-sm transition-colors">
                  Reject
                </button>
              )}
            </div>
          )}

          {/* Re-approve a rejected one */}
          {app.status === "rejected" && (
            <button onClick={() => handleApprove(app._id)} disabled={actionLoading === app._id}
              className="w-full py-2 border border-teal-500/30 hover:border-teal-500/60 text-teal-400 font-semibold rounded-lg text-sm transition-colors">
              Approve anyway
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
