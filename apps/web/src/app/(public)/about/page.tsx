import Image from "next/image";
import Link from "next/link";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";

export const metadata = {
  title: "About | AfroRadiopedia",
  description:
    "AfroRadiopedia bridges the healthcare gap in Africa through AI-powered diagnostic assistance for medical professionals.",
};

const pillars = [
  {
    title: "Empower remote doctors",
    body: "Give every clinician — regardless of location — AI-assisted diagnostic support and a knowledge base built by their peers.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: "Built for low bandwidth",
    body: "Designed from the ground up for 2G and 3G connections — from urban hospitals to the most remote health posts on the continent.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    ),
  },
  {
    title: "Open knowledge base",
    body: "Real cases contributed by real doctors form a living database that grows more accurate and relevant with every submission.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="pt-28 pb-20 border-b border-white/6">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-400 mb-4">About</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight max-w-2xl">
            Built for the doctor who has no backup.
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-2xl leading-relaxed">
            AfroRadiopedia exists because a doctor in a rural clinic in Nigeria, Ghana, or
            Kenya shouldn&apos;t have to guess. They should have the same access to expertise
            as a hospital in London — on whatever internet connection they have.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-20 border-b border-white/6">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-10">What we stand for</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {pillars.map((p) => (
              <div key={p.title} className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-3">
                <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                  {p.icon}
                </div>
                <h3 className="font-semibold text-white text-sm">{p.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-20 border-b border-white/6">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-10">Founder</h2>
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0">
              <Image
                src="https://images.squarespace-cdn.com/content/v1/58d451526a49630cabca750d/382ab570-20c8-400e-8349-2d07486dccb8/Oluwaferanmi+Omitoyins+photo.jpg?format=750w"
                alt="Dr Oluwaferanmi Omitoyin"
                fill
                className="rounded-xl object-cover border border-white/10"
                sizes="128px"
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Dr. Oluwaferanmi Omitoyin</h3>
              <p className="text-sm text-teal-400 mt-1 mb-4">Founder & CEO</p>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                Medical doctor, researcher, and public health physician with over seven years
                of experience as a mental health advocate reaching 20,000+ young people.
                Recognized in Forbes as a Gratitude Network Fellow (2019) and former Board
                Advisory Member of the Born This Way Foundation. Dr. Omitoyin built
                AfroRadiopedia from first-hand experience with the specialist gap in African
                healthcare.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Are you a clinician?</h2>
          <p className="mt-4 text-slate-400 max-w-lg mx-auto">
            Your cases build the knowledge base. Your notes help a remote doctor
            make the right call. Join the movement.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold py-3 px-8 rounded-lg transition-colors text-sm"
          >
            Join as a Doctor
          </Link>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 pb-16">
        <MedicalDisclaimer />
      </div>
    </main>
  );
}
