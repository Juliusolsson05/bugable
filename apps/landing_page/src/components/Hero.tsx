import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24" style={{ backgroundColor: '#ddf1e6' }}>
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight leading-[1.1] mb-4">
            Find bugs before{" "}
            <span className="text-gradient">your users do</span>
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xl mx-auto">
            AI that continuously tests your website for UX issues, security vulnerabilities, and broken user flows.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="hero" size="lg" className="gap-2">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="hero-outline" size="lg">
              Log in
            </Button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Image
            src="/hero-chameleon.png"
            alt="Bugable chameleon mascot catching bugs"
            width={576}
            height={400}
            className="w-full h-auto max-w-xl mx-auto"
            priority
          />
        </div>
      </div>
    </section>
  );
}
