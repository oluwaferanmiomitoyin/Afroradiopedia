import { GlassCard } from "@/components/GlassCard";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About Us | AfroRadiopedia",
  description:
    "AfroRadiopedia bridges the healthcare gap in Africa through AI-powered diagnostic assistance for medical professionals.",
};

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-20">
      {/* Hero */}
      <section className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">About Us</h1>
        <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto">
          AfroRadiopedia was founded on a simple but powerful idea: to leverage
          artificial intelligence to bridge the healthcare gap in Africa. We are
          committed to providing world-class diagnostic assistance to medical
          professionals, especially those in remote and underserved regions.
        </p>
      </section>

      {/* Mission */}
      <section>
        <h2 className="text-2xl font-bold mb-8 text-center">Our Mission</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: "🩺",
              title: "Empower Doctors",
              body: "Give every clinician — regardless of location — access to AI-assisted diagnostic tools and a community knowledge base built by their peers.",
            },
            {
              icon: "🌍",
              title: "Serve Africa",
              body: "Built from the ground up for low-bandwidth environments across the continent, from urban hospitals to rural health posts.",
            },
            {
              icon: "🤝",
              title: "Open Knowledge",
              body: "Real cases contributed by real doctors form a living knowledge base that grows smarter with every submission.",
            },
          ].map((item) => (
            <GlassCard key={item.title} className="text-center">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400">{item.body}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Founder */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-8">Founder &amp; CEO</h2>
        <GlassCard>
          <div className="flex flex-col sm:flex-row gap-8 items-center">
            <div className="relative w-36 h-36 flex-shrink-0">
              <Image
                src="https://images.squarespace-cdn.com/content/v1/58d451526a49630cabca750d/382ab570-20c8-400e-8349-2d07486dccb8/Oluwaferanmi+Omitoyins+photo.jpg?format=750w"
                alt="Dr Oluwaferanmi Omitoyin"
                fill
                className="rounded-full object-cover border-4 border-slate-700"
                sizes="144px"
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Dr. Oluwaferanmi Omitoyin</h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                Dr. Oluwaferanmi Omitoyin is a medical doctor, researcher, and public
                health physician with over seven years of experience as a mental health
                advocate. His work has reached over 20,000 young people. Recognized in
                Forbes Magazine as a Gratitude Network Fellow in 2019, he has served in
                various leadership roles, including as a Board Advisory Member of the
                Born This Way Foundation (BTWF). He brings his passion for accessible
                healthcare and technology to lead AfroRadiopedia&apos;s mission.
              </p>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* CTA */}
      <section className="text-center">
        <h2 className="text-2xl font-bold mb-4">Join the Movement</h2>
        <p className="text-slate-400 mb-6">
          Are you a medical professional? Contribute your expertise and help build
          the largest open diagnostic knowledge base for Africa.
        </p>
        <Link
          href="/register"
          className="inline-block bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          Join as a Doctor
        </Link>
      </section>

      <MedicalDisclaimer />
    </main>
  );
}
