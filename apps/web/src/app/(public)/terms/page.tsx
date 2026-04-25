import { GlassCard } from "@/components/GlassCard";

export const metadata = {
  title: "Terms & Conditions | AfroRadiopedia",
  description: "Terms and conditions governing use of the AfroRadiopedia platform.",
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

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight">Terms &amp; Conditions</h1>
        <p className="mt-2 text-slate-500 text-sm">Last updated: {LAST_UPDATED}</p>
      </div>

      {/* Critical disclaimer banner */}
      <div className="mb-8 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm text-amber-300">
        <strong>Medical Disclaimer:</strong> AfroRadiopedia provides AI-assisted diagnostic
        suggestions and a community knowledge base for informational and educational
        purposes only. It is <strong>not a substitute</strong> for professional medical
        judgment. All clinical decisions must be made by qualified healthcare professionals.
      </div>

      <GlassCard className="space-y-10">
        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using AfroRadiopedia (the &quot;Platform&quot;), you agree to be
            bound by these Terms &amp; Conditions and our{" "}
            <a href="/privacy" className="text-sky-400 hover:underline">Privacy Policy</a>.
            If you do not agree, do not use the Platform.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <p>
            The Platform is intended for use by licensed medical professionals, medical
            students, and individuals seeking general health information. By registering
            as a doctor you represent that you hold a valid medical licence in your
            jurisdiction.
          </p>
          <p>
            You must be at least 18 years of age to create an account.
          </p>
        </Section>

        <Section title="3. Platform Description">
          <p>AfroRadiopedia provides:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>AI-assisted analysis of medical scan images via the Analyze Scan tool</li>
            <li>
              A community knowledge base of de-identified clinical cases contributed by
              verified doctors
            </li>
            <li>Tools for doctors to contribute, annotate, and manage clinical cases</li>
          </ul>
        </Section>

        <Section title="4. Medical Disclaimer">
          <p>
            <strong className="text-amber-400">The Platform does not provide medical advice,
            diagnosis, or treatment.</strong> AI-generated findings are probabilistic
            suggestions intended to assist — not replace — clinical judgment.
          </p>
          <p>
            Always apply your professional training when interpreting results. In
            emergencies, contact local emergency services immediately.
          </p>
        </Section>

        <Section title="5. Doctor Accounts and Contributions">
          <p>
            Verified doctor accounts may contribute clinical cases to the knowledge base.
            By contributing you agree that:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              All images and notes have been fully de-identified; no patient-identifiable
              information (name, date of birth, ID numbers, face) is included
            </li>
            <li>
              You have obtained any required consent from your institution or patient in
              accordance with applicable law
            </li>
            <li>
              You grant AfroRadiopedia a perpetual, royalty-free licence to display and
              use the contributed content for platform purposes
            </li>
            <li>
              You are solely responsible for the accuracy of the clinical information
              you submit
            </li>
          </ul>
        </Section>

        <Section title="6. Prohibited Conduct">
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Upload patient-identifiable data or images</li>
            <li>Misrepresent your professional credentials</li>
            <li>Use the Platform for any commercial purpose without prior written consent</li>
            <li>Attempt to reverse-engineer, scrape, or disrupt the Platform</li>
            <li>Upload malicious, abusive, or illegal content</li>
            <li>
              Present AI-generated results to patients as definitive medical diagnoses
            </li>
          </ul>
        </Section>

        <Section title="7. Intellectual Property">
          <p>
            AfroRadiopedia and its original content, features, and functionality are owned
            by AfroRadiopedia and protected by applicable intellectual property laws.
            Contributed clinical content remains the intellectual property of the
            contributing doctor, subject to the licence granted in Section 5.
          </p>
        </Section>

        <Section title="8. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, AfroRadiopedia shall not be liable
            for any indirect, incidental, special, consequential, or punitive damages
            arising from your use of the Platform, including any clinical decisions made
            in reliance on Platform outputs.
          </p>
          <p>
            Our total liability to you for any claim shall not exceed the amount paid by
            you (if any) to use the Platform in the 12 months preceding the claim.
          </p>
        </Section>

        <Section title="9. Indemnification">
          <p>
            You agree to indemnify and hold harmless AfroRadiopedia, its officers,
            directors, and employees from any claims, losses, or expenses (including
            legal fees) arising from your use of the Platform, your contributions, or
            your violation of these Terms.
          </p>
        </Section>

        <Section title="10. Account Termination">
          <p>
            We reserve the right to suspend or terminate accounts that violate these
            Terms, upload patient-identifiable data, or misrepresent professional
            credentials, without prior notice.
          </p>
          <p>
            You may delete your account at any time by contacting us at{" "}
            <a href="mailto:oluwaferanmiomitoyin@gmail.com" className="text-sky-400 hover:underline">
              oluwaferanmiomitoyin@gmail.com
            </a>.
          </p>
        </Section>

        <Section title="11. Governing Law">
          <p>
            These Terms are governed by the laws of the Federal Republic of Nigeria.
            Any disputes shall be subject to the exclusive jurisdiction of the courts
            of Nigeria.
          </p>
        </Section>

        <Section title="12. Changes to Terms">
          <p>
            We may revise these Terms at any time. We will notify registered users of
            material changes via email or an in-app notice. Continued use after changes
            constitutes acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>
            Questions about these Terms? Contact us at{" "}
            <a href="mailto:oluwaferanmiomitoyin@gmail.com" className="text-sky-400 hover:underline">
              oluwaferanmiomitoyin@gmail.com
            </a>.
          </p>
        </Section>
      </GlassCard>
    </main>
  );
}
