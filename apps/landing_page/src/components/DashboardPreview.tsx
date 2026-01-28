"use client";

import { useEffect, useState } from "react";

const reasoningSteps = [
  { time: "00:01", text: "Loading page at /checkout..." },
  { time: "00:03", text: "Page loaded successfully (1.2s)" },
  { time: "00:04", text: "Scanning for form elements..." },
  { time: "00:06", text: "Found checkout form with 4 fields" },
  { time: "00:08", text: "Testing form validation..." },
  { time: "00:11", text: "⚠ Email field accepts invalid input" },
  { time: "00:14", text: "Checking button accessibility..." },
  { time: "00:17", text: "✓ Submit button has proper ARIA labels" },
  { time: "00:19", text: "Testing mobile viewport (375px)..." },
  { time: "00:22", text: "⚠ CTA button overflow on mobile" },
  { time: "00:25", text: "Running security checks..." },
  { time: "00:28", text: "✗ Missing CSRF token on form" },
  { time: "00:30", text: "Analyzing page performance..." },
];

export function DashboardPreview() {
  const [visibleSteps, setVisibleSteps] = useState(3);
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setVisibleSteps((prev) => {
        if (prev >= reasoningSteps.length) return 3;
        return prev + 1;
      });
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 25;
        return prev + 5;
      });
    }, 1500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-xs font-bold">B</span>
            </div>
            <span className="font-medium text-sm">Job #1247</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Running
          </div>
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          /checkout
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Split View */}
      <div className="grid grid-cols-2 divide-x divide-border" style={{ height: "220px" }}>
        {/* Live View */}
        <div className="p-3 bg-secondary/20">
          <div className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            Live View
          </div>
          <div className="rounded-lg border border-border bg-background overflow-hidden">
            {/* Mini browser chrome */}
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-secondary/50 border-b border-border">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400/60" />
                <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
                <div className="w-2 h-2 rounded-full bg-green-400/60" />
              </div>
              <div className="flex-1 mx-2">
                <div className="h-4 rounded bg-secondary px-2 flex items-center">
                  <span className="text-[8px] text-muted-foreground truncate">
                    acme-startup.com/checkout
                  </span>
                </div>
              </div>
            </div>
            {/* Mock page content */}
            <div className="p-3 space-y-2">
              <div className="h-3 w-20 bg-foreground/10 rounded" />
              <div className="h-2 w-full bg-muted rounded" />
              <div className="h-2 w-3/4 bg-muted rounded" />
              <div className="mt-3 space-y-1.5">
                <div className="h-6 w-full bg-secondary rounded border border-border" />
                <div className="h-6 w-full bg-secondary rounded border border-border" />
                <div className="h-6 w-full bg-secondary rounded border border-border relative">
                  {/* Scanning highlight */}
                  <div className="absolute inset-0 rounded border-2 border-primary animate-pulse" />
                </div>
              </div>
              <div className="h-7 w-full bg-primary/20 rounded mt-2 flex items-center justify-center">
                <span className="text-[8px] text-primary font-medium">Complete Order</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Reasoning */}
        <div className="p-3 flex flex-col">
          <div className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            AI Reasoning
          </div>
          <div className="flex-1 overflow-hidden rounded-lg border border-border bg-background p-2 font-mono text-[10px] leading-relaxed">
            <div className="space-y-1">
              {reasoningSteps.slice(0, visibleSteps).map((step, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${
                    i === visibleSteps - 1 ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span className="text-muted-foreground/50 flex-shrink-0">
                    {step.time}
                  </span>
                  <span className={
                    step.text.startsWith("✗") ? "text-destructive" :
                    step.text.startsWith("⚠") ? "text-yellow-600" :
                    step.text.startsWith("✓") ? "text-primary" : ""
                  }>
                    {step.text}
                  </span>
                </div>
              ))}
              {visibleSteps < reasoningSteps.length && (
                <div className="flex gap-2 text-muted-foreground">
                  <span className="text-muted-foreground/50">
                    {reasoningSteps[visibleSteps]?.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-flex">
                      <span className="animate-pulse">●</span>
                      <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>●</span>
                      <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>●</span>
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
