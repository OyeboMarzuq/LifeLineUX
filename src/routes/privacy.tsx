import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — LifeLine" },
      { name: "description", content: "LifeLine privacy policy." },
    ],
  }),
});

function PrivacyPage() {
  return (
    <div className="container-page py-16 max-w-3xl">
      <h1 className="font-display text-3xl md:text-4xl font-bold">Privacy Policy</h1>
      <p className="text-muted-foreground mt-4">
        LifeLine is committed to protecting your personal information. This policy explains what data we collect, how we use it, and your rights.
      </p>

      <section className="mt-10 space-y-6">
        <div>
          <h2 className="font-semibold text-lg">1. Information we collect</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            We collect information you provide when creating an account, starting a campaign, or making a donation — such as your name, email address, phone number, and payment details. We also collect technical data like IP address and browser type to keep the platform secure.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-lg">2. How we use your information</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            We use your data to provide and improve LifeLine services, process donations, verify campaigns, communicate with you, and comply with legal obligations. We do not sell your personal information to third parties.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-lg">3. Sharing your information</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            We share information only with trusted service providers necessary to operate the platform — such as payment processors and identity verification services — and when required by law.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-lg">4. Data security</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            We implement industry-standard security measures to protect your data. However, no online service is completely secure, and we cannot guarantee absolute security.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-lg">5. Your rights</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            You may access, update, or delete your personal information by contacting us. You can also close your account at any time.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-lg">6. Changes to this policy</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            We may update this privacy policy from time to time. We will notify you of significant changes through the platform or by email.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-lg">7. Contact us</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            If you have questions about this privacy policy, please contact us at support@lifeline.health.
          </p>
        </div>
      </section>

      <p className="text-xs text-muted-foreground mt-12">Last updated: July 2026</p>
    </div>
  );
}
