/**
 * Protected Route Component
 * Higher-order component for protecting routes that require authentication
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/dtos/auth.dto';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: UserRole[];
    requireOnboarded?: boolean;
    requireSubscription?: boolean;
    redirectTo?: string;
}

/**
 * Protected Route Component
 */
export function ProtectedRoute({
    children,
    requiredRole,
    requireOnboarded = false,
    requireSubscription = false,
    redirectTo = '/',
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        // Not authenticated - redirect to login
        if (!isAuthenticated) {
            router.push(redirectTo);
            return;
        }

        // Check role if required
        if (requiredRole && user && !requiredRole.includes(user.role)) {
            router.push('/unauthorized');
            return;
        }

        // Admin users skip onboarding and subscription checks
        const isAdmin = user && (user.role === UserRole.ADMIN || user.role === UserRole.SUPERADMIN);

        // Check onboarding status
        if (requireOnboarded && user && !user.isOnboarded && !isAdmin) {
            router.push('/auth/onboarding');
            return;
        }

        // Check subscription status
        if (requireSubscription && user && !user.isSubscribed && !user.isTrialActive && !isAdmin) {
            router.push('/auth/plans');
            return;
        }
    }, [isAuthenticated, isLoading, user, requiredRole, requireOnboarded, requireSubscription, router, redirectTo]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!isAuthenticated) {
        return null;
    }

    // Role check failed
    if (requiredRole && user && !requiredRole.includes(user.role)) {
        return null;
    }

    // Admin users skip onboarding and subscription checks
    const isAdminUser = user && (user.role === UserRole.ADMIN || user.role === UserRole.SUPERADMIN);

    // Onboarding check failed
    if (requireOnboarded && user && !user.isOnboarded && !isAdminUser) {
        return null;
    }

    // Subscription check failed
    if (requireSubscription && user && !user.isSubscribed && !user.isTrialActive && !isAdminUser) {
        return null;
    }

    return <>{children}</>;
}
