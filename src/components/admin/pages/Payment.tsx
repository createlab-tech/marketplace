import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const planDetails: Record<string, { name: string; price: string; period: string; summary: string; features: string[] }> = {
  pro: {
    name: 'Pro',
    price: '$19',
    period: '/month',
    summary: 'For professionals and studios',
    features: ['Extended license included', 'Priority support', 'Early access to new models'],
  },
  studio: {
    name: 'Studio',
    price: '$99',
    period: '/month',
    summary: 'For teams and large studios',
    features: [ 'Team seats included', 'Dedicated account manager', 'Custom licensing options'],
  },
};

export default function PaymentPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planKey = (searchParams.get('plan') ?? 'pro').toLowerCase();
  const plan = planDetails[planKey] ?? planDetails.pro;
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate(`/signin?redirect=payment&plan=${planKey}`);
    }
  }, [loading, user, navigate, planKey]);

  const stripeCheckoutUrl = import.meta.env.VITE_STRIPE_CHECKOUT_URL || import.meta.env.VITE_STRIPE_PRO_LINK || '';

  const handleCheckout = () => {
    if (!user) {
      navigate(`/signin?redirect=payment&plan=${planKey}`);
      return;
    }

    if (!stripeCheckoutUrl) {
      setError('Stripe checkout is not configured yet. Add VITE_STRIPE_CHECKOUT_URL to your environment and the Stripe payment link.');
      return;
    }

    setProcessing(true);
    setError('');
    window.location.href = stripeCheckoutUrl;
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Loading account details...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/pricing" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to pricing
      </Link>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
        <div className="card p-6 md:p-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" /> Secure checkout
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Review your {plan.name} plan</h1>
          <p className="text-gray-500 mt-2">{plan.summary}</p>

          <div className="mt-6 flex items-end gap-2">
            <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
            <span className="text-gray-500 mb-1">{plan.period}</span>
          </div>

          <div className="mt-8 space-y-3">
            {plan.features.map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-6 h-6 rounded-full bg-success-50 flex items-center justify-center">
                  <Check className="w-4 h-4 text-success-600" />
                </div>
                {feature}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CreditCard className="w-4 h-4 text-primary-600" />
              Payment is powered by Stripe.
            </div>
            <p className="text-xs text-gray-500 mt-2">Your billing info is protected with encrypted Stripe checkout.</p>
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-900">Billing details</h2>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between text-gray-600">
              <span>Plan</span>
              <span className="font-medium text-gray-900">{plan.name}</span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span>Account</span>
              <span className="font-medium text-gray-900 truncate max-w-[180px]">{user.email}</span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span>Recurring</span>
              <span className="font-medium text-gray-900">{plan.price}{plan.period}</span>
            </div>
          </div>

          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={processing}
            className="btn-primary w-full mt-6"
          >
            {processing ? 'Redirecting...' : `Pay ${plan.price}`}
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
            <Lock className="w-3.5 h-3.5 text-success-600" />
            Secure checkout via Stripe
          </div>
        </div>
      </div>
    </div>
  );
}
