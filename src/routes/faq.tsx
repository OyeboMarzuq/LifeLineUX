import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/faq")({
  component: FaqPage,
  head: () => ({ meta: [{ title: "FAQ — LifeLine" }] }),
});

const faqs = [
  { q: "Is LifeLine free to use?", a: "Creating a campaign is free. A small platform fee covers payment processing and verification — clearly displayed at checkout." },
  { q: "How are campaigns verified?", a: "Our team reviews medical documents, contacts the hospital, and confirms identity within 24 hours." },
  { q: "Which countries are supported?", a: "We currently support Nigeria, Ghana, and Kenya, with more African countries rolling out monthly." },
  { q: "Can donors give anonymously?", a: "Yes. Donors can opt to hide their name from public displays while keeping a record for receipt." },
  { q: "What if a campaign turns out to be fraudulent?", a: "Donations are reversed where possible, and the campaign is removed. Our verification is designed to prevent this from the start." },
  { q: "How do I report a campaign?", a: "Every campaign page has a Report button at the bottom of the donation card. Reports are reviewed within hours." },
];

function FaqPage() {
  return (
    <div className="container-page py-16 max-w-3xl">
      <h1 className="font-display text-4xl font-bold">Questions, answered.</h1>
      <p className="text-muted-foreground mt-2">Everything you need to know about LifeLine.</p>
      <div className="mt-8 space-y-3">
        {faqs.map((f) => (
          <details key={f.q} className="group bg-card border border-border rounded-xl p-5">
            <summary className="cursor-pointer font-semibold flex justify-between items-center list-none">
              {f.q}
              <span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl leading-none">+</span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
