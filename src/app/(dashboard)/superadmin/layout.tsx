"use client";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { UserRole } from "@/dtos/auth.dto";

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute
            requiredRole={[UserRole.SUPERADMIN, UserRole.ADMIN]}
            redirectTo="/unauthorized"
        >
            {children}
        </ProtectedRoute>
    );
}
