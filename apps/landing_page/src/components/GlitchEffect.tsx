"use client";

import { useEffect, useState } from "react";

interface GlitchPanel {
  id: number;
  top: number;
  height: number;
  width: number;
  offsetX: number;
  opacity: number;
  delay: number;
}

function generatePanels(count: number, side: "left" | "right"): GlitchPanel[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: Math.random() * 85,
    height: 20 + Math.random() * 60,
    width: 40 + Math.random() * 80,
    offsetX: side === "left" ? -(10 + Math.random() * 30) : 10 + Math.random() * 30,
    opacity: 0.5 + Math.random() * 0.4,
    delay: Math.random() * 2,
  }));
}

export function GlitchEffect() {
  const [leftPanels, setLeftPanels] = useState<GlitchPanel[]>([]);
  const [rightPanels, setRightPanels] = useState<GlitchPanel[]>([]);

  useEffect(() => {
    setLeftPanels(generatePanels(6, "left"));
    setRightPanels(generatePanels(6, "right"));

    const interval = setInterval(() => {
      setLeftPanels(generatePanels(6, "left"));
      setRightPanels(generatePanels(6, "right"));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style jsx>{`
        @keyframes glitch-slide {
          0%, 100% {
            transform: translateX(var(--offset-x));
            opacity: var(--opacity);
          }
          15% {
            transform: translateX(calc(var(--offset-x) * 1.8));
            opacity: calc(var(--opacity) * 0.7);
          }
          30% {
            transform: translateX(calc(var(--offset-x) * 0.4));
            opacity: var(--opacity);
          }
          50% {
            transform: translateX(calc(var(--offset-x) * 1.4));
            opacity: calc(var(--opacity) * 0.85);
          }
          70% {
            transform: translateX(calc(var(--offset-x) * 0.8));
            opacity: var(--opacity);
          }
          85% {
            transform: translateX(calc(var(--offset-x) * 1.2));
            opacity: calc(var(--opacity) * 0.9);
          }
        }

        @keyframes glitch-flicker {
          0%, 100% { opacity: var(--opacity); }
          8% { opacity: 0; }
          10% { opacity: var(--opacity); }
          45% { opacity: var(--opacity); }
          47% { opacity: 0; }
          49% { opacity: var(--opacity); }
          92% { opacity: var(--opacity); }
          94% { opacity: 0; }
          96% { opacity: var(--opacity); }
        }

        .glitch-panel {
          position: absolute;
          background: linear-gradient(
            90deg,
            hsl(158 64% 40% / 0.8) 0%,
            hsl(158 64% 40% / 0.4) 50%,
            hsl(158 64% 40% / 0.1) 100%
          );
          animation:
            glitch-slide 2.5s ease-in-out infinite,
            glitch-flicker 4s steps(1) infinite;
          will-change: transform, opacity;
        }

        .glitch-panel-right {
          background: linear-gradient(
            270deg,
            hsl(158 64% 40% / 0.8) 0%,
            hsl(158 64% 40% / 0.4) 50%,
            hsl(158 64% 40% / 0.1) 100%
          );
        }

        @media (prefers-reduced-motion: reduce) {
          .glitch-panel {
            animation: none;
          }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Left side glitch panels */}
        {leftPanels.map((panel) => (
          <div
            key={`left-${panel.id}`}
            className="glitch-panel"
            style={{
              top: `${panel.top}%`,
              left: 0,
              width: `${panel.width}px`,
              height: `${panel.height}px`,
              "--offset-x": `${panel.offsetX}px`,
              "--opacity": panel.opacity,
              animationDelay: `${panel.delay}s`,
            } as React.CSSProperties}
          />
        ))}

        {/* Right side glitch panels */}
        {rightPanels.map((panel) => (
          <div
            key={`right-${panel.id}`}
            className="glitch-panel glitch-panel-right"
            style={{
              top: `${panel.top}%`,
              right: 0,
              width: `${panel.width}px`,
              height: `${panel.height}px`,
              "--offset-x": `${panel.offsetX}px`,
              "--opacity": panel.opacity,
              animationDelay: `${panel.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </>
  );
}
