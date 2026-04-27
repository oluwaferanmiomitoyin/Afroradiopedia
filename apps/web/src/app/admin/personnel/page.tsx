"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";

type Tab = "pending" | "auto_approved" | "approved" | "rejected" | "doctors";

export default function PersonnelPage() {
  const applications = useQuery(api.doctorApplications.list);
  const doctors = useQuery(api.admin.allDoctors);
  const approve = useMutation(api.doctorApplications.approve);
  const reject = useMutation(api.doctorApplications.reject);

  const [tab, setTab] = useState<Tab>("pending");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const counts = {
    pending: applications?.filter((a) => a.status === "pending").length ?? 0,
    auto_approved: applications?.filter((a) => a.status === "auto_approved").length ?? 0,
    approved: applications?.filter((a) => a.status === "approved").length ?? 0,
    rejected: applications?.filter((a) => a.status === "rejected").length ?? 0,
    doctors: doctors?.length ?? 0,
  };

  const filtered = tab === "doctors"
    ? []
    : (applications?.filter((a) => a.status === tab) ?? []);

  const tabs: { key: Tab; label: string; badge?: number; color?: string }[] = [
    { key: "pending", label: "Pending", badge: counts.pending, color: "amber" },
    { key: "auto_approved", label: "Auto-approved", badge: counts.auto_approved, color: "teal" },
    { key: "approved", label: "Approved", badge: counts.approved, color: "teal" },
    { key: "rejected", label: "Rejected", badge: counts.rejected, color: "red" },
    { key: "doctors", label: "All doctors", badge: counts.doctors },
  ];

  async function handleApprove(id: string) {
    setLoading(id);
    await approve({ id: id as any });
    setLoading(null);
  }

  async function handleReject(id: string) {
    setLoading(id);
    await reject({ id: id as any, reason: rejectReason || undefined });
    setRejectingId(null);
    setRejectReason("");
    setLoading(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Admin</p>
        <h1 className="text-2xl font-bold text-white">Personnel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === t.key ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
            }`}>
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full font-mono text-xs ${
                t.color === "amber" ? "bg-amber-500/20 text-amber-400" :
                t.color === "red" ? "bg-red-500/20 text-red-400" :
                "bg-teal-500/20 text-teal-400"
              }`}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* All doctors list */}
      {tab === "doctors" && (
        <div className="space-y-2">
          {doctors === undefined && <div className="h-16 rounded-xl border border-white/6 bg-white/2 animate-pulse" />}
          {doctors?.length === 0 && <p className="text-slate-500 text-sm">No registered doctors yet.</p>}
          {doctors?.map((d) => (
            <div key={d._id} className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-xs font-bold text-teal-400 shrink-0">
                {d.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{d.name}</p>
                <p className="text-xs text-slate-500">{d.email} {d.specialty ? `· ${d.specialty}` : ""}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {d.trustedContributor && (
                  <span className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">trusted</span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  d.verified
                    ? "text-teal-400 border-teal-500/20 bg-teal-500/10"
                    : "text-slate-500 border-white/10 bg-white/3"
                }`}>
                  {d.verified ? "verified" : "unverified"}
                </span>
                {d.contributionCount !== undefined && d.contributionCount > 0 && (
                  <span className="text-xs text-slate-500">{d.contributionCount} cases</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Applications */}
      {tab !== "doctors" && (
        <div className="space-y-4">
          {applications === undefined && <div className="h-24 rounded-xl border border-white/6 bg-white/2 animate-pulse" />}
          {filtered.length === 0 && applications !== undefined && (
            <div className="rounded-xl border border-dashed border-white/10 py-12 text-center">
              <p className="text-slate-500 text-sm">No {tab.replace("_", " ")} applications.</p>
            </div>
          )}
          {filtered.map((app) => (
            <div key={app._id} className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">{app.name}</p>
                  <p className="text-sm text-teal-400">{app.specialty} · {app.hospital}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{app.email} · {app.country}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-500">{new Date(app.submittedAt).toLocaleDateString()}</span>
                  {app.autoApprovedReason && (
                    <p className="text-xs text-teal-400 mt-0.5">{app.autoApprovedReason}</p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-white/6 bg-white/2 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">Why they want to contribute</p>
                <p className="text-sm text-slate-300">{app.note}</p>
              </div>

              {app.rejectionReason && (
                <p className="text-xs text-red-400 border border-red-500/20 bg-red-500/5 px-3 py-2 rounded-lg">
                  Rejected: {app.rejectionReason}
                </p>
              )}

              {app.status === "pending" && (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => handleApprove(app._id)} disabled={loading === app._id}
                    className="flex-1 py-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-semibold rounded-lg text-sm transition-colors">
                    {loading === app._id ? "Approving…" : "Approve"}
                  </button>
                  {rejectingId === app._id ? (
                    <div className="flex-1 space-y-2">
                      <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Reason (optional)"
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500" />
                      <div className="flex gap-2">
                        <button onClick={() => handleReject(app._id)} disabled={loading === app._id}
                          className="flex-1 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 font-semibold rounded-lg text-xs transition-colors">
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

              {app.status === "rejected" && (
                <button onClick={() => handleApprove(app._id)} disabled={loading === app._id}
                  className="w-full py-2 border border-teal-500/30 hover:border-teal-500/60 text-teal-400 font-semibold rounded-lg text-sm transition-colors">
                  Approve anyway
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
