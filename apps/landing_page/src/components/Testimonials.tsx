"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const testimonials = [
  {
    quote:
      "Bugable caught 3 critical security issues that we completely missed during manual review. It paid for itself on day one.",
    author: "Sarah Chen",
    role: "CTO at Launchpad",
    avatar: "SC",
  },
  {
    quote:
      "We ship 10x faster now. Every PR gets automatically tested against real user flows. Game changer for our team.",
    author: "Marcus Rodriguez",
    role: "Lead Developer at Flowstate",
    avatar: "MR",
  },
  {
    quote:
      "The UX testing alone saved us hours of QA. It found layout bugs on Safari that we never would have caught.",
    author: "Emily Park",
    role: "Founder at Pixelcraft",
    avatar: "EP",
  },
];

export function Testimonials() {
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
          className="text-center mb-14"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            Loved by developers
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
            >
              <div className="h-full p-6 rounded-lg border border-border bg-card">
                <blockquote className="text-foreground text-sm leading-relaxed mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {testimonial.author}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
