"use client";

import { useEffect, useState, useCallback } from "react";
import { adminController } from "@/services/admin.controller";
import { AdminSubscription } from "@/dtos/admin.dto";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 20;

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminController.getSubscriptions(page, PAGE_SIZE);
      setSubscriptions(res.subscriptions || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const statusBadge = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "active":
        return "default";
      case "trial":
        return "secondary";
      case "expired":
      case "cancelled":
        return "destructive";
      case "inactive":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-sm text-muted-foreground">
          {total} total subscription{total !== 1 ? "s" : ""} across all users
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trial</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : subscriptions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No subscriptions found
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs max-w-[120px] truncate">
                    {s.userId}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{s.planKey}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadge(s.status)}>{s.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {s.isTrial ? (
                      <Badge variant="secondary">Yes</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell className="capitalize">{s.paymentMethod}</TableCell>
                  <TableCell className="text-xs">
                    {formatDate(s.startDate)}
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatDate(s.endDate)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
