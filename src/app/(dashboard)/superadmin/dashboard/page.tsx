"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Shield, UserCheck } from "lucide-react";
import { adminController } from "@/services/admin.controller";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/dtos/auth.dto";

const ROLES_NEEDING_VERIFICATION = [UserRole.LANDOWNER, UserRole.DISTRIBUTOR, UserRole.LABORATORY];

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPlans: 0,
    pendingVerifications: 0,
    isLoading: true,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [firstPage, plans] = await Promise.all([
          adminController.getUsers(1, 100),
          adminController.getPlans(),
        ]);

        let allUsers = firstPage.data || [];
        const total = firstPage.pagination?.total || 0;
        const totalPages = Math.ceil(total / 100);

        for (let page = 2; page <= totalPages; page++) {
          const res = await adminController.getUsers(page, 100);
          allUsers = allUsers.concat(res.data || []);
        }

        const pendingCount = allUsers.filter(
          (u: any) =>
            u.isOnboarded &&
            !u.isVerified &&
            ROLES_NEEDING_VERIFICATION.includes(u.role)
        ).length;

        setStats({
          totalUsers: total,
          totalPlans: Array.isArray(plans) ? plans.length : 0,
          pendingVerifications: pendingCount,
          isLoading: false,
        });
      } catch {
        setStats((prev) => ({ ...prev, isLoading: false }));
      }
    }
    fetchStats();
  }, []);

  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Pending Verifications",
      value: stats.pendingVerifications,
      icon: UserCheck,
      color: "text-amber-600",
    },
    {
      title: "Active Plans",
      value: stats.totalPlans,
      icon: CreditCard,
      color: "text-green-600",
    },
    {
      title: "Your Role",
      value: user?.role || "—",
      icon: Shield,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.isLoading ? "..." : card.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
