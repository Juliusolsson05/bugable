function Testimonials() {
  const testimonials = [
    {
      avatar: "https://i.pravatar.cc/100?img=1",
      quote: "CloudSync Pro transformed how our team works. Absolutely essential!",
      name: "Sarah Johnson",
      title: "CEO at TechStart",
      broken: "avatar-large"
    },
    {
      avatar: "https://i.pravatar.cc/100?img=2",
      quote: "Fast, reliable, and the customer support is amazing.",
      name: "Mike Chen",
      title: "Developer"
    },
    {
      avatar: "https://i.pravatar.cc/100?img=3",
      quote: "We switched from Dropbox and never looked back. The security features give us peace of mind.",
      name: "Emily Rodriguez",
      title: "Security Analyst at SecureCorp",
      cardBroken: "card-flex-broken"
    }
  ]

  return (
    <section id="testimonials" className="testimonials">
      <h2>What Our Customers Say</h2>
      <div className="testimonials-grid">
        {testimonials.map((testimonial, index) => (
          <div key={index} className={`testimonial-card ${testimonial.cardBroken || ''}`}>
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              className={`avatar ${testimonial.broken || ''}`}
            />
            <p>"{testimonial.quote}"</p>
            <div className="testimonial-author">
              <strong>{testimonial.name}</strong>
              {/* ISSUE: Very low contrast text */}
              <span className="author-title">{testimonial.title}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Testimonials
