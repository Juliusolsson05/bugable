"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section className="py-20 md:py-28 border-t border-border">
      <div className="container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center gap-10 md:gap-16 max-w-4xl mx-auto"
        >
          {/* Illustration */}
          <div className="w-full max-w-xs md:max-w-sm flex-shrink-0">
            <Image
              src="/chameleon-cta.png"
              alt="Bugable chameleon"
              width={400}
              height={300}
              className="w-full h-auto"
            />
          </div>

          {/* Content */}
          <div className="text-center md:text-left">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Ship without the anxiety
            </h2>
            <p className="text-muted-foreground text-base mb-8">
              Be among the first to experience AI-powered QA testing.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Button size="lg" className="gap-2" asChild>
                <a href="#beta">
                  Join the beta
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="lg">
                Book a demo
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
