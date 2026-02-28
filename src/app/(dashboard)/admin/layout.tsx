"use client";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { UserRole } from "@/dtos/auth.dto";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute
            requiredRole={[UserRole.ADMIN]}
            redirectTo="/unauthorized"
        >
            {children}
        </ProtectedRoute>
    );
}
