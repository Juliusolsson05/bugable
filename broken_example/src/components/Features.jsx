function Features() {
  const features = [
    {
      icon: "🚀",
      title: "Lightning Fast",
      description: "Upload and sync files at incredible speeds with our optimized infrastructure."
    },
    {
      icon: "🔒",
      title: "Bank-Level Security",
      description: "256-bit encryption keeps your files safe.",
      broken: "card-broken-padding"
    },
    {
      icon: "🌐",
      title: "Access Anywhere",
      description: "Your files are available on desktop, mobile, and web. Work from anywhere in the world without limitations."
    },
    {
      icon: "👥",
      title: "Team Collaboration",
      description: "Share folders and collaborate in real-time with your team members.",
      broken: "icon-misaligned"
    }
  ]

  return (
    <section id="features" className="features">
      <h2>Why Choose CloudSync Pro?</h2>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className={`feature-card ${feature.broken || ''}`}>
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Features
