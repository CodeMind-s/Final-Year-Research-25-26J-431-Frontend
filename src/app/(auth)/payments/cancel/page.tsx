'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl text-center">
      <div className="flex justify-center mb-4">
        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
      </div>
      <h2 className="text-2xl font-semibold text-slate-900 tracking-tighter">
        Payment Cancelled
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Your payment was cancelled. You can try again anytime from the plans page.
      </p>
      <div className="mt-6 space-y-3">
        <Button
          onClick={() => router.push('/auth/plans')}
          className="h-12 w-full bg-slate-900 hover:bg-slate-800 font-semibold text-white"
        >
          Back to Plans
        </Button>
        <button
          onClick={() => router.push('/')}
          className="text-sm text-slate-500 hover:text-slate-700 underline"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}
