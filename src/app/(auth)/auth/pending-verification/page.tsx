'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/dtos/auth.dto';
import { Button } from '@/components/ui/button';
import { ShieldCheck, LogOut, RefreshCw } from 'lucide-react';

const ROLES_NEEDING_VERIFICATION = [UserRole.LANDOWNER, UserRole.DISTRIBUTOR, UserRole.LABORATORY];

function getDashboardPath(role: UserRole): string {
  switch (role) {
    case UserRole.LANDOWNER:
      return '/compass/landowner-dashboard';
    case UserRole.DISTRIBUTOR:
      return '/compass/seller-dashboard';
    case UserRole.LABORATORY:
      return '/laboratory/dashboard';
    default:
      return '/';
  }
}

export default function PendingVerificationPage() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      await refreshUser();
      // Re-read user from context after refresh — the component will re-render
      // We need to check the updated user, but refreshUser updates context async.
      // So we'll use a small delay to let state propagate, then check.
    } catch {
      // refreshUser handles errors internally (logs out on failure)
    } finally {
      setIsChecking(false);
    }
  };

  // If user is now verified, redirect them forward
  if (user?.isVerified || (user && !ROLES_NEEDING_VERIFICATION.includes(user.role))) {
    if (user.role === UserRole.LABORATORY && !user.isSubscribed) {
      router.push('/auth/plans');
    } else if (user.isTrialActive || user.isSubscribed) {
      router.push(getDashboardPath(user.role));
    } else {
      router.push('/auth/plans');
    }
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <ShieldCheck className="h-10 w-10 text-amber-600 dark:text-amber-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Account Pending Verification
          </h1>
          <p className="text-muted-foreground">
            Your account is currently under review. An administrator will verify your account shortly. Please check back later.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="w-full"
          >
            {isChecking ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Check Status
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={logout}
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
