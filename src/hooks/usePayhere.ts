'use client';

import { useCallback, useRef } from 'react';
import { CheckoutResponse, PayhereUserInfo } from '@/dtos/payment.dto';

declare global {
  interface Window {
    payhere: {
      startPayment: (payment: Record<string, string | boolean>) => void;
      onCompleted: (orderId: string) => void;
      onDismissed: () => void;
      onError: (error: string) => void;
    };
  }
}

interface UsePayhereOptions {
  sandbox?: boolean;
  onCompleted?: (orderId: string) => void;
  onDismissed?: () => void;
  onError?: (error: string) => void;
}

/**
 * Build the payment object matching PayHere's expected format exactly.
 * Reference: https://support.payhere.lk/api-&-mobile-sdk/javascript-sdk
 */
function buildPaymentObject(
  checkoutData: CheckoutResponse,
  userInfo: Partial<PayhereUserInfo> | undefined,
  sandbox: boolean
): Record<string, string | boolean> {
  return {
    sandbox: sandbox,
    merchant_id: checkoutData.merchant_id,
    return_url: checkoutData.return_url || 'http://localhost:3000/payments/success',
    cancel_url: checkoutData.cancel_url || 'http://localhost:3000/payments/cancel',
    notify_url: checkoutData.notify_url,
    order_id: checkoutData.order_id,
    items: checkoutData.items || 'Subscription',
    amount: String(Number(checkoutData.amount).toFixed(2)),
    currency: checkoutData.currency || 'LKR',
    hash: checkoutData.hash,
    first_name: userInfo?.first_name || 'Customer',
    last_name: userInfo?.last_name || 'User',
    email: userInfo?.email || 'customer@brinex.lk',
    phone: userInfo?.phone || '0770000000',
    address: userInfo?.address || 'N/A',
    city: userInfo?.city || 'Colombo',
    country: userInfo?.country || 'Sri Lanka',
  };
}

/**
 * Fallback: submit a hidden form to PayHere checkout page (full redirect).
 */
function formFallback(payment: Record<string, string | boolean>, sandbox: boolean) {
  const checkoutUrl = sandbox
    ? 'https://sandbox.payhere.lk/pay/checkout'
    : 'https://www.payhere.lk/pay/checkout';

  // Strip referrer so PayHere doesn't reject based on unregistered localhost origin
  // (same effect as opening from file:// like the test HTML)
  const meta = document.createElement('meta');
  meta.name = 'referrer';
  meta.content = 'no-referrer';
  document.head.appendChild(meta);

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = checkoutUrl;

  Object.entries(payment).forEach(([name, value]) => {
    if (name === 'sandbox') return; // Not a form field
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

export function usePayhere(options: UsePayhereOptions = {}) {
  const { sandbox = true, onCompleted, onDismissed, onError } = options;

  const onCompletedRef = useRef(onCompleted);
  const onDismissedRef = useRef(onDismissed);
  const onErrorRef = useRef(onError);
  onCompletedRef.current = onCompleted;
  onDismissedRef.current = onDismissed;
  onErrorRef.current = onError;

  const startPayment = useCallback(
    (checkoutData: CheckoutResponse, userInfo?: Partial<PayhereUserInfo>) => {
      const payment = buildPaymentObject(checkoutData, userInfo, sandbox);

      // Use form POST to PayHere checkout (works on any domain, no SDK domain restriction)
      formFallback(payment, sandbox);
    },
    [sandbox]
  );

  return { startPayment };
}
