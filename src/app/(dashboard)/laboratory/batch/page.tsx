"use client";

import { useState, useEffect, useCallback } from "react";
import { visionApi } from "@/lib/vision-api-client";
import { BatchSummary } from "@/types/vision-detection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, CheckCircle, Timer, RefreshCw, AlertCircle } from "lucide-react";
import PageHeader from "@/components/vision/PageHeader";

function getPurityColor(purity: number | null | undefined): string {
  if (purity === null || purity === undefined) return "text-slate-400";
  if (purity >= 80) return "text-emerald-600";
  if (purity >= 60) return "text-yellow-600";
  return "text-red-600";
}

function getPurityBgColor(purity: number | null | undefined): string {
  if (purity === null || purity === undefined) return "bg-slate-100";
  if (purity >= 80) return "bg-emerald-50";
  if (purity >= 60) return "bg-yellow-50";
  return "bg-red-50";
}

function getWhitenessColor(whiteness: number | null | undefined): string {
  if (whiteness === null || whiteness === undefined) return "text-slate-400";
  if (whiteness >= 80) return "text-blue-600";
  if (whiteness >= 60) return "text-cyan-600";
  return "text-slate-500";
}

function getWhitenessBgColor(whiteness: number | null | undefined): string {
  if (whiteness === null || whiteness === undefined) return "bg-slate-100";
  if (whiteness >= 80) return "bg-blue-50";
  if (whiteness >= 60) return "bg-cyan-50";
  return "bg-slate-100";
}

function getQualityColor(quality: number | null | undefined): string {
  if (quality === null || quality === undefined) return "text-slate-400";
  if (quality >= 70) return "text-amber-600";
  if (quality >= 50) return "text-orange-500";
  return "text-slate-500";
}

function getQualityBgColor(quality: number | null | undefined): string {
  if (quality === null || quality === undefined) return "bg-slate-100";
  if (quality >= 70) return "bg-amber-50";
  if (quality >= 50) return "bg-orange-50";
  return "bg-slate-100";
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatDuration(startTime: string, endTime: string | null): string {
  if (!endTime) return "--";
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const durationMs = end - start;
  const seconds = Math.floor(durationMs / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export default function BatchAssessmentPage() {
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await visionApi.getAllBatches({ page: 1, limit: 100 });
      setBatches(response.batches);
    } catch (err) {
      console.error("Failed to fetch batches:", err);
      setBatches([]);
      setError("Could not connect to backend. Please ensure the server is running and MongoDB is connected.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Batch Quality Assessment" description="Detection batches from the current session" />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBatches}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Badge variant="secondary" className="text-sm">
            {batches.length} batches
          </Badge>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Connection Error</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Package className="h-5 w-5 text-slate-500" />
            All Batches
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-slate-500">
              <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              Loading batches...
            </div>
          ) : batches.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No batches found</p>
              <p className="text-xs mt-1">Start a detection session to see batches here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Batch #</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Start Time
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">End Time</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-600">
                      <div className="flex items-center justify-center gap-1">
                        <Timer className="h-3.5 w-3.5" />
                        Duration
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-emerald-600">Pure</th>
                    <th className="text-center py-3 px-4 font-semibold text-red-600">Impure</th>
                    <th className="text-center py-3 px-4 font-semibold text-orange-600">Unwanted</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-600">Total</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-600">Purity</th>
                    <th className="text-center py-3 px-4 font-semibold text-blue-600">Whiteness</th>
                    <th className="text-center py-3 px-4 font-semibold text-amber-600">Quality</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-600">Frames</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">#{batch.batchNumber}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {formatDateTime(batch.startTime)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {batch.endTime ? formatDateTime(batch.endTime) : "--"}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600">
                        {formatDuration(batch.startTime, batch.endTime)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-semibold text-emerald-600">{batch.pureCount}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-semibold text-red-600">{batch.impureCount}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-semibold text-orange-600">{batch.unwantedCount}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-medium text-slate-700">{batch.totalCount}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${getPurityColor(batch.purityPercentage)} ${getPurityBgColor(batch.purityPercentage)}`}
                        >
                          {batch.purityPercentage !== null && batch.purityPercentage !== undefined
                            ? `${batch.purityPercentage.toFixed(0)}%`
                            : "--"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${getWhitenessColor(batch.avgWhiteness)} ${getWhitenessBgColor(batch.avgWhiteness)}`}
                        >
                          {batch.avgWhiteness !== null && batch.avgWhiteness !== undefined
                            ? `${batch.avgWhiteness.toFixed(1)}%`
                            : "--"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${getQualityColor(batch.avgQualityScore)} ${getQualityBgColor(batch.avgQualityScore)}`}
                        >
                          {batch.avgQualityScore !== null && batch.avgQualityScore !== undefined
                            ? `${batch.avgQualityScore.toFixed(1)}`
                            : "--"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600">
                        {batch.frameCount}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {batch.endTime ? (
                          <Badge className="text-xs gap-1 bg-emerald-600 border-transparent text-white">
                            <CheckCircle className="h-3 w-3" />
                            Done
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            In Progress
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
