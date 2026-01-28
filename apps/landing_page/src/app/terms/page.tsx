import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = { title: "Terms — Bugable" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Terms of Service
            </h1>

            <p className="text-sm text-muted-foreground mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
              <section>
                <h2 className="text-foreground font-semibold mb-2">
                  Acceptance of Terms
                </h2>
                <p>
                  By accessing or using Bugable, you agree to be bound by these
                  Terms of Service. If you do not agree, please do not use our
                  service.
                </p>
              </section>

              <section>
                <h2 className="text-foreground font-semibold mb-2">
                  Service Description
                </h2>
                <p>
                  Bugable is provided "as is" during private beta. Features may
                  change without notice as we iterate on the product.
                </p>
              </section>

              <section>
                <h2 className="text-foreground font-semibold mb-2">
                  User Responsibilities
                </h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    You are responsible for ensuring you have the right to scan
                    the URLs you submit.
                  </li>
                  <li>
                    You agree not to use Bugable to scan websites without proper
                    authorization.
                  </li>
                  <li>
                    You will not attempt to reverse engineer, hack, or disrupt the
                    service.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-foreground font-semibold mb-2">
                  Intellectual Property
                </h2>
                <p>
                  All content, features, and functionality of Bugable are owned by
                  us and protected by intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-foreground font-semibold mb-2">
                  Limitation of Liability
                </h2>
                <p>
                  Bugable is provided without warranties of any kind. We are not
                  liable for any damages arising from your use of the service.
                </p>
              </section>

              <section>
                <h2 className="text-foreground font-semibold mb-2">
                  Changes to Terms
                </h2>
                <p>
                  We may update these terms from time to time. Continued use of
                  the service after changes constitutes acceptance of the new
                  terms.
                </p>
              </section>

              <section>
                <h2 className="text-foreground font-semibold mb-2">Contact</h2>
                <p>
                  Questions? Email:{" "}
                  <a
                    className="text-foreground underline"
                    href="mailto:bugable.ai@gmail.com"
                  >
                    bugable.ai@gmail.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
