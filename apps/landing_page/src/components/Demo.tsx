"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Demo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // Replace with your YouTube video ID when ready
  const YOUTUBE_ID: string | null = null;

  return (
    <section
      id="demo"
      className="py-20 md:py-28 bg-secondary/50 border-t border-border"
    >
      <div className="container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-3">
            See Bugable in action
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Paste URL → scan → flow graph → prioritized fixes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="max-w-4xl mx-auto"
        >
          <div className="aspect-video rounded-xl border border-border bg-card overflow-hidden">
            {YOUTUBE_ID ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}`}
                title="Bugable demo video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Play className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-5">
                    Demo video coming soon.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild>
                      <a href="/#beta">Get beta access</a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="/contact">Book a live demo</a>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="mt-4 text-xs text-muted-foreground text-center">
            {YOUTUBE_ID
              ? "Using youtube-nocookie for a privacy-friendlier embed."
              : "Video will be added when available."}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
