"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Shield } from "lucide-react";
import { adminController } from "@/services/admin.controller";
import { useAuth } from "@/hooks/useAuth";

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPlans: 0,
    isLoading: true,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [usersRes, plans] = await Promise.all([
          adminController.getUsers(1, 1),
          adminController.getPlans(),
        ]);
        setStats({
          totalUsers: usersRes.pagination?.total || 0,
          totalPlans: Array.isArray(plans) ? plans.length : 0,
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
