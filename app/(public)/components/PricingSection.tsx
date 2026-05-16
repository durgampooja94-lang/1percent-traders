// app/(public)/components/PricingSection.tsx
import Link from 'next/link'
import { CheckCircle, Zap } from 'lucide-react'

const plans = [
  {
    name: 'Foundation',
    price: 4999,
    originalPrice: 9999,
    description: 'Perfect for absolute beginners entering the stock market',
    badge: null,
    features: [
      '42 video lessons',
      'Stock market basics',
      'Chart reading fundamentals',
      'Basic technical analysis',
      'Risk management intro',
      'Community access',
      'Lifetime access',
    ],
    cta: 'Start Learning',
    href: '/courses',
    highlight: false,
  },
  {
    name: 'Options Pro',
    price: 7999,
    originalPrice: 14999,
    description: 'Master options strategies used by professional traders',
    badge: 'Most Popular',
    features: [
      '68 video lessons',
      'Everything in Foundation',
      'Full options chain analysis',
      'Greeks & volatility',
      'Advanced strategies',
      'Live trade breakdowns',
      'Priority community support',
      'Lifetime access',
    ],
    cta: 'Get Options Pro',
    href: '/courses',
    highlight: true,
  },
  {
    name: 'Complete Bundle',
    price: 14999,
    originalPrice: 34999,
    description: 'All courses + advanced technical analysis masterclass',
    badge: 'Best Value',
    features: [
      '150+ video lessons',
      'All 3 courses included',
      'Advanced price action',
      'Institutional order flow',
      'Algo trading basics',
      '1-on-1 mentorship session',
      'Priority community',
      'Lifetime access',
    ],
    cta: 'Get Complete Bundle',
    href: '/courses',
    highlight: false,
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="section-padding bg-dark-800/30">
      <div className="container-max">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-brand-400 text-sm font-medium">Pricing</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Invest in Your{' '}
            <span className="gradient-text">Trading Future</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            One-time payment. Lifetime access. No recurring fees. No hidden charges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative rounded-3xl p-8 flex flex-col ${
              plan.highlight
                ? 'bg-brand-gradient border-0 shadow-2xl shadow-brand-500/30 scale-105'
                : 'bg-dark-800 border border-dark-500'
            }`}>
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div className={`flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold ${
                    plan.highlight ? 'bg-white text-brand-600' : 'bg-gold-gradient text-dark-900'
                  }`}>
                    <Zap className="w-3 h-3" />
                    {plan.badge}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`font-bold text-xl mb-1 ${plan.highlight ? 'text-white' : 'text-white'}`}>{plan.name}</h3>
                <p className={`text-sm ${plan.highlight ? 'text-white/80' : 'text-gray-400'}`}>{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-white'}`}>
                    ₹{plan.price.toLocaleString()}
                  </span>
                  <span className={`text-sm line-through ${plan.highlight ? 'text-white/50' : 'text-gray-600'}`}>
                    ₹{plan.originalPrice.toLocaleString()}
                  </span>
                </div>
                <p className={`text-xs mt-1 ${plan.highlight ? 'text-white/60' : 'text-gray-500'}`}>one-time payment · lifetime access</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-white' : 'text-brand-500'}`} />
                    <span className={plan.highlight ? 'text-white/90' : 'text-gray-300'}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href}
                className={`block text-center py-3.5 rounded-xl font-bold text-base transition-all active:scale-95 ${
                  plan.highlight
                    ? 'bg-white text-brand-600 hover:bg-white/90 shadow-xl'
                    : 'bg-brand-gradient text-white hover:opacity-90 shadow-lg shadow-brand-500/20'
                }`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-500 text-sm mt-10">
          🔒 Secure checkout via Razorpay · 7-day money-back guarantee · SEBI Registered
        </p>
      </div>
    </section>
  )
}
