"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Camera,
  Sun,
  Focus,
  Cpu,
  Upload,
  RotateCcw,
  Shield,
  User,
  Edit,
  Trash2,
  Crown,
  CalendarDays,
  CreditCard,
  Check,
  AlertTriangle,
} from "lucide-react";
import PageHeader from "@/components/vision/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { paymentController } from "@/services/payment.controller";

/**
 * Convert a gRPC Timestamp ({ seconds, nanos }) or ISO string to an ISO string.
 */
function toISOString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    let secs = obj.seconds;
    if (secs && typeof secs === 'object' && secs !== null && 'low' in (secs as Record<string, unknown>)) {
      secs = (secs as Record<string, unknown>).low;
    }
    const ms = Number(secs) * 1000;
    if (!isNaN(ms) && ms > 0) {
      return new Date(ms).toISOString();
    }
  }
  return undefined;
}

interface NormalizedPayment {
  amount: number;
  billingCycle: string;
  status: string;
  createdAt?: string;
}

const LAB_PLAN = {
  name: "Lab Plan",
  level: 2,
  priceMonthlyLKR: 2500,
  priceAnnualLKR: 25000,
  features: [
    "AI-powered quality inspection",
    "Real-time camera monitoring",
    "Batch purity reports",
    "Detection history & analytics",
  ],
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [lastPayment, setLastPayment] = useState<NormalizedPayment | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscriptionData() {
      if (!user?.isSubscribed) {
        setSubscriptionLoading(false);
        return;
      }
      try {
        const payments = await paymentController.getPayments();
        // Normalize raw payment fields (backend may use snake_case or gRPC timestamps)
        const normalized: NormalizedPayment[] = payments.map((p: any) => ({
          amount: p.amount ?? 0,
          billingCycle: p.billingCycle ?? p.billing_cycle ?? "monthly",
          status: p.status ?? "",
          createdAt: toISOString(p.createdAt || p.created_at),
        }));
        const successfulPayments = normalized
          .filter((p) => p.status === "success")
          .sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
          );
        if (successfulPayments.length > 0) {
          setLastPayment(successfulPayments[0]);
        }
      } catch (err) {
        console.error("Failed to fetch subscription data:", err);
      } finally {
        setSubscriptionLoading(false);
      }
    }
    fetchSubscriptionData();
  }, [user?.isSubscribed]);

  // Calculate subscription dates from the last successful payment
  const subscriptionStart = lastPayment?.createdAt
    ? new Date(lastPayment.createdAt)
    : null;

  const subscriptionEnd = (() => {
    if (!subscriptionStart || !lastPayment) return null;
    const end = new Date(subscriptionStart);
    if (lastPayment.billingCycle === "annual") {
      end.setFullYear(end.getFullYear() + 1);
    } else {
      end.setMonth(end.getMonth() + 1);
    }
    return end;
  })();

  const daysRemaining = subscriptionEnd
    ? Math.max(
      0,
      Math.ceil(
        (subscriptionEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    )
    : null;

  const totalDays =
    subscriptionStart && subscriptionEnd
      ? Math.ceil(
        (subscriptionEnd.getTime() - subscriptionStart.getTime()) /
        (1000 * 60 * 60 * 24)
      )
      : null;

  const progressPercent =
    daysRemaining !== null && totalDays
      ? Math.round(((totalDays - daysRemaining) / totalDays) * 100)
      : 0;

  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7;
  const isExpired = daysRemaining !== null && daysRemaining === 0;

  const users = [
    { name: "Admin User", email: "admin@saltqc.com", role: "Admin", status: "Active" },
    { name: "QC Operator 1", email: "qc1@saltqc.com", role: "QC Operator", status: "Active" },
    { name: "QC Operator 2", email: "qc2@saltqc.com", role: "QC Operator", status: "Active" },
    { name: "Supervisor", email: "supervisor@saltqc.com", role: "Supervisor", status: "Active" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader title="System Settings" description="Configure cameras, AI models, and user access" />

      {/* Subscription Plan */}
      {subscriptionLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-2 w-full" />
            <div className="grid gap-3 md:grid-cols-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </CardContent>
        </Card>
      ) : user?.isSubscribed ? (
        <Card className="border-2 border-blue-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-blue-600" />
                Subscription Plan
              </CardTitle>
              <div className="flex items-center gap-2">
                {isExpired ? (
                  <Badge variant="destructive">Expired</Badge>
                ) : isExpiringSoon ? (
                  <Badge variant="destructive" className="bg-amber-600">
                    Expiring Soon
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-blue-600">
                    Active
                  </Badge>
                )}
                {lastPayment && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {lastPayment.billingCycle}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plan Name & Price */}
            <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
              <div>
                <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400">
                  {LAB_PLAN.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Level {LAB_PLAN.level} Plan
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  LKR{" "}
                  {lastPayment?.billingCycle === "annual"
                    ? LAB_PLAN.priceAnnualLKR.toLocaleString()
                    : LAB_PLAN.priceMonthlyLKR.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  per {lastPayment?.billingCycle === "annual" ? "year" : "month"}
                </p>
              </div>
            </div>

            {/* Subscription Timeline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subscription Period</span>
                {daysRemaining !== null && (
                  <span
                    className={`font-semibold ${isExpired
                        ? "text-red-600"
                        : isExpiringSoon
                          ? "text-amber-600"
                          : "text-blue-600"
                      }`}
                  >
                    {isExpired
                      ? "Expired"
                      : `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining`}
                  </span>
                )}
              </div>
              <Progress
                value={progressPercent}
                className={`h-2.5 ${isExpired
                    ? "[&>[data-slot=progress-indicator]]:bg-red-500"
                    : isExpiringSoon
                      ? "[&>[data-slot=progress-indicator]]:bg-amber-500"
                      : "[&>[data-slot=progress-indicator]]:bg-blue-500"
                  }`}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {subscriptionStart
                    ? subscriptionStart.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                    : "—"}
                </span>
                <span>
                  {subscriptionEnd
                    ? subscriptionEnd.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                    : "—"}
                </span>
              </div>
            </div>

            {/* Key Info Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-xs">Started</span>
                </div>
                <p className="mt-1 font-semibold">
                  {subscriptionStart
                    ? subscriptionStart.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                    : "—"}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs">Expires</span>
                </div>
                <p
                  className={`mt-1 font-semibold ${isExpired
                      ? "text-red-600"
                      : isExpiringSoon
                        ? "text-amber-600"
                        : ""
                    }`}
                >
                  {subscriptionEnd
                    ? subscriptionEnd.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                    : "—"}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-xs">Last Payment</span>
                </div>
                <p className="mt-1 font-semibold">
                  {lastPayment
                    ? `LKR ${lastPayment.amount.toLocaleString()}`
                    : "—"}
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Included Features
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {LAB_PLAN.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-blue-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action */}
            {(isExpired || isExpiringSoon) && (
              <Button
                className="w-full gap-2"
                variant={isExpired ? "default" : "outline"}
                onClick={() => (window.location.href = "/auth/plans")}
              >
                <CreditCard className="h-4 w-4" />
                {isExpired ? "Renew Subscription" : "Renew Early"}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : !user?.isSubscribed ? (
        <Card className="border-2 border-amber-200">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <AlertTriangle className="h-10 w-10 text-amber-500" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">No Active Subscription</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Subscribe to a plan to access all laboratory features.
              </p>
            </div>
            <Button
              className="gap-2"
              onClick={() => (window.location.href = "/auth/plans")}
            >
              <Crown className="h-4 w-4" />
              View Plans
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Software Version</p>
              <p className="mt-1 font-semibold">v2.4.1</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Last System Update</p>
              <p className="mt-1 font-semibold">Jan 15, 2024</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">License Status</p>
              <p className="mt-1 font-semibold text-green-600">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
