import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft, Shield } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function Cart() {
  const { items, removeFromCart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const paypalOrderId = searchParams.get('token');
    if (searchParams.get('paypal') !== 'success' || !paypalOrderId || !user) return;
    setProcessing(true);
    supabase.functions.invoke('capture-paypal-order', { body: { paypalOrderId } })
      .then(async ({ data, error: captureError }) => {
        if (captureError) throw new Error(await getFunctionErrorMessage(captureError, 'PayPal payment could not be captured.'));
        if (!data?.success) throw new Error('PayPal payment could not be captured.');
        clearCart();
        navigate('/dashboard?tab=purchases&status=success', { replace: true });
      })
      .catch((captureError) => setError(captureError instanceof Error ? captureError.message : 'PayPal payment failed.'))
      .finally(() => setProcessing(false));
  }, [clearCart, navigate, searchParams, user]);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/signin?redirect=cart');
      return;
    }
    if (items.length === 0) return;

    setProcessing(true);
    setError('');

    try {
      const { data, error: checkoutError } = await supabase.functions.invoke('create-checkout-session', {
        body: { items },
      });

      if (checkoutError) {
        let message = checkoutError.message;
        const response = 'context' in checkoutError && checkoutError.context instanceof Response
          ? checkoutError.context
          : null;

        if (response) {
          try {
            const body = await response.clone().json() as { error?: string; message?: string };
            message = body.error ?? body.message ?? message;
          } catch {
            // Keep the SDK error when the function response is not JSON.
          }
        }

        if (message.toLowerCase().includes('failed to send a request')) {
          message = 'Checkout service is unavailable. Deploy the create-checkout-session Edge Function and verify its Stripe environment variables.';
        }
        throw new Error(message);
      }

      clearCart();
      if (data?.freeOrder) {
        navigate(data.redirectUrl ?? '/dashboard?tab=purchases&status=success');
        return;
      }
      if (!data?.url) throw new Error('Stripe checkout could not be started.');

      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayPalCheckout = async () => {
    if (!user) {
      navigate('/signin?redirect=cart');
      return;
    }
    setProcessing(true);
    setError('');
    try {
      const { data, error: checkoutError } = await supabase.functions.invoke('create-paypal-order', { body: { items } });
      if (checkoutError) {
        let message = await getFunctionErrorMessage(checkoutError, 'PayPal checkout could not be started.');
        if (message.toLowerCase().includes('failed to send a request')) {
          message = 'PayPal checkout is unavailable. Deploy the create-paypal-order Edge Function and configure its PayPal secrets.';
        }
        throw new Error(message);
      }
      if (data?.freeOrder) {
        clearCart();
        navigate(data.redirectUrl ?? '/dashboard?tab=purchases&status=success');
        return;
      }
      if (!data?.url) throw new Error('PayPal checkout could not be started.');
      window.location.assign(data.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'PayPal checkout failed.');
      setProcessing(false);
    }
  };

async function getFunctionErrorMessage(error: { message: string; context?: unknown }, fallback: string) {
  const response = error.context instanceof Response ? error.context : null;
  if (response) {
    try {
      const body = await response.clone().json() as { error?: string; message?: string };
      return body.error ?? body.message ?? error.message;
    } catch {
      return error.message || fallback;
    }
  }
  return error.message || fallback;
}

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="text-gray-500 mt-2">Browse our collection and add some 3D models to get started.</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">
          Browse Models
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Continue Shopping
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.modelId} className="card p-4 flex items-center gap-4">
              <Link to={`/model/${item.slug}`} className="w-24 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/model/${item.slug}`} className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-1">
                  {item.title}
                </Link>
                <p className="text-sm text-gray-500 mt-1">
                  {item.price === 0 ? 'Free' : `$${item.price.toFixed(2)}`}
                </p>
              </div>
              <button
                onClick={() => removeFromCart(item.modelId)}
                className="p-2 text-gray-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                aria-label="Remove from cart"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="p-5 rounded-xl border border-gray-200 bg-white sticky top-20">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Items</span>
                <span className="text-gray-900 font-medium">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900 font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Processing Fee</span>
                <span className="text-success-600 font-medium">Free</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-base">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-gray-900">${total.toFixed(2)}</span>
              </div>
            </div>

            {error && <p className="text-sm text-error-600 mt-3">{error}</p>}

            <button
              onClick={handleCheckout}
              disabled={processing}
              className="btn-primary w-full mt-4"
            >
              {processing ? 'Processing...' : 'Complete Purchase'}
            </button>

            <button
              onClick={handlePayPalCheckout}
              disabled={processing}
              className="w-full mt-2 rounded-lg bg-[#ffc439] px-4 py-3 font-semibold text-[#111] transition hover:bg-[#f2b900] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {processing ? 'Processing...' : 'Pay with PayPal'}
            </button>

            <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
              <Shield className="w-4 h-4 text-success-600" />
              Secure checkout · Instant download
            </div>

            {!user && (
              <p className="text-xs text-gray-500 mt-3 text-center">
                <Link to="/signin?redirect=cart" className="text-primary-600 font-medium">Sign in</Link> to complete your purchase
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
