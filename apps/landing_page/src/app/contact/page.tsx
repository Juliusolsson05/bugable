import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";

export const metadata = {
  title: "Contact — Bugable",
  description: "Book a demo or reach out to the Bugable team.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Contact
            </h1>
            <p className="text-muted-foreground mb-8">
              Want a walkthrough, partnership, or early access? Send a message.
            </p>

            <ContactForm />

            <p className="mt-8 text-sm text-muted-foreground">
              Or email:{" "}
              <a
                className="text-foreground underline"
                href="mailto:hello@bugable.ai"
              >
                hello@bugable.ai
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
