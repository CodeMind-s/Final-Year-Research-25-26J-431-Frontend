"use client";

import { AdminDashboardLayout } from "@/components/admin/AdminDashboardLayout";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { UserRole } from "@/dtos/auth.dto";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute
      requiredRole={[UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.SALTSOCIETY, UserRole.LABORATORY, UserRole.LANDOWNER]}
      redirectTo="/auth/admin"
    >
      <AdminDashboardLayout>{children}</AdminDashboardLayout>
    </ProtectedRoute>
  );
}
