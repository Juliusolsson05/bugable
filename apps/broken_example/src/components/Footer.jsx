function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>CloudSync Pro</h4>
          <p>Making file sync simple since 2024.</p>
        </div>

        {/* ISSUE: Inconsistent link spacing */}
        <div className="footer-section links-broken-spacing">
          <h4>Product</h4>
          <a href="#">Features</a>
          <a href="#">Pricing</a>
          <a href="#">Security</a>
          <a href="#">Enterprise</a>
        </div>

        <div className="footer-section">
          <h4>Company</h4>
          <a href="#">About</a>
          <a href="#">Blog</a>
          <a href="#">Careers</a>
          <a href="#">Press</a>
        </div>

        {/* ISSUE: Newsletter form breaks on smaller screens */}
        <div className="footer-section footer-newsletter">
          <h4>Stay Updated</h4>
          {/* ISSUE: Input and button don't align properly */}
          <div className="newsletter-form">
            <input type="email" placeholder="Your email" />
            <button>Subscribe</button>
          </div>
        </div>
      </div>

      {/* ISSUE: Copyright text barely visible (low contrast) */}
      <div className="footer-bottom">
        <p>&copy; 2024 CloudSync Pro. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
