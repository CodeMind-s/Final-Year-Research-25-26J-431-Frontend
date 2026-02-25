'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePayhere } from '@/hooks/usePayhere';
import { UserRole } from '@/dtos/auth.dto';
import { paymentController } from '@/services/payment.controller';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, Crown } from 'lucide-react';
import Image from 'next/image';

function getDashboardPath(role: UserRole): string {
  switch (role) {
    case UserRole.LANDOWNER:
      return '/compass/landowner-dashboard';
    case UserRole.DISTRIBUTOR:
    case UserRole.SELLER:
      return '/compass/seller-dashboard';
    case UserRole.LABORATORY:
      return '/vision/dashboard/camera';
    default:
      return '/';
  }
}

export default function PlansPage() {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPaymentCompleted = useCallback(async (orderId: string) => {
    console.log('Payment completed, orderId:', orderId);
    await refreshUser();
    if (user) {
      router.push(getDashboardPath(user.role));
    }
  }, [refreshUser, router, user]);

  const onPaymentDismissed = useCallback(() => {
    setCheckoutLoading(false);
  }, []);

  const onPaymentError = useCallback((err: string) => {
    setError(`Payment failed: ${err}`);
    setCheckoutLoading(false);
  }, []);

  const { startPayment } = usePayhere({
    sandbox: true,
    onCompleted: onPaymentCompleted,
    onDismissed: onPaymentDismissed,
    onError: onPaymentError,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  const handleSubscribe = async (planKey: string) => {
    setError(null);
    setCheckoutLoading(true);
    try {
      const checkoutData = await paymentController.checkout({
        planKey,
        billingCycle,
      });
      startPayment(checkoutData, {
        first_name: user.name || 'Customer',
        last_name: user.name ? '' : 'User',
        email: user.email || 'customer@brinex.lk',
        phone: user.phone || '0770000000',
        address: 'N/A',
        city: 'Colombo',
        country: 'Sri Lanka',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout.');
      setCheckoutLoading(false);
    }
  };

  const handleContinue = () => {
    router.push(getDashboardPath(user.role));
  };

  const isLab = user.role === UserRole.LABORATORY;

  // Trial info
  const trialDaysLeft = user.trialEndDate
    ? Math.max(
      0,
      Math.ceil(
        (new Date(user.trialEndDate).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
      )
    )
    : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl max-w-2xl mx-auto">
      <div className="mb-6 text-center">
        <Image
          src="/assets/images/logo.svg"
          alt="BRINEX"
          width={140}
          height={40}
          className="mx-auto"
        />
        <h2 className="text-2xl font-semibold text-slate-900 mt-4 tracking-tighter">
          Choose Your Plan
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {isLab
            ? 'Subscribe to access the laboratory system'
            : 'Upgrade to unlock premium features'}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Trial Status */}
      {!isLab && user.isTrialActive && (
        <div className="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-center">
          <p className="text-sm font-medium text-emerald-800">
            14-Day Trial Active — {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} remaining
          </p>
        </div>
      )}

      {!isLab && !user.isTrialActive && !user.isSubscribed && (
        <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4 text-center">
          <p className="text-sm font-medium text-amber-800">
            Your trial period is over. Subscribe to continue using premium features.
          </p>
        </div>
      )}

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${billingCycle === 'monthly'
            ? 'bg-slate-900 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle('annual')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${billingCycle === 'annual'
            ? 'bg-slate-900 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
        >
          Annual
          <span className="ml-1 text-xs text-emerald-600 font-semibold">Save 17%</span>
        </button>
      </div>

      {isLab ? (
        /* Laboratory: Single plan */
        <div className="border-2 border-blue-500 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-slate-900">Lab Plan</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">
            LKR {billingCycle === 'monthly' ? '2,500' : '25,000'}
            <span className="text-sm font-normal text-slate-500">
              /{billingCycle === 'monthly' ? 'mo' : 'yr'}
            </span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-500" /> AI-powered quality inspection</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-500" /> Real-time camera monitoring</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-500" /> Batch purity reports</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-500" /> Detection history & analytics</li>
          </ul>
          <Button
            onClick={() => handleSubscribe('lab')}
            disabled={checkoutLoading}
            className="mt-6 h-12 w-full bg-blue-600 hover:bg-blue-500 font-semibold text-white"
          >
            {checkoutLoading ? 'Processing...' : 'Subscribe Now'}
          </Button>
        </div>
      ) : (
        /* Landowner / Distributor: Free + Pro */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Free Plan */}
          <div className="border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Free</h3>
            <p className="text-3xl font-bold text-slate-900 mb-1">
              LKR 0
              <span className="text-sm font-normal text-slate-500">/mo</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Basic dashboard access</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Market overview</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Limited analytics</li>
            </ul>
            {(user.isTrialActive || user.isSubscribed) && (
              <Button
                onClick={handleContinue}
                variant="outline"
                className="mt-6 h-12 w-full font-semibold"
              >
                Continue with Free
              </Button>
            )}
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-emerald-500 rounded-xl p-6 relative">
            <div className="absolute -top-3 left-4 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Recommended
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-emerald-500" />
              <h3 className="text-lg font-semibold text-slate-900">Pro</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">
              LKR {billingCycle === 'monthly' ? '1,500' : '15,000'}
              <span className="text-sm font-normal text-slate-500">
                /{billingCycle === 'monthly' ? 'mo' : 'yr'}
              </span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Everything in Free</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Advanced analytics</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Seasonal planning tools</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Priority support</li>
            </ul>
            <Button
              onClick={() => handleSubscribe('pro')}
              disabled={checkoutLoading}
              className="mt-6 h-12 w-full bg-emerald-600 hover:bg-emerald-500 font-semibold text-white"
            >
              {checkoutLoading ? 'Processing...' : 'Subscribe to Pro'}
            </Button>
          </div>
        </div>
      )}

      {/* Continue link for non-lab users */}
      {!isLab && (user.isTrialActive || user.isSubscribed) && (
        <div className="mt-4 text-center">
          <button
            onClick={handleContinue}
            className="text-sm text-slate-500 hover:text-slate-700 underline"
          >
            Continue with current plan
          </button>
        </div>
      )}
    </div>
  );
}
