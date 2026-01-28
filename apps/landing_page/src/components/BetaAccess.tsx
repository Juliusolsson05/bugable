"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BetaAccess() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // TODO: Connect to your backend/email service
      setSubmitted(true);
    }
  };

  return (
    <section id="beta" className="py-20 md:py-28 bg-secondary/50">
      <div className="container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="max-w-xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Beta Access
          </div>

          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-4">
            We&apos;re currently in private beta
          </h2>
          <p className="text-muted-foreground text-base mb-8">
            Join the waitlist to get early access and help shape the future of
            automated QA testing.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 p-4 rounded-lg bg-primary/10 text-primary"
            >
              <Check className="h-5 w-5" />
              <span className="font-medium">
                You&apos;re on the list! We&apos;ll be in touch soon.
              </span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 h-11 px-4 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <Button type="submit" size="lg" className="gap-2">
                Request access
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            No spam, ever. We&apos;ll only email you about your beta access.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
