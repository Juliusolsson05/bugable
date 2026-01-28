"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
  {
    number: "1",
    title: "Enter your URL",
    description:
      "Paste any website URL. No signup or installation needed to get started.",
  },
  {
    number: "2",
    title: "AI scans everything",
    description:
      "Our agent crawls your site, tests interactions, and checks for security issues.",
  },
  {
    number: "3",
    title: "Get actionable fixes",
    description:
      "Receive a prioritized list of issues with clear steps to resolve each one.",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-secondary/50">
      <div className="container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-4">
            How it works
          </h2>
          <p className="text-muted-foreground text-base">
            Three steps. Under a minute.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-primary/30 bg-primary/10 mb-5">
                  <span className="font-display text-lg font-bold text-primary">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-base font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
