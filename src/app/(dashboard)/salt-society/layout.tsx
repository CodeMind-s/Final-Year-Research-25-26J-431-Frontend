/**
 * @module SaltSocietyLayout
 * 
 * Layout wrapper for Salt Society dashboard with golden theme.
 * Applies custom color scheme (#ffb622) and gradient backgrounds
 * to create a vibrant, branded user experience.
 */

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
