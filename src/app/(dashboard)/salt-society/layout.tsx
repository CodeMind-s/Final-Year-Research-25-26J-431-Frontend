"use client";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { UserRole } from "@/dtos/auth.dto";

export default function SaltSocietyLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute
            requiredRole={[UserRole.SALTSOCIETY]}
            redirectTo="/unauthorized"
        >
            {children}
        </ProtectedRoute>
    );
}
