const steps = [
  {
    number: "01",
    title: "Enter your URL",
    description: "Paste any website URL. No signup or installation needed to get started.",
  },
  {
    number: "02",
    title: "AI scans everything",
    description: "Our agent crawls your site, tests interactions, and checks for security issues.",
  },
  {
    number: "03",
    title: "Get actionable fixes",
    description: "Receive a prioritized list of issues with clear steps to resolve each one.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 border-y border-border">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            How it works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Three steps. Under a minute. Zero friction.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-px bg-border -translate-x-1/2" />
              )}

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-border bg-secondary mb-6">
                  <span className="text-2xl font-semibold text-primary">{step.number}</span>
                </div>
                <h3 className="text-lg font-medium mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
