"use client";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { UserRole } from "@/dtos/auth.dto";

export default function LandownerLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute
            requiredRole={[UserRole.LANDOWNER]}
            redirectTo="/unauthorized"
        >
            {children}
        </ProtectedRoute>
    );
}
