"use client";
import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";

export function DoctorVerificationGate({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const application = useQuery(
    api.doctorApplications.getByEmail,
    session?.user?.email ? { email: session.user.email } : "skip"
  );

  if (application === undefined) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-7 h-7 border-2 border-white/10 border-t-teal-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!application) {
    return (
      <Blocked
        icon="apply"
        title="Apply to contribute"
        body="The contributor portal requires an approved application. Takes 2 minutes."
        action={{ label: "Apply now →", href: "/doctor-access" }}
      />
    );
  }

  if (application.status === "pending") {
    return (
      <Blocked
        icon="clock"
        title="Application under review"
        body="We review all applications within 24–48 hours. You'll have full access once approved."
        sub={`Submitted as ${application.email}`}
      />
    );
  }

  if (application.status === "rejected") {
    return (
      <Blocked
        icon="lock"
        title="Application not approved"
        body={application.rejectionReason ?? "Your application was not approved at this time."}
        action={{ label: "Re-apply →", href: "/doctor-access" }}
      />
    );
  }

  return <>{children}</>;
}

function Blocked({
  icon,
  title,
  body,
  sub,
  action,
}: {
  icon: "apply" | "clock" | "lock";
  title: string;
  body: string;
  sub?: string;
  action?: { label: string; href: string };
}) {
  const icons = {
    apply: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    clock: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    lock: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  };

  const colors = {
    apply: "border-teal-500/20 bg-teal-500/5 text-teal-400",
    clock: "border-amber-500/20 bg-amber-500/5 text-amber-400",
    lock: "border-red-500/20 bg-red-500/5 text-red-400",
  };

  return (
    <div className="flex items-center justify-center py-24 px-4">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto ${colors[icon]}`}>
          {icons[icon]}
        </div>
        <div>
          <p className="text-white font-semibold">{title}</p>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">{body}</p>
          {sub && <p className="text-slate-600 text-xs mt-1">{sub}</p>}
        </div>
        {action && (
          <Link href={action.href}
            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold py-2 px-6 rounded-lg text-sm transition-colors">
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}
