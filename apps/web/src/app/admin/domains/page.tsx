"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";

const OFFICIAL_PATTERNS = [
  ".gov.ng", ".gov.gh", ".gov.ke", ".gov.za", ".gov.ug", ".gov.tz",
  ".edu.ng", ".edu.gh",
  ".ac.za", ".ac.ke", ".ac.ug", ".ac.tz", ".ac.gh",
];

export default function DomainsPage() {
  const domains = useQuery(api.trustedDomains.list);
  const addDomain = useMutation(api.trustedDomains.add);
  const removeDomain = useMutation(api.trustedDomains.remove);

  const [domain, setDomain] = useState("");
  const [institution, setInstitution] = useState("");
  const [country, setCountry] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!domain || !institution || !country) return;
    setAdding(true);
    await addDomain({ domain, institution, country });
    setDomain(""); setInstitution(""); setCountry("");
    setAdding(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Admin</p>
        <h1 className="text-2xl font-bold text-white">Trusted Domains</h1>
        <p className="mt-1 text-slate-400 text-sm">
          Doctors with these email domains are auto-approved. Built-in patterns plus custom entries you add here.
        </p>
      </div>

      {/* Built-in patterns */}
      <div className="rounded-xl border border-white/8 bg-white/3 p-5">
        <h2 className="text-sm font-semibold text-white mb-3">Built-in patterns (always active)</h2>
        <div className="flex flex-wrap gap-2">
          {OFFICIAL_PATTERNS.map((p) => (
            <span key={p} className="text-xs font-mono text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-lg">
              *{p}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">
          These cover all African government health (.gov.*) and academic (.edu.*, .ac.*) domains automatically.
        </p>
      </div>

      {/* Add custom domain */}
      <div className="rounded-xl border border-white/8 bg-white/3 p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Add a hospital domain</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Email domain *</label>
              <input value={domain} onChange={(e) => setDomain(e.target.value)} required
                placeholder="luth.gov.ng"
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Institution name *</label>
              <input value={institution} onChange={(e) => setInstitution(e.target.value)} required
                placeholder="Lagos University Teaching Hospital"
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Country *</label>
              <input value={country} onChange={(e) => setCountry(e.target.value)} required
                placeholder="Nigeria"
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500" />
            </div>
          </div>
          <button type="submit" disabled={adding}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-semibold py-2 px-5 rounded-lg text-sm transition-colors">
            {adding ? "Adding…" : "Add domain"}
          </button>
        </form>
      </div>

      {/* Custom domains list */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Custom domains ({domains?.length ?? 0})</h2>
        {domains?.length === 0 && (
          <p className="text-slate-500 text-sm">No custom domains added yet.</p>
        )}
        <div className="space-y-2">
          {domains?.map((d) => (
            <div key={d._id} className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono text-teal-400">@{d.domain}</code>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="text-sm text-white">{d.institution}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{d.country} · added {new Date(d.addedAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => removeDomain({ id: d._id })}
                className="text-xs text-slate-600 hover:text-red-400 transition-colors shrink-0">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
