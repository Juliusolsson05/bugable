function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Sync Your Files Across All Devices</h1>
        {/* ISSUE: Light gray text on light background - poor contrast */}
        <p className="hero-subtitle">
          The fastest, most secure cloud storage solution for teams and individuals.
          Start syncing today.
        </p>
        <div className="hero-buttons">
          <button className="btn-primary">Start Free Trial</button>
          {/* ISSUE: Ghost button text nearly invisible */}
          <button className="btn-ghost">Watch Demo</button>
        </div>
      </div>
      {/* ISSUE: Image overlaps content on tablet sizes */}
      <div className="hero-image">
        <div className="placeholder-img">
          <span>Product Screenshot</span>
        </div>
      </div>
    </section>
  )
}

export default Hero
