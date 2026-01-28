function Contact() {
  return (
    <section id="contact" className="contact">
      <h2>Get In Touch</h2>
      <form className="contact-form">
        {/* ISSUE: Labels not properly associated with inputs (missing htmlFor/id) */}
        <div className="form-group">
          <label>Name</label>
          <input type="text" placeholder="Enter your name" />
        </div>
        <div className="form-group">
          <label>Email</label>
          {/* ISSUE: Should be type="email" not type="text" */}
          <input type="text" placeholder="Enter your email" />
        </div>
        {/* ISSUE: Textarea overflows its container */}
        <div className="form-group">
          <label>Message</label>
          <textarea placeholder="How can we help?" />
        </div>
        {/* ISSUE: Submit button misaligned */}
        <button type="submit" className="btn-primary btn-submit-broken">
          Send Message
        </button>
      </form>
    </section>
  )
}

export default Contact
