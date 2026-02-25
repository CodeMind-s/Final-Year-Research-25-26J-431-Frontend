'use client';

import DashboardLayout from "@/components/vision/DashboardLayout";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { UserRole } from "@/dtos/auth.dto";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute
      requiredRole={[UserRole.LABORATORY]}
      requireOnboarded
      requireSubscription
    >
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
