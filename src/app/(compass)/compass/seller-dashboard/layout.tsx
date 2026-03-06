"use client";

import React from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { UserRole } from '@/dtos/auth.dto';

export default function DistributorDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute
            requiredRole={[UserRole.DISTRIBUTOR]}
            requireVerified
            redirectTo="/"
        >
            <section className="min-h-screen w-full">
                {children}
            </section>
        </ProtectedRoute>
    );
}
