"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export function Demo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

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
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div style={{ position: "relative", paddingBottom: "64.98%", height: 0 }}>
              <iframe
                src="https://www.loom.com/embed/33d03c39380b440eb8910a36a9a8b0c0"
                frameBorder="0"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
