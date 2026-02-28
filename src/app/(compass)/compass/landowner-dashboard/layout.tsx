"use client";

import React, { useState, useMemo } from "react";
import { AppProvider } from "@/context/compass/AppContext";
import { TopNavBar } from "@/components/compass/TopNavBar";
import { BottomNavBar, NavTab } from "@/components/compass/BottomNavBar";
import { PlanCreationFlow } from "@/components/compass/PlanCreationFlow";
import { PlannerLanding, PlanRecord } from "@/components/compass/PlannerLanding";
import { HarvestNowFlow } from "@/components/compass/HarvestNowFlow";
import { MarketAnalysis } from "@/components/compass/MarketAnalysis";
import { HomeDashboard } from "@/components/compass/HomeDashboard";

import { CircleUserRound } from "lucide-react";

type PlannerView = "landing" | "creating" | "harvesting";

export default function LandownerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [plannerView, setPlannerView] = useState<PlannerView>("landing");

  // Active plan (null = no plan)
  const [activePlan, setActivePlan] = useState<PlanRecord | null>(null);

  // Plan history (completed / past plans)
  const [planHistory, setPlanHistory] = useState<PlanRecord[]>([]);

  // Worker count (carried over from creation)
  const [workerCount, setWorkerCount] = useState(3);


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
              onComplete={(plan) => {
                const newPlan: PlanRecord = {
                  id: `plan-${Date.now()}`,
                  planType: plan.planType || "fresher",
                  date: plan.date,
                  duration: plan.duration || 45,
                  bedCount: plan.bedCount,
                  workerCount: plan.workerCount || workerCount,
                  status: "active",
                };
                // Archive any existing active plan to history
                if (activePlan) {
                  setPlanHistory((h) => [{ ...activePlan, status: "completed" }, ...h]);
                }
                setActivePlan(newPlan);
                setWorkerCount(plan.workerCount || 3);
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
              onComplete={(data) => {
                // Archive active plan with actual results
                const completedPlan: PlanRecord = {
                  ...activePlan,
                  status: "completed",
                  actualBags: data.actualBags,
                  actualDate: data.actualDate,
                };
                setPlanHistory((h) => [completedPlan, ...h]);
                setActivePlan(null);
              }}
              onBack={() => setPlannerView("landing")}
            />
          );
        }

        // ── Default: Planner Landing ──
        return (
          <PlannerLanding
            activePlan={activePlan}
            planHistory={planHistory}
            onCreatePlan={() => setPlannerView("creating")}
            onHarvestNow={() => setPlannerView("harvesting")}
            onDiscardPlan={() => {
              if (activePlan) {
                setPlanHistory((h) => [{ ...activePlan, status: "cancelled" }, ...h]);
                setActivePlan(null);
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
            <h2 className="text-lg font-bold text-slate-900 mb-1">Profile</h2>
            <p className="text-sm text-slate-500">Coming soon</p>
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
