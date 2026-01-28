import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = { title: "Privacy — Bugable" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Privacy Policy
            </h1>

            <p className="text-sm text-muted-foreground mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
              <section>
                <h2 className="text-foreground font-semibold mb-2">Overview</h2>
                <p>
                  Bugable helps teams find UX issues, broken flows, and security
                  risks. This policy explains what information we collect and how
                  we use it.
                </p>
              </section>

              <section>
                <h2 className="text-foreground font-semibold mb-2">
                  Information we collect
                </h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="text-foreground font-medium">
                      Waitlist data:
                    </span>{" "}
                    email address you submit to join the beta.
                  </li>
                  <li>
                    <span className="text-foreground font-medium">
                      Usage data:
                    </span>{" "}
                    basic analytics about how the site is used (if enabled).
                  </li>
                  <li>
                    <span className="text-foreground font-medium">
                      Technical data:
                    </span>{" "}
                    device/browser info (e.g., user-agent) for debugging and
                    security.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-foreground font-semibold mb-2">
                  How we use information
                </h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    To contact you about beta access, product updates, and demos.
                  </li>
                  <li>To operate, secure, and improve the Bugable service.</li>
                  <li>To prevent abuse and protect our infrastructure.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-foreground font-semibold mb-2">Sharing</h2>
                <p>
                  We do not sell your personal information. We may use trusted
                  service providers (e.g., email delivery, analytics, hosting)
                  strictly to run Bugable. We may disclose information if required
                  by law or to protect our users and service.
                </p>
              </section>

              <section>
                <h2 className="text-foreground font-semibold mb-2">
                  Data retention
                </h2>
                <p>
                  We keep waitlist emails until you request deletion or until
                  they're no longer needed for the beta.
                </p>
              </section>

              <section>
                <h2 className="text-foreground font-semibold mb-2">
                  Your rights
                </h2>
                <p>
                  You can request access, correction, or deletion of your personal
                  information by contacting us.
                </p>
              </section>

              <section>
                <h2 className="text-foreground font-semibold mb-2">Contact</h2>
                <p>
                  Email:{" "}
                  <a
                    className="text-foreground underline"
                    href="mailto:bugable.ai@gmail.com"
                  >
                    bugable.ai@gmail.com
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-foreground font-semibold mb-2">Cookies</h2>
                <p>
                  See our{" "}
                  <a className="text-foreground underline" href="/cookies">
                    Cookies Policy
                  </a>{" "}
                  for details.
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
