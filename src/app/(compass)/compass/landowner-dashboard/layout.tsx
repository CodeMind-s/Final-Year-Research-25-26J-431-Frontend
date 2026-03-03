"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { AppProvider } from "@/context/compass/AppContext";
import { TopNavBar } from "@/components/compass/TopNavBar";
import { BottomNavBar, NavTab } from "@/components/compass/BottomNavBar";
import { PlanCreationFlow } from "@/components/compass/PlanCreationFlow";
import { PlannerLanding, PlanRecord } from "@/components/compass/PlannerLanding";
import { HarvestNowFlow } from "@/components/compass/HarvestNowFlow";
import { MarketAnalysis } from "@/components/compass/MarketAnalysis";
import { HomeDashboard } from "@/components/compass/HomeDashboard";
import { harvestPlanController } from "@/services/plan.controller";
import { HarvestPlan } from "@/types/harvest-plan.types";

import { CircleUserRound } from "lucide-react";

type PlannerView = "landing" | "creating" | "harvesting";

export default function LandownerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('compass');
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [plannerView, setPlannerView] = useState<PlannerView>("landing");

  // Active plan (null = no plan)
  const [activePlan, setActivePlan] = useState<PlanRecord | null>(null);

  // Plan history (completed / past plans)
  const [planHistory, setPlanHistory] = useState<PlanRecord[]>([]);

  // Worker count (carried over from creation)
  const [workerCount, setWorkerCount] = useState(3);

  // Loading state
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  // Transform HarvestPlan to PlanRecord
  const transformPlanToRecord = (plan: HarvestPlan): PlanRecord => {
    // Determine plan type based on duration (30 days = fresher, 45 days = midlevel)
    const planType = plan.planPeriod <= 30 ? "fresher" : "midlevel";
    
    // Helper to extract date without time from ISO string
    const extractDate = (dateStr: string): string => {
      if (!dateStr) return dateStr;
      // If it's an ISO string like "2024-03-03T00:00:00.000Z", extract just the date part
      return dateStr.split('T')[0];
    };
    
    // Normalize harvestStatus to string for comparison
    const harvestStatus = typeof plan.harvestStatus === 'string' 
      ? plan.harvestStatus.toUpperCase() 
      : String(plan.harvestStatus);
    
    // Determine status:
    // - Only "FRESHER" or "MIDLEVEL" can be "active"
    // - "HARVESTED" or "DISPOSED" are always "completed"
    // - If actualProduction > 0, it's "completed" regardless
    let status: "active" | "completed" | "cancelled" = "active";
    
    if (harvestStatus === "HARVESTED" || harvestStatus === "DISPOSED") {
      status = "completed";
    } else if (harvestStatus === "FRESHER" || harvestStatus === "MIDLEVEL" || harvestStatus === "MATURE") {
      // FRESHER and MIDLEVEL can be active only if not yet harvested
      status = plan.actualProduction > 0 ? "completed" : "active";
    } else {
      // Unknown status - mark as completed to be safe
      status = "completed";
    }
    
    const transformed = {
      id: plan._id,
      planType,
      date: extractDate(plan.startDate),
      duration: plan.planPeriod,
      bedCount: plan.saltBeds,
      workerCount: plan.workerCount,
      status,
      actualBags: plan.actualProduction > 0 ? plan.actualProduction : undefined,
      actualDate: plan.actualProduction > 0 ? extractDate(plan.endDate) : undefined,
      updatedAt: plan.updatedAt ? extractDate(plan.updatedAt) : undefined,
    };
    
    console.log("Transforming plan:", plan._id, "harvestStatus:", harvestStatus, "actualProduction:", plan.actualProduction, "→ status:", transformed.status);
    return transformed as PlanRecord;
  };

  // Fetch harvest plans
  const fetchHarvestPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const response = await harvestPlanController.getHarvestPlans({
        page: 1,
        limit: 50,
      });

      console.log("Fetch response:", response);

      // Handle both response formats: direct array or wrapped in {success, data}
      let plansData: HarvestPlan[] = [];
      
      if (Array.isArray(response)) {
        // Response is already the array of plans
        plansData = response;
      } else if (response && typeof response === 'object' && 'data' in response) {
        // Response is wrapped in {success, data}
        plansData = (response as any).data || [];
      }

      console.log("Plans data:", plansData);

      if (plansData.length > 0) {
        // Sort plans by createdAt (most recent first) for better ordering
        const sortedPlans = [...plansData].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        console.log("Sorted plans:", sortedPlans);

        // Transform all plans
        const transformedPlans = sortedPlans.map(transformPlanToRecord);

        console.log("Transformed plans:", transformedPlans);

        // Find the most recent active plan (where actualProduction = 0)
        const activeIndex = transformedPlans.findIndex(p => p.status === "active");
        
        console.log("Active index:", activeIndex);

        if (activeIndex !== -1) {
          const selectedActivePlan = transformedPlans[activeIndex];
          const historyPlans = transformedPlans.filter((_, i) => i !== activeIndex);
          
          console.log("Setting active plan:", selectedActivePlan);
          console.log("Setting history plans:", historyPlans);
          
          setActivePlan(selectedActivePlan);
          setPlanHistory(historyPlans);
        } else {
          // All plans are completed, no active plan
          console.log("No active plans found, all completed");
          setActivePlan(null);
          setPlanHistory(transformedPlans);
        }
      } else {
        console.log("No plans found");
        setActivePlan(null);
        setPlanHistory([]);
      }
    } catch (error) {
      console.error("Failed to fetch harvest plans:", error);
      setActivePlan(null);
      setPlanHistory([]);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  // Fetch plans on mount
  useEffect(() => {
    fetchHarvestPlans();
  }, []);


  // Predicted bags for harvest now flow
  const predictedBags = useMemo(() => {
    if (!activePlan) return 0;
    const perBed = activePlan.duration <= 30 ? 3 : 5;
    return activePlan.bedCount * perBed;
  }, [activePlan]);

  const handleTabChange = (tab: NavTab) => setActiveTab(tab);
  const handleLogout = () => { window.location.href = "/compass"; };

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeDashboard
            landownerName="Ravi"
            savedPlan={
              activePlan
                ? { bedCount: activePlan.bedCount, duration: activePlan.duration, date: activePlan.date }
                : null
            }
            onNavigateToPlanner={() => setActiveTab("planner")}
            onNavigateToMarket={() => setActiveTab("market")}
          />
        );

      case "planner":
        // ── Creating a new plan ──
        if (plannerView === "creating") {
          return (
            <PlanCreationFlow
              onComplete={async (plan) => {
                // Refetch plans from server to get the latest data
                await fetchHarvestPlans();
                setPlannerView("landing");
              }}
              onBack={() => setPlannerView("landing")}
            />
          );
        }

        // ── Harvest recording flow ──
        if (plannerView === "harvesting" && activePlan) {
          return (
            <HarvestNowFlow
              predictedBags={predictedBags}
              planStartDate={activePlan.date}
              onComplete={async (data) => {
                try {
                  // Update the harvest plan with new status and actual production
                  await harvestPlanController.updateHarvestPlan(activePlan.id, {
                    harvestStatus: "HARVESTED",
                    actualProduction: data.actualBags,
                  });
                  console.log("Harvest plan updated successfully");
                } catch (error) {
                  console.error("Failed to update harvest plan:", error);
                }
                // Refetch plans from server to get updated data
                await fetchHarvestPlans();
                setPlannerView("landing");
              }}
              onBack={() => setPlannerView("landing")}
            />
          );
        }

        // ── Default: Planner Landing ──
        if (isLoadingPlans) {
          return (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-compass-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500">Loading your plans...</p>
              </div>
            </div>
          );
        }

        console.log("Rendering PlannerLanding with:", {
          activePlan,
          planHistoryLength: planHistory.length,
          planHistory
        });

        return (
          <PlannerLanding
            activePlan={activePlan}
            planHistory={planHistory}
            onCreatePlan={() => setPlannerView("creating")}
            onHarvestNow={() => setPlannerView("harvesting")}
            onDiscardPlan={async () => {
              if (activePlan) {
                try {
                  // Delete the harvest plan from the server
                  await harvestPlanController.deleteHarvestPlans(activePlan.id);
                  console.log("Harvest plan deleted successfully");
                  // Refetch plans to update the UI
                  await fetchHarvestPlans();
                } catch (error) {
                  console.error("Failed to delete harvest plan:", error);
                  // Fallback to local state update if API fails
                  setPlanHistory((h) => [{ ...activePlan, status: "cancelled" }, ...h]);
                  setActivePlan(null);
                }
              }
            }}
          />
        );

      case "market":
        return <MarketAnalysis />;

      case "profile":
        return (
          <div className="flex flex-col items-center justify-center px-6 pt-16 pb-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <CircleUserRound size={28} className="text-slate-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">{t('layout.profile')}</h2>
            <p className="text-sm text-slate-500">{t('layout.comingSoon')}</p>
          </div>
        );

      default:
        return children;
    }
  };

  return (
    <section className="min-h-screen w-full bg-slate-50">
      <AppProvider>
        <TopNavBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={handleLogout}
        />

        <main className="pb-20 lg:pb-0">
          {renderTabContent()}
        </main>

        <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} />
      </AppProvider>
    </section>
  );
}
