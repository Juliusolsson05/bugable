"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { DashboardPreview } from "@/components/DashboardPreview";

const bullets = [
  "AI UX/UI testing across devices and viewports",
  "Security scanning for common web vulnerabilities",
  "Performance and accessibility audits",
  "Prioritized issues with actionable recommendations",
];

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="about" className="py-20 md:py-28 border-t border-border">
      <div className="container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="grid lg:grid-cols-2 gap-10 items-center"
        >
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Built for the AI website boom
            </h2>

            <p className="text-muted-foreground leading-relaxed mb-5">
              AI makes it cheaper and faster than ever to ship websites — which means
              we'll see <span className="text-foreground font-medium">100x more sites</span>.
              That's amazing… but AI still hallucinates, and those hallucinations
              become broken flows, UX bugs, and security risk.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-6">
              Bugable is your always-on QA agent: paste a URL, and we continuously
              test the experience like a real user (and a real attacker).
            </p>

            <ul className="space-y-3">
              {bullets.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <span className="text-sm text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <DashboardPreview />
            <p className="mt-3 text-xs text-muted-foreground">
              See issues the moment they happen — categorized by severity and type.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
