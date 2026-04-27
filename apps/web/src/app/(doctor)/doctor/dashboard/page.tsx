import { GlassCard } from "@/components/GlassCard";
import Link from "next/link";

export default function DoctorDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Doctor Dashboard</h1>
        <p className="mt-1 text-slate-400 text-sm">
          Welcome back. Help build the knowledge base that powers diagnostics across Africa.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        <GlassCard>
          <p className="text-3xl font-extrabold text-sky-400">0</p>
          <p className="text-sm text-slate-400 mt-1">Cases Contributed</p>
        </GlassCard>
        <GlassCard>
          <p className="text-3xl font-extrabold text-teal-400">0</p>
          <p className="text-sm text-slate-400 mt-1">Times Your Notes Were Used</p>
        </GlassCard>
        <GlassCard>
          <p className="text-3xl font-extrabold text-purple-400">0</p>
          <p className="text-sm text-slate-400 mt-1">Patients Helped</p>
        </GlassCard>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="font-bold text-lg mb-2">Contribute a Case</h2>
          <p className="text-slate-400 text-sm mb-4">
            Upload an X-ray, mammogram, or scan with your clinical notes and confirmed diagnosis.
          </p>
          <Link
            href="/doctor/contribute"
            className="inline-block bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
          >
            Upload Case
          </Link>
        </GlassCard>

        <GlassCard>
          <h2 className="font-bold text-lg mb-2">My Cases</h2>
          <p className="text-slate-400 text-sm mb-4">
            View, edit, or delete the cases you have contributed to the knowledge base.
          </p>
          <Link
            href="/doctor/my-cases"
            className="inline-block bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
          >
            View My Cases
          </Link>
        </GlassCard>
      </div>
    </div>
  );
}
