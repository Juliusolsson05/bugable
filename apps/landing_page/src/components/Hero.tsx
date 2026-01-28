"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion } from "framer-motion";
import { GlitchEffect } from "./GlitchEffect";

export function Hero() {
  return (
    <section className="relative pt-20 pb-12 md:pt-24 md:pb-16 overflow-hidden">
      {/* Glitch effect on edges */}
      <GlitchEffect />

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.15] mb-4"
          >
            Find bugs before
            <br />
            <span className="text-primary">your users do</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg mx-auto"
          >
            AI that continuously tests your website for UX issues, security
            vulnerabilities, and broken user flows.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-4"
          >
            <Button size="lg" className="gap-2" asChild>
              <a href="#beta">
                Request beta access
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg">
              Watch demo
            </Button>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-2xl mx-auto -mb-12"
          >
            <Image
              src="/hero-chameleon.png"
              alt="Bugable"
              width={800}
              height={600}
              className="w-full h-auto"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
