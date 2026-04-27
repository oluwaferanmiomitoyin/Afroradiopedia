"use client";
import { useSession, signIn } from "next-auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import Link from "next/link";

const SPECIALTIES = [
  "Radiology", "Pulmonology", "Cardiology", "Orthopedics",
  "Oncology", "Neurology", "Obstetrics & Gynecology",
  "Pediatrics", "General Practice", "Emergency Medicine",
  "Surgery", "Pathology", "Other",
];

export default function DoctorAccessPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Shell><div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-white/10 border-t-teal-400 rounded-full animate-spin" /></div></Shell>;
  }

  if (!session) {
    return <Shell><SignInPrompt /></Shell>;
  }

  return <Shell><ApplicationForm email={session.user!.email!} name={session.user!.name ?? ""} /></Shell>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#060d17] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span className="text-sm font-semibold text-white">AfroRadiopedia</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4">Apply to contribute</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
            Share your clinical expertise. Help a remote doctor make the right call tonight.
          </p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function SignInPrompt() {
  const [loading, setLoading] = useState(false);
  return (
    <div className="space-y-5 text-center">
      <div className="space-y-2 text-sm text-slate-400">
        {["Upload real scans with your clinical notes", "Help doctors across Africa make accurate diagnoses", "Build Africa's largest open diagnostic knowledge base"].map((item) => (
          <div key={item} className="flex items-center gap-2 text-left">
            <svg className="w-4 h-4 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {item}
          </div>
        ))}
      </div>
      <div className="border-t border-white/6 pt-5">
        <p className="text-xs text-slate-500 mb-3">Sign in with Google to begin your application</p>
        <button
          onClick={async () => { setLoading(true); await signIn("google"); }}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-lg transition-colors disabled:opacity-60 text-sm"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? "Redirecting…" : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}

function ApplicationForm({ email, name }: { email: string; name: string }) {
  const apply = useMutation(api.doctorApplications.apply);
  const existing = useQuery(api.doctorApplications.getByEmail, { email });

  const [specialty, setSpecialty] = useState("");
  const [hospital, setHospital] = useState("");
  const [country, setCountry] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  // Already applied
  if (existing === undefined) {
    return <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-white/10 border-t-teal-400 rounded-full animate-spin" /></div>;
  }

  if (existing?.status === "approved") {
    return (
      <div className="text-center space-y-3 py-4">
        <div className="w-12 h-12 rounded-xl border border-teal-500/30 bg-teal-500/10 flex items-center justify-center text-teal-400 mx-auto">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-white font-semibold">You&apos;re approved!</p>
        <Link href="/doctor/dashboard" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold py-2 px-6 rounded-lg text-sm transition-colors">
          Go to your dashboard →
        </Link>
      </div>
    );
  }

  if (existing?.status === "pending") {
    return (
      <div className="text-center space-y-3 py-4">
        <div className="w-12 h-12 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-center text-amber-400 mx-auto">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-white font-semibold">Application under review</p>
        <p className="text-slate-400 text-sm">We&apos;ll review your application within 24–48 hours. You&apos;ll be able to access the contributor dashboard once approved.</p>
        <p className="text-xs text-slate-600">{email}</p>
      </div>
    );
  }

  if (existing?.status === "rejected") {
    return (
      <div className="text-center space-y-3 py-4">
        <div className="w-12 h-12 rounded-xl border border-red-500/20 bg-red-500/5 flex items-center justify-center text-red-400 mx-auto">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-white font-semibold">Application not approved</p>
        {existing.rejectionReason && <p className="text-slate-400 text-sm">{existing.rejectionReason}</p>}
        <p className="text-slate-500 text-xs">You may re-apply with updated information.</p>
        <button onClick={() => setStatus("idle")} className="text-sm text-teal-400 hover:text-teal-300 transition-colors">
          Re-apply →
        </button>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="text-center space-y-3 py-4">
        <div className="w-12 h-12 rounded-xl border border-teal-500/30 bg-teal-500/10 flex items-center justify-center text-teal-400 mx-auto">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-white font-semibold">Application received</p>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">We&apos;ll review your application within 24–48 hours and reach out to {email}.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      await apply({ email, name, specialty, hospital, country, note });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Pre-filled from Google */}
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/8">
        <div className="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-xs font-bold text-teal-400 shrink-0">
          {name[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{name}</p>
          <p className="text-xs text-slate-500">{email}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Specialty *</label>
          <select required value={specialty} onChange={(e) => setSpecialty(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500">
            <option value="">Select…</option>
            {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Country *</label>
          <input required value={country} onChange={(e) => setCountry(e.target.value)}
            placeholder="Nigeria" className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Hospital / Clinic *</label>
        <input required value={hospital} onChange={(e) => setHospital(e.target.value)}
          placeholder="University College Hospital, Ibadan" className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Why do you want to contribute? *</label>
        <textarea required value={note} onChange={(e) => setNote(e.target.value)} rows={3}
          placeholder="Briefly tell us about your experience and why you want to help build AfroRadiopedia's knowledge base…"
          className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none" />
      </div>

      {status === "error" && <p className="text-xs text-red-400">Something went wrong. Please try again.</p>}

      <button type="submit" disabled={status === "submitting"}
        className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-semibold rounded-lg transition-colors text-sm">
        {status === "submitting" ? "Submitting…" : "Submit application"}
      </button>

      <p className="text-center text-xs text-slate-600">
        We review all applications personally and respond within 24–48 hours.
      </p>
    </form>
  );
}
