import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main>

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-20 overflow-hidden">

          {/* Grid background */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right,rgba(255,255,255,0.03) 1px,transparent 1px)," +
                "linear-gradient(to bottom,rgba(255,255,255,0.03) 1px,transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
          {/* Glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-125 rounded-full blur-[140px]"
            style={{ background: "radial-gradient(ellipse,rgba(20,184,166,0.12) 0%,transparent 70%)" }}
          />

          <div className="relative max-w-5xl mx-auto px-5 sm:px-8 w-full">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-xs font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              AI-Powered · Works on 2G · Built for Africa
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] text-white">
              When there&apos;s no<br />
              specialist,<br />
              <span className="text-teal-400">there&apos;s us.</span>
            </h1>

            <p className="mt-7 text-lg text-slate-400 max-w-lg leading-relaxed">
              Upload a scan. Get AI-powered findings backed by real clinical notes
              from African doctors. No specialist needed on-site.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold py-3 px-6 rounded-lg transition-colors text-sm"
              >
                Analyze a Scan
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <a
                href="mailto:oluwaferanmiomitoyin@gmail.com?subject=Doctor%20Access%20Request&body=Hi%2C%20I%27d%20like%20to%20join%20AfroRadiopedia%20as%20a%20contributing%20doctor."
                className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-colors bg-white/5 hover:bg-white/8 text-sm"
              >
                Request Doctor Access
              </a>
            </div>

            {/* Stats */}
            <div className="mt-20 pt-10 border-t border-white/8 flex flex-wrap gap-10 sm:gap-16">
              {[
                { value: "14", label: "detectable conditions" },
                { value: "2G/3G", label: "minimum connectivity" },
                { value: "7", label: "scan types supported" },
                { value: "Free", label: "open access, always" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-bold text-white">{s.value}</div>
                  <div className="text-sm text-slate-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── The Problem ──────────────────────────────────── */}
        <section className="border-t border-white/6 py-24 bg-white/1.5">
          <div className="max-w-5xl mx-auto px-5 sm:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-teal-400 mb-4">The Problem</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-white leading-snug">
                  Africa has 3% of the world&apos;s doctors.<br />
                  25% of the global disease burden.
                </h2>
                <p className="mt-5 text-slate-400 leading-relaxed">
                  Remote doctors conduct tests daily but lack access to radiologists,
                  pathologists, and specialists who can interpret results. Patients
                  wait weeks — or never get answers at all.
                </p>
                <p className="mt-4 text-slate-400 leading-relaxed">
                  AfroRadiopedia puts that expertise in their pocket — right now,
                  on whatever connection they have.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { stat: "1.4B", desc: "people underserved by specialist care" },
                  { stat: "< 1", desc: "radiologist per 100,000 people in sub-Saharan Africa" },
                  { stat: "72%", desc: "of diagnoses delayed due to lack of specialists" },
                  { stat: "2G", desc: "the connectivity we design for first" },
                ].map((item) => (
                  <div
                    key={item.stat}
                    className="rounded-xl border border-white/8 bg-white/3 p-5"
                  >
                    <div className="text-2xl font-bold text-teal-400">{item.stat}</div>
                    <p className="mt-1.5 text-xs text-slate-400 leading-snug">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────── */}
        <section className="py-24 border-t border-white/6">
          <div className="max-w-5xl mx-auto px-5 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-400 mb-4">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-16">Three steps. Any device.</h2>

            <div className="grid md:grid-cols-3 gap-6 relative">
              {/* Connector line */}
              <div
                aria-hidden
                className="hidden md:block absolute top-7 left-[calc(33.33%+12px)] right-[calc(33.33%+12px)] h-px bg-white/8"
              />

              {[
                {
                  n: "01",
                  title: "Upload a scan",
                  body: "Select the scan type, upload your image, and describe symptoms. We compress it automatically — fast even on 2G.",
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ),
                },
                {
                  n: "02",
                  title: "AI + knowledge base",
                  body: "Gemini Vision analyses the image. We match it against real cases contributed by African doctors.",
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                },
                {
                  n: "03",
                  title: "Get recommendations",
                  body: "Receive primary findings, a confidence score, matched doctor notes, and a specialist referral.",
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
              ].map((step) => (
                <div key={step.n} className="relative rounded-xl border border-white/8 bg-white/3 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                      {step.icon}
                    </div>
                    <span className="text-xs font-mono text-slate-600">{step.n}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold py-3 px-8 rounded-lg transition-colors text-sm"
              >
                Try it now — it&apos;s free
              </Link>
            </div>
          </div>
        </section>

        {/* ── For doctors ──────────────────────────────────── */}
        <section className="py-24 border-t border-white/6 bg-white/1.5">
          <div className="max-w-5xl mx-auto px-5 sm:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-teal-400 mb-4">For Doctors</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-white leading-snug">
                  Your expertise<br />saves a life tonight.
                </h2>
                <p className="mt-5 text-slate-400 leading-relaxed">
                  Upload a real case — an X-ray with your notes, your interpretation,
                  your confirmed diagnosis. That case becomes part of the knowledge base
                  another doctor draws on at 2am in a clinic with no specialist in reach.
                </p>
                <p className="mt-4 text-slate-400 leading-relaxed">
                  No payment. No bureaucracy. Just upload.
                </p>
                <a
                  href="mailto:oluwaferanmiomitoyin@gmail.com?subject=Doctor%20Access%20Request&body=Hi%2C%20I%27d%20like%20to%20join%20AfroRadiopedia%20as%20a%20contributing%20doctor."
                  className="mt-8 inline-flex items-center gap-2 border border-teal-500/40 hover:border-teal-500/70 text-teal-400 font-semibold py-3 px-6 rounded-lg transition-colors text-sm bg-teal-500/5 hover:bg-teal-500/10"
                >
                  Request Doctor Access
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
              <div className="space-y-3">
                {[
                  "Chest X-rays — pneumonia, TB, effusion, cardiomegaly",
                  "Mammograms — masses, calcifications, asymmetry",
                  "Bone X-rays — fractures, dislocations, tumours",
                  "MRI, CT scans, ultrasound and more",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-lg border border-white/6 bg-white/3 px-4 py-3">
                    <svg className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-white/6 py-10">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span className="text-sm font-semibold text-white">AfroRadiopedia</span>
            <span className="text-slate-600 text-sm ml-2">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-slate-500">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
