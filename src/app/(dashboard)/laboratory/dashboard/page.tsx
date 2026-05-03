"use client";

import { LiveCameraView } from "@/components/vision/dashboard/LiveCameraView";
import { PurityGauge } from "@/components/vision/dashboard/PurityGauge";
import { BatchStatsCard } from "@/components/vision/dashboard/BatchStatsCard";
// import { BatchHistoryPanel } from "@/components/vision/dashboard/BatchHistoryPanel";
import { LabAgentBanner } from "@/components/vision/lab-agent-banner";
import { useLabAgentHealth } from "@/hooks/use-lab-agent-health";

export default function CameraMonitoringPage() {
  const labAgent = useLabAgentHealth();
  // Treat "probe in flight" (null) as available — avoids a flash of the
  // install banner on first paint.
  const agentDown = labAgent.available === false;

  return (
    <div className="space-y-6">
      {agentDown && <LabAgentBanner />}

      <LiveCameraView />

      <PurityGauge />

      <BatchStatsCard />
    </div>
  );
}
