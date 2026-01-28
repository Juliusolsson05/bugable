"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const testimonials = [
  {
    quote:
      "Bugable caught 3 critical security issues that we completely missed during manual review. It paid for itself on day one.",
    role: "Future CTO",
    avatar: "CTO",
  },
  {
    quote:
      "We ship 10x faster now. Every PR gets automatically tested against real user flows. Game changer for our team.",
    role: "Future Lead Developer",
    avatar: "Dev",
  },
  {
    quote:
      "The UX testing alone saved us hours of QA. It found layout bugs on Safari that we never would have caught.",
    role: "Future Founder",
    avatar: "CEO",
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
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-3">
            *Will be loved by developers
          </h2>
          <p className="text-muted-foreground text-sm">
            We have no users yet, but this is what future users will say.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
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
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {testimonial.role}
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
