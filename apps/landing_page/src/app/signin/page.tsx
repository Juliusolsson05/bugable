import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Sign in — Bugable",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container">
          <div className="max-w-xl mx-auto">
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Sign in
            </h1>
            <p className="text-muted-foreground mb-8">
              Bugable is currently in private beta. Request access to get an
              invite.
            </p>

            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-5">
                If you already have access, your team probably gave you a link
                or credentials. Otherwise, join the waitlist to be notified when
                we launch.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild>
                  <a href="/#beta">Request beta access</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/contact">Contact us</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
