"use client";
import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";

// Note: metadata export is in a separate layout or via generateMetadata pattern
// Contact page is a client component so metadata is set via document title fallback

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // mailto fallback — no backend needed; opens mail client
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;
    const subject = encodeURIComponent(`AfroRadiopedia enquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:oluwaferanmiomitoyin@gmail.com?subject=${subject}&body=${body}`;
    setLoading(false);
    setSent(true);
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-16">
      {/* Hero */}
      <section className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Contact Us</h1>
        <p className="mt-6 text-lg text-slate-300 max-w-xl mx-auto">
          We&apos;d love to hear from you. Whether you have a question about our
          mission, partnerships, or anything else, our team is ready to help.
        </p>
      </section>

      <div className="grid sm:grid-cols-2 gap-8">
        {/* Contact details */}
        <div className="space-y-6">
          <GlassCard>
            <div className="flex items-start gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-sky-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <h3 className="font-semibold text-white">Email</h3>
                <a href="mailto:oluwaferanmiomitoyin@gmail.com" className="text-slate-300 hover:text-sky-400 transition-colors text-sm break-all">
                  oluwaferanmiomitoyin@gmail.com
                </a>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-start gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-sky-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <h3 className="font-semibold text-white">Phone</h3>
                <a href="tel:+2348073319543" className="text-slate-300 hover:text-sky-400 transition-colors text-sm">
                  +234 807 331 9543
                </a>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-start gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-sky-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-white">Location</h3>
                <p className="text-slate-300 text-sm">Nigeria, Africa</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Contact form */}
        <GlassCard>
          {sent ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">✉️</div>
              <h3 className="font-semibold text-white">Your mail client opened!</h3>
              <p className="text-slate-400 text-sm mt-2">
                Send the email from your mail client to complete your message.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sky-400 mb-1">Name</label>
                <input
                  name="name"
                  required
                  type="text"
                  placeholder="Dr. Jane Doe"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sky-400 mb-1">Email</label>
                <input
                  name="email"
                  required
                  type="email"
                  placeholder="you@hospital.org"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sky-400 mb-1">Message</label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="How can we help?"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                {loading ? "Opening…" : "Send Message"}
              </button>
            </form>
          )}
        </GlassCard>
      </div>
    </main>
  );
}
