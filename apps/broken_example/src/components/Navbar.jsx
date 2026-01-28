function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">CloudSync<span>Pro</span></div>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#testimonials">Testimonials</a></li>
          {/* ISSUE: Tiny click target */}
          <li><a href="#contact" className="tiny-link">Contact</a></li>
        </ul>
        {/* ISSUE: Button has no hover state */}
        <button className="nav-cta">Get Started</button>
      </div>
    </nav>
  )
}

export default Navbar
