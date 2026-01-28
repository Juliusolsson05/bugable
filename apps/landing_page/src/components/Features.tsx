import { Shield, Eye, GitBranch, Code2, Zap, RefreshCw } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "UX & UI Testing",
    description: "Detects visual inconsistencies, accessibility issues, and broken layouts across devices.",
  },
  {
    icon: Shield,
    title: "Security Scanning",
    description: "Identifies vulnerabilities like XSS, exposed APIs, and misconfigured headers.",
  },
  {
    icon: GitBranch,
    title: "User Flow Mapping",
    description: "Automatically maps critical paths and catches broken links or dead ends.",
  },
  {
    icon: Code2,
    title: "Code Review",
    description: "Connect GitHub for automated code analysis and refactoring recommendations.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get actionable insights in under 60 seconds. No complex setup required.",
  },
  {
    icon: RefreshCw,
    title: "Continuous Monitoring",
    description: "Set it and forget it. Get alerts when new issues are detected.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Everything you need to ship with confidence
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            One tool to catch the bugs AI builders miss.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors duration-200"
            >
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
