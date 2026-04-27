import { GlassCard } from "@/components/GlassCard";

export const metadata = {
  title: "Privacy Policy | AfroRadiopedia",
  description: "How AfroRadiopedia collects, uses, and protects your personal data.",
};

const LAST_UPDATED = "25 April 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-3">{title}</h2>
      <div className="text-slate-400 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-slate-500 text-sm">Last updated: {LAST_UPDATED}</p>
      </div>

      <GlassCard className="space-y-10">
        <Section title="1. Introduction">
          <p>
            AfroRadiopedia (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you use our platform.
          </p>
          <p>
            By accessing or using AfroRadiopedia you agree to the practices described in
            this policy. If you do not agree, please discontinue use of the platform.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect information you provide directly to us:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Account information (name, email address, professional role)</li>
            <li>Doctor profile details (specialty, country, hospital affiliation)</li>
            <li>Medical images and associated clinical notes you choose to contribute</li>
            <li>Communications you send us</li>
          </ul>
          <p>We also collect information automatically:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Usage data (pages visited, features used, timestamps)</li>
            <li>Device and browser information</li>
            <li>IP address (used to detect geographic region only)</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>To provide, operate, and improve the platform</li>
            <li>To authenticate your identity and manage your account</li>
            <li>To process and display contributed clinical cases (with your consent)</li>
            <li>To power AI-assisted diagnostic suggestions</li>
            <li>To send service-related notifications (no marketing without opt-in)</li>
            <li>To comply with legal obligations</li>
          </ul>
        </Section>

        <Section title="4. Medical Images and Clinical Data">
          <p>
            Medical images and clinical notes contributed by verified doctors are stored
            securely via Cloudinary and used to build the AfroRadiopedia community
            knowledge base. By contributing a case you grant AfroRadiopedia a
            non-exclusive, royalty-free licence to use, display, and process that content
            for diagnostic assistance purposes.
          </p>
          <p>
            <strong className="text-amber-400">Important:</strong> Do not upload images
            containing personally identifiable patient information. All submissions must
            be de-identified in accordance with applicable health data regulations.
          </p>
        </Section>

        <Section title="5. Data Sharing">
          <p>We do not sell your personal data. We may share information with:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong className="text-slate-300">Service providers</strong> — Convex
              (database), Cloudinary (image storage), Google (authentication) — bound
              by confidentiality agreements
            </li>
            <li>
              <strong className="text-slate-300">AI services</strong> — Google Gemini
              processes anonymised scan images for diagnostic suggestions
            </li>
            <li>
              <strong className="text-slate-300">Legal requirements</strong> — where
              required by law or to protect rights and safety
            </li>
          </ul>
        </Section>

        <Section title="6. Data Retention">
          <p>
            We retain your account data for as long as your account is active. You may
            request deletion of your account and associated data at any time by
            contacting us at{" "}
            <a href="mailto:oluwaferanmiomitoyin@gmail.com" className="text-sky-400 hover:underline">
              oluwaferanmiomitoyin@gmail.com
            </a>
            . Contributed clinical cases that have been anonymised and incorporated into
            the knowledge base may be retained in aggregate form.
          </p>
        </Section>

        <Section title="7. Security">
          <p>
            We use industry-standard security measures including HTTPS encryption, signed
            Cloudinary uploads, and hashed credentials. However, no method of transmission
            over the internet is 100% secure and we cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="8. Your Rights">
          <p>Depending on your jurisdiction you may have the right to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict certain processing</li>
            <li>Data portability</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:oluwaferanmiomitoyin@gmail.com" className="text-sky-400 hover:underline">
              oluwaferanmiomitoyin@gmail.com
            </a>.
          </p>
        </Section>

        <Section title="9. Cookies">
          <p>
            We use only essential session cookies required for authentication. We do not
            use tracking, advertising, or third-party analytics cookies.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify registered
            users of material changes via email or an in-app notice. Continued use of the
            platform after changes constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            Questions about this policy? Contact us at{" "}
            <a href="mailto:oluwaferanmiomitoyin@gmail.com" className="text-sky-400 hover:underline">
              oluwaferanmiomitoyin@gmail.com
            </a>{" "}
            or call{" "}
            <a href="tel:+2348073319543" className="text-sky-400 hover:underline">
              +234 807 331 9543
            </a>.
          </p>
        </Section>
      </GlassCard>
    </main>
  );
}
