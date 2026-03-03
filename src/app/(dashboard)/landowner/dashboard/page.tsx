"use client";
import { HomeDashboard } from '@/components/compass/HomeDashboard'
import { PlanRecord } from '@/components/compass/PlannerLanding';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function LandownerDashboard() {
    const router = useRouter();
      const [activePlan, setActivePlan] = useState<PlanRecord | null>(null);
      // Predicted bags for harvest now flow
      const predictedBags = useMemo(() => {
        if (!activePlan) return 0;
        const perBed = activePlan.duration <= 30 ? 3 : 5;
        return activePlan.bedCount * perBed;
      }, [activePlan])

  return (
    <HomeDashboard
                landownerName="Ravi"
                savedPlan={
                  activePlan
                    ? { bedCount: activePlan.bedCount, duration: activePlan.duration, date: activePlan.date }
                    : null
                }
                onNavigateToPlanner={() => router.push("/landowner/planner")}
                onNavigateToMarket={() => router.push("/landowner/market")}
              />
  )
}
