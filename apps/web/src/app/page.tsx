import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { GlassCard } from "@/components/GlassCard";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main>
        {/* Hero */}
        <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden pt-16">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 z-0" />
          <div className="relative z-10 max-w-3xl mx-auto px-4">
            <span className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-semibold bg-sky-900/60 text-sky-300 border border-sky-700">
              Built for Africa · Optimised for low bandwidth
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-teal-300">
              The Future of African Diagnostics
            </h1>
            <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto">
              AI-powered scan analysis backed by a growing knowledge base of real
              clinical cases from African doctors. Works on 2G/3G — no specialist
              required on-site.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/analyze"
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Analyze a Scan
              </Link>
              <Link
                href="/register"
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Contribute as a Doctor
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-slate-900">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-16">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Upload a Scan",
                  desc: "Upload a chest X-ray, mammogram, MRI, or any diagnostic image. We compress it automatically — fast even on 2G.",
                },
                {
                  step: "02",
                  title: "AI + Knowledge Base",
                  desc: "Our AI analyses the image and matches it against hundreds of real cases contributed by African doctors.",
                },
                {
                  step: "03",
                  title: "Get Recommendations",
                  desc: "Receive possible findings, doctor notes for similar cases, and a recommended specialist type.",
                },
              ].map((item) => (
                <GlassCard key={item.step} className="text-center">
                  <span className="text-4xl font-extrabold text-sky-700">
                    {item.step}
                  </span>
                  <h3 className="mt-4 text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-slate-400 text-sm">{item.desc}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* For doctors CTA */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Are You a Doctor?
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Join a growing community of African specialists contributing real
              clinical cases. Your notes help a remote doctor make the right call
              tonight.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Register as a Doctor
            </Link>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="pb-16">
          <div className="max-w-3xl mx-auto px-4">
            <MedicalDisclaimer />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} AfroRadiopedia. Empowering African diagnostics.
      </footer>
    </>
  );
}

