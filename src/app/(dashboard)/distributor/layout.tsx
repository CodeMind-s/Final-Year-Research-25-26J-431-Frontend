"use client";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { UserRole } from "@/dtos/auth.dto";

export default function DistributorLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute
            requiredRole={[UserRole.DISTRIBUTOR]}
            redirectTo="/unauthorized"
        >
            {children}
        </ProtectedRoute>
    );
}
