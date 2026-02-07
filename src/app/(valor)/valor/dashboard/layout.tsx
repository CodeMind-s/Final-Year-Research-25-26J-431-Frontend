"use client";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { UserRole } from "@/dtos/auth.dto";
import ValorDashboardLayout from "@/components/valor/ValorDashboardLayout";

export default function ValorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute
      requiredRole={[UserRole.SUPERADMIN, UserRole.ADMIN]}
      redirectTo="/"
    >
      <ValorDashboardLayout>
        {children}
      </ValorDashboardLayout>
    </ProtectedRoute>
  );
}

