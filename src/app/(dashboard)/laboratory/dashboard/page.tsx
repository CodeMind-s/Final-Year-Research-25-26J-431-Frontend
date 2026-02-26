"use client";

import PageHeader from "@/components/vision/PageHeader";
import { LiveCameraView } from "@/components/vision/dashboard/LiveCameraView";
import { PurityGauge } from "@/components/vision/dashboard/PurityGauge";
import { BatchStatsCard } from "@/components/vision/dashboard/BatchStatsCard";
import { BatchHistoryPanel } from "@/components/vision/dashboard/BatchHistoryPanel";

export default function CameraMonitoringPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Real-Time Camera Monitoring"
        description="Live camera feed with AI-powered salt purity detection"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Camera Feed - 2/3 width */}
        <div className="lg:col-span-2">
          <LiveCameraView />
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          <PurityGauge />
          <BatchHistoryPanel />
        </div>
      </div>

      {/* Stats Cards - Full width */}
      <BatchStatsCard />
    </div>
  );
}
