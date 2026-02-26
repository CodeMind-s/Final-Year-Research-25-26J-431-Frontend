"use client";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { UserRole } from "@/dtos/auth.dto";

export default function LaboratoryLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute
            requiredRole={[UserRole.LABORATORY]}
            redirectTo="/unauthorized"
        >
            {children}
        </ProtectedRoute>
    );
}
