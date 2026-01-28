function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$9",
      features: [
        "50 GB Storage",
        "2 Team Members",
        "Basic Support",
        { text: "File versioning for up to 30 days included", truncated: true }
      ]
    },
    {
      name: "Professional",
      price: "$29",
      popular: true,
      features: [
        "500 GB Storage",
        "10 Team Members",
        "Priority Support",
        "Advanced Analytics"
      ]
    },
    {
      name: "Enterprise",
      price: "$99",
      priceClass: "price-misaligned",
      features: [
        "Unlimited Storage",
        "Unlimited Members",
        "24/7 Phone Support",
        "Custom Integrations",
        "SLA Guarantee"
      ]
    }
  ]

  return (
    <section id="pricing" className="pricing">
      <h2>Simple, Transparent Pricing</h2>
      <p className="pricing-subtitle">Choose the plan that works for you. No hidden fees ever.</p>

      <div className="pricing-grid">
        {plans.map((plan, index) => (
          <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
            {plan.popular && <div className="popular-badge">Most Popular</div>}
            <h3>{plan.name}</h3>
            <div className={`price ${plan.priceClass || ''}`}>
              {plan.price}<span>/mo</span>
            </div>
            <ul className="features-list">
              {plan.features.map((feature, i) => (
                <li
                  key={i}
                  className={typeof feature === 'object' && feature.truncated ? 'truncated-text' : ''}
                >
                  {typeof feature === 'object' ? feature.text : feature}
                </li>
              ))}
            </ul>
            <button className={plan.popular ? 'btn-primary' : 'btn-secondary'}>
              {plan.name === 'Enterprise' ? 'Contact Sales' : `Choose ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Pricing
