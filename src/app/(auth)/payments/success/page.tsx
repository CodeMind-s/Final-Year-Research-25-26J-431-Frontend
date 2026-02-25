'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/dtos/auth.dto';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

export default function PaymentSuccessPage() {
  const { user, refreshUser, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      refreshUser();
    }
  }, [isLoading, isAuthenticated, refreshUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleContinue = () => {
    if (user) {
      router.push(getDashboardPath(user.role));
    } else {
      router.push('/');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl text-center">
      <div className="flex justify-center mb-4">
        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
      </div>
      <h2 className="text-2xl font-semibold text-slate-900 tracking-tighter">
        Payment Successful
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Your subscription has been activated. You now have full access to your dashboard.
      </p>
      <Button
        onClick={handleContinue}
        className="mt-6 h-12 w-full bg-emerald-600 hover:bg-emerald-500 font-semibold text-white"
      >
        Go to Dashboard
      </Button>
    </div>
  );
}
