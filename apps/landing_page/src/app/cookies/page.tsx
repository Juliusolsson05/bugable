import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = { title: "Cookies — Bugable" };

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Cookies Policy
            </h1>

            <p className="text-sm text-muted-foreground mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
              <section>
                <h2 className="text-foreground font-semibold mb-2">
                  What are cookies?
                </h2>
                <p>
                  Cookies are small text files stored on your device that help
                  sites remember information about your visit.
                </p>
              </section>

              <section>
                <h2 className="text-foreground font-semibold mb-2">
                  How Bugable uses cookies
                </h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="text-foreground font-medium">
                      Essential cookies:
                    </span>{" "}
                    required for basic site behavior (e.g., remembering cookie
                    preferences).
                  </li>
                  <li>
                    <span className="text-foreground font-medium">
                      Analytics cookies (optional):
                    </span>{" "}
                    help us understand traffic and improve the site (if enabled).
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-foreground font-semibold mb-2">
                  Managing cookies
                </h2>
                <p>
                  You can control cookies through your browser settings. You can
                  also accept or reject cookies via our cookie banner.
                </p>
              </section>

              <section>
                <h2 className="text-foreground font-semibold mb-2">Contact</h2>
                <p>
                  Email:{" "}
                  <a
                    className="text-foreground underline"
                    href="mailto:hello@bugable.ai"
                  >
                    hello@bugable.ai
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
