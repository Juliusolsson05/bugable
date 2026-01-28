import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="relative max-w-3xl mx-auto text-center p-12 rounded-xl border border-border bg-card overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
          </div>

          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Ship without the anxiety
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            The obvious tool for the AI-built web. Start scanning in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" className="gap-2">
              Start free scan
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="hero-outline" size="xl">
              View demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
