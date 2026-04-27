"use client";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Suspense, useState } from "react";
import Link from "next/link";

function RegisterForm() {
  const params = useSearchParams();
  const inviteCode = params.get("invite") ?? "";
  const [loading, setLoading] = useState(false);

  // Validate the invite code
  const invite = useQuery(
    api.inviteCodes.validate,
    inviteCode ? { code: inviteCode } : "skip"
  );

  // No invite code in URL
  if (!inviteCode) {
    return <NoInvite />;
  }

  // Still checking
  if (invite === undefined) {
    return (
      <div className="text-center py-8">
        <div className="w-6 h-6 border-2 border-white/10 border-t-teal-400 rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  // Invalid or used code
  if (invite === null) {
    return <InvalidInvite />;
  }

  // Valid code — show registration
  async function handleRegister() {
    setLoading(true);
    localStorage.setItem("pending_invite", inviteCode);
    await signIn("google", { callbackUrl: "/doctor/dashboard" });
  }

  return (
    <div className="space-y-5">
      {/* Valid invite badge */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-teal-500/30 bg-teal-500/5">
        <svg className="w-4 h-4 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-xs font-semibold text-teal-400">Valid invitation</p>
          {invite.email && (
            <p className="text-xs text-slate-400">Linked to {invite.email}</p>
          )}
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-2">
        {[
          "Upload X-rays and scans with your clinical notes",
          "Your cases power AI recommendations for remote doctors",
          "Track how often your notes have been used",
        ].map((item) => (
          <div key={item} className="flex items-start gap-2 text-sm text-slate-400">
            <svg className="w-3.5 h-3.5 text-teal-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {item}
          </div>
        ))}
      </div>

      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-lg transition-colors disabled:opacity-60 text-sm"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {loading ? "Redirecting…" : "Accept invite & sign up with Google"}
      </button>

      <p className="text-center text-xs text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="text-teal-400 hover:text-teal-300 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function NoInvite() {
  return (
    <div className="text-center space-y-4 py-4">
      <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/3 flex items-center justify-center text-slate-500 mx-auto">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <div>
        <p className="text-white font-semibold">Invitation required</p>
        <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">
          The doctor portal is invite-only. Contact the AfroRadiopedia team to request access.
        </p>
      </div>
      <a
        href="mailto:oluwaferanmiomitoyin@gmail.com?subject=Doctor%20Access%20Request&body=Hi%2C%20I%27d%20like%20to%20join%20AfroRadiopedia%20as%20a%20contributing%20doctor."
        className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white py-2 px-5 rounded-lg text-sm transition-colors"
      >
        Request an invitation
      </a>
      <div className="pt-2">
        <Link href="/analyze" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
          Analyze a scan without an account →
        </Link>
      </div>
    </div>
  );
}

function InvalidInvite() {
  return (
    <div className="text-center space-y-4 py-4">
      <div className="w-12 h-12 rounded-xl border border-red-500/20 bg-red-500/5 flex items-center justify-center text-red-400 mx-auto">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <div>
        <p className="text-white font-semibold">Invitation invalid or expired</p>
        <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">
          This invite link has already been used or has expired. Contact the team for a new one.
        </p>
      </div>
      <a
        href="mailto:oluwaferanmiomitoyin@gmail.com?subject=New%20Invite%20Request"
        className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white py-2 px-5 rounded-lg text-sm transition-colors"
      >
        Request a new invite
      </a>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#060d17]">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span className="text-sm font-semibold text-white">AfroRadiopedia</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-white">Join as a Doctor</h1>
          <p className="mt-2 text-sm text-slate-400">
            Contribute cases and help remote doctors across Africa.
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/3 p-6">
          <Suspense fallback={
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-white/10 border-t-teal-400 rounded-full animate-spin" />
            </div>
          }>
            <RegisterForm />
          </Suspense>
        </div>

      </div>
    </div>
  );
}
