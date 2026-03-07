"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { AppProvider } from "@/context/compass/AppContext";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { TopNavBar } from "@/components/compass/TopNavBar";
import { BottomNavBar, NavTab } from "@/components/compass/BottomNavBar";
import { PlanCreationFlow } from "@/components/compass/PlanCreationFlow";
import { PlannerLanding, PlanRecord } from "@/components/compass/PlannerLanding";
import { HarvestNowFlow } from "@/components/compass/HarvestNowFlow";
import { MarketAnalysis } from "@/components/compass/MarketAnalysis";
import { HomeDashboard } from "@/components/compass/HomeDashboard";
import { harvestPlanController } from "@/services/plan.controller";
import { HarvestPlan } from "@/types/harvest-plan.types";
import { UserRole, PersonalDetailsResponse } from "@/dtos/auth.dto";
import { authController } from "@/services/auth.controller";

import { CircleUserRound, Mail, Phone, MapPin, Layers, CreditCard, CheckCircle, XCircle, Loader2 } from "lucide-react";

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

  // Profile state
  const [profileData, setProfileData] = useState<PersonalDetailsResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

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

  // Fetch profile data
  const fetchProfileData = async () => {
    try {
      setProfileLoading(true);
      const data = await authController.getPersonalDetails();
      setProfileData(data);
    } catch (err) {
      console.error('Failed to fetch profile data:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Fetch profile when profile tab is opened
  useEffect(() => {
    if (activeTab === 'profile' && !profileData) {
      fetchProfileData();
    }
  }, [activeTab]);


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
        if (profileLoading) {
          return (
            <div className="flex items-center justify-center px-6 pt-16 pb-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="animate-spin text-compass-600" />
                <p className="text-sm text-slate-500">{t('layout.loading')}</p>
              </div>
            </div>
          );
        }

        if (!profileData) {
          return (
            <div className="max-w-xl mx-auto">
              <div className="flex flex-col items-center justify-center px-6 pt-16 pb-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <CircleUserRound size={28} className="text-slate-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">{t('layout.profile')}</h2>
                <p className="text-sm text-slate-500 mb-4">{t('layout.failedToLoad')}</p>
                <button
                  onClick={fetchProfileData}
                  className="px-4 py-2 bg-compass-600 text-white rounded-xl font-semibold active:scale-95 transition-all"
                >
                  {t('layout.retry')}
                </button>
              </div>
            </div>
          );
        }

        return (
          <div className="max-w-2xl mx-auto px-4 pt-5 pb-6 space-y-4">
            {/* Profile Header */}
            <div className="bg-linear-to-r from-indigo-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <CircleUserRound size={28} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold">{t('profile.landownerProfile')}</h2>
                    {profileData.user.isVerified && (
                      <CheckCircle size={14} className="text-green-300" />
                    )}
                  </div>
                  <p className="text-white/80 text-xs">{profileData.user.role}</p>
                </div>
              </div>
              {profileData.user.plan && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-white/15 backdrop-blur-sm rounded-xl">
                    <p className="text-[10px] text-white/60 uppercase font-semibold mb-0.5">{t('profile.planLabel')}</p>
                    <p className="text-sm font-bold capitalize">{profileData.user.plan}</p>
                  </div>
                  {profileData.user.isSubscribed && (
                    <div className="px-3 py-2 bg-green-500/20 border border-green-300/30 rounded-xl">
                      <p className="text-xs font-bold text-green-200">{t('profile.active')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Account Information Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <CircleUserRound size={16} className="text-indigo-600" />
                {t('profile.accountInfo')}
              </h3>
              <div className="space-y-3">
                {/* Email */}
                {profileData.user.email && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <Mail size={16} className="text-slate-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">{t('profile.email')}</p>
                      <p className="text-sm font-medium text-slate-800 wrap-break-word">
                        {profileData.user.email}
                      </p>
                    </div>
                  </div>
                )}

                {/* Phone */}
                {profileData.user.phone && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <Phone size={16} className="text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">{t('profile.phone')}</p>
                      <p className="text-sm font-medium text-slate-800">
                        {profileData.user.phone}
                      </p>
                    </div>
                  </div>
                )}

                {/* Status Badges */}
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <CheckCircle size={16} className="text-slate-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">{t('profile.status')}</p>
                    <div className="flex flex-wrap gap-2">
                      {profileData.user.isOnboarded && (
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">
                          {t('profile.onboarded')}
                        </span>
                      )}
                      {profileData.user.isTrialActive && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                          {t('profile.trialActive')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Landowner Details Card */}
            {profileData.landOwnerDetails && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Layers size={16} className="text-emerald-600" />
                  {t('profile.landownerDetails')}
                </h3>
                <div className="space-y-3">
                  {/* NIC */}
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">
                      {t('profile.nic')}
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {profileData.landOwnerDetails.nic}
                    </p>
                  </div>

                  {/* Total Beds */}
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">
                      {t('profile.totalBeds')}
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {profileData.landOwnerDetails.totalBeds} {t('profile.bedsUnit')}
                    </p>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <MapPin size={16} className="text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">
                        {t('profile.address')}
                      </p>
                      <p className="text-sm font-medium text-slate-800 leading-relaxed">
                        {profileData.landOwnerDetails.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return children;
    }
  };

  return (
    <ProtectedRoute
      requiredRole={[UserRole.LANDOWNER]}
      requireVerified
      redirectTo="/"
    >
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
    </ProtectedRoute>
  );
}
