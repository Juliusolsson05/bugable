"use client";

import { Shield, Eye, GitBranch, Code2, Zap, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    icon: Eye,
    title: "UX & UI Testing",
    description:
      "Detects visual inconsistencies, accessibility issues, and broken layouts across devices.",
  },
  {
    icon: Shield,
    title: "Security Scanning",
    description:
      "Identifies vulnerabilities like XSS, exposed APIs, and misconfigured headers.",
  },
  {
    icon: GitBranch,
    title: "User Flow Mapping",
    description:
      "Automatically maps critical paths and catches broken links or dead ends.",
  },
  {
    icon: Code2,
    title: "Code Review",
    description:
      "Connect GitHub for automated code analysis and refactoring recommendations.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description:
      "Get actionable insights in under 60 seconds. No complex setup required.",
  },
  {
    icon: RefreshCw,
    title: "Continuous Monitoring",
    description:
      "Set it and forget it. Get alerts when new issues are detected.",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="p-6 rounded-lg border border-border bg-card"
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
        <feature.icon className="h-5 w-5 text-primary" />
      </div>

      <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {feature.description}
      </p>
    </motion.div>
  );
}

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="features" className="py-20 md:py-28 border-t border-border">
      <div className="container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Everything you need to ship with confidence
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            One tool to catch the bugs AI builders miss.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
