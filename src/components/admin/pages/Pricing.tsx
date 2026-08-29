import { Link } from 'react-router-dom';
import { Check, X, Sparkles, ArrowRight } from 'lucide-react';
import { SELLER_PAYOUTS, formatSellerPayout } from '@/lib/pricing';

const planLinks: Record<string, string> = {
  Free: '/shop',
  Pro: '/payment?plan=pro',
  Studio: '/contact',
};

export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      desc: 'Perfect for trying out CreateLab',
      features: [
        { text: 'Download free models', included: true },
        { text: 'Save favorites', included: true },
        { text: 'Community support', included: true },
        { text: `Sell models (${formatSellerPayout('free')} revenue)`, included: true },
        { text: 'Priority support', included: false },
        { text: 'Extended license', included: false },
      ],
      cta: 'Get Started',
      highlight: false,
    },
    {
      name: 'Pro',
      price: '$19',
      period: 'per month',
      desc: 'For professionals and studios',
      features: [
        { text: 'Everything in Free', included: true },
        { text: 'Extended license included', included: true },
        { text: 'Priority customer support', included: true },
        { text: 'Early access to new models', included: true },
        { text: `Sell models (${formatSellerPayout('pro')} revenue)`, included: true },
        { text: 'API access', included: false },
      ],
      cta: 'Start Pro Trial',
      highlight: true,
    },
    {
      name: 'Studio',
      price: '$99',
      period: 'per month',
      desc: 'For teams and large studios',
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Team seats (up to 10)', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'API access', included: true },
        { text: 'Custom licensing options', included: true },
        { text: `Sell models (${formatSellerPayout('studio')} revenue)`, included: true },
      ],
      cta: 'Contact Sales',
      highlight: false,
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-primary-100 mb-6">
            <Sparkles className="w-4 h-4" /> Simple, Transparent Pricing
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Choose Your Plan</h1>
          <p className="mt-6 text-lg text-primary-100">
            Whether you're an individual creator or a large studio, we have a plan that fits your needs. No hidden fees, cancel anytime.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card p-8 relative ${plan.highlight ? 'border-primary-600 ring-2 ring-primary-600/20 scale-105' : ''}`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge bg-primary-600 text-white px-3 py-1">
                  Most Popular
                </span>
              )}
              <h3 className="font-display text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{plan.desc}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-sm text-gray-500">/{plan.period}</span>
              </div>
              <Link
                to={planLinks[plan.name] ?? '/pricing'}
                className={`mt-6 w-full ${plan.highlight ? 'btn-primary' : 'btn-secondary'} flex`}
              >
                {plan.cta} <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="mt-6 space-y-3">
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {feat.included ? (
                      <Check className="w-4 h-4 text-success-600 shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300 shrink-0" />
                    )}
                    <span className={feat.included ? 'text-gray-700' : 'text-gray-400'}>{feat.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'Can I sell models on the Free plan?', a: 'Yes! You can sell models on any plan. The Free plan gives you a 70% revenue share, while Pro and Studio plans offer higher percentages.' },
            { q: 'What is the Extended License?', a: 'The Extended License allows you to use 3D models in commercial projects, including games, films, and products for sale. It is included with Pro and Studio plans.' },
            { q: 'Can I cancel anytime?', a: 'Absolutely. You can cancel your subscription at any time from your dashboard. No cancellation fees, no questions asked.' },
            { q: 'Do you offer refunds?', a: 'If you are not satisfied with a model you purchased, contact us within 14 days for a full refund.' },
          ].map((faq, i) => (
            <div key={i} className="card p-5">
              <h3 className="font-semibold text-gray-900">{faq.q}</h3>
              <p className="text-sm text-gray-600 mt-2">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
