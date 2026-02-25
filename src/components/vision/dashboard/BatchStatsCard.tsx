"use client";

import { useMemo } from "react";
import { useVisionDetectionStore } from "@/stores/vision-detection-store";
import { Card, CardContent } from "@/components/ui/card";
import { Package, TrendingUp, CheckCircle2, Gem, AlertCircle, AlertTriangle, Droplets, Award } from "lucide-react";

export function BatchStatsCard() {
  const {
    currentBatchNumber,
    currentBatchStats,
    batchHistory,
    isStreaming,
    currentBatchId,
    currentResult,
  } = useVisionDetectionStore();

  const sessionStats = useMemo(() => {
    if (batchHistory.length === 0) return null;

    const validBatches = batchHistory.filter((b) => b.purityPercentage !== null);
    const avgPurity =
      validBatches.length > 0
        ? validBatches.reduce((sum, b) => sum + (b.purityPercentage ?? 0), 0) / validBatches.length
        : 0;

    return { avgPurity };
  }, [batchHistory]);

  const getBatchStatus = () => {
    if (!isStreaming) return { text: "Idle", color: "text-slate-400" };
    if (currentBatchId) return { text: `#${currentBatchNumber}`, color: "text-slate-900" };
    return { text: "Ready", color: "text-cyan-500" };
  };

  const batchStatus = getBatchStatus();

  const currentCounts = useMemo(() => {
    if (currentResult) {
      return {
        pure: currentResult.roiPureCount ?? 0,
        impure: currentResult.roiImpureCount ?? 0,
        unwanted: currentResult.roiUnwantedCount ?? 0,
      };
    }
    return null;
  }, [currentResult]);

  const currentWhiteness = useMemo(() => {
    if (currentResult && currentBatchId) {
      return currentResult.roiAvgWhiteness ?? currentResult.avgWhiteness ?? null;
    }
    return currentBatchStats?.avgWhiteness ?? null;
  }, [currentResult, currentBatchId, currentBatchStats]);

  const currentQuality = useMemo(() => {
    if (currentResult && currentBatchId) {
      return currentResult.roiAvgQualityScore ?? currentResult.avgQualityScore ?? null;
    }
    return currentBatchStats?.avgQualityScore ?? null;
  }, [currentResult, currentBatchId, currentBatchStats]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-50">
              <Package className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Current Batch</p>
              <p className={`text-2xl font-bold ${batchStatus.color}`}>
                {batchStatus.text}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50">
              <Gem className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Pure</p>
              <p className="text-2xl font-bold text-emerald-600">
                {currentCounts ? currentCounts.pure : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Impure</p>
              <p className="text-2xl font-bold text-red-600">
                {currentCounts ? currentCounts.impure : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Unwanted</p>
              <p className="text-2xl font-bold text-orange-600">
                {currentCounts ? currentCounts.unwanted : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Session Avg</p>
              <p className="text-2xl font-bold text-slate-900">
                {sessionStats ? `${sessionStats.avgPurity.toFixed(0)}%` : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50">
              <CheckCircle2 className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Completed</p>
              <p className="text-2xl font-bold text-slate-900">
                {batchHistory.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-50">
              <Droplets className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Whiteness</p>
              <p className="text-2xl font-bold text-cyan-600">
                {currentWhiteness !== null ? `${currentWhiteness.toFixed(1)}%` : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-50">
              <Award className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Quality</p>
              <p className="text-2xl font-bold text-yellow-600">
                {currentQuality !== null ? `${currentQuality.toFixed(1)}` : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
