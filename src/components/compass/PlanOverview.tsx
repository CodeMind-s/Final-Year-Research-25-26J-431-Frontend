"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Grid3X3,
  CalendarDays,
  Package,
  Users,
  Wallet,
  TrendingUp,
  Minus,
  Plus,
  Star,
  BadgeCheck,
  LogOut,
} from "lucide-react";
import { distributorOffersController } from "@/services/distributor-ffers.controller";
import { DistributorOfferObject } from "@/types/distributor-offers.types";

// ─── Types ───────────────────────────────────────────────────────

interface PlanOverviewProps {
  initialBedCount: number;
  initialDuration: number;
  initialWorkerCount: number;
  /** Predicted selling price per bag (from backend). Defaults to 550 LKR. */
  predictedPricePerBag?: number;
  onEndPlan: () => void;
}

// ─── Constants (invisible to user) ───────────────────────────────

const DEFAULT_PRICE_PER_BAG = 1550; // LKR — fallback until backend provides a prediction
const CARRYING_COST_PER_BAG = 500; // LKR — labour cost per bag
const REFRESHMENT_PER_DAY = 350; // LKR per worker per day
const BAGS_PER_WORKER_PER_DAY = 50; // how many bags one worker can carry in a day

// ─── Stepper ─────────────────────────────────────────────────────

const Stepper: React.FC<{
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}> = ({ value, min, max, step = 1, onChange }) => (
  <div className="flex items-center gap-2">
    <button
      onClick={() => onChange(Math.max(min, value - step))}
      disabled={value <= min}
      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
        value <= min
          ? "bg-slate-100 text-slate-300"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      <Minus size={16} />
    </button>
    <span className="text-lg font-bold text-slate-900 min-w-[2.5rem] text-center tabular-nums">
      {value}
    </span>
    <button
      onClick={() => onChange(Math.min(max, value + step))}
      disabled={value >= max}
      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
        value >= max
          ? "bg-slate-100 text-slate-300"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      <Plus size={16} />
    </button>
  </div>
);

// ─── Duration picker ─────────────────────────────────────────────

const DurationPicker: React.FC<{
  value: number;
  onChange: (v: number) => void;
}> = ({ value, onChange }) => {
  const options = [30, 45, 60];
  return (
    <div className="flex items-center gap-1.5">
      {options.map((d) => (
        <button
          key={d}
          onClick={() => onChange(d)}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all active:scale-95 ${
            value === d
              ? "bg-compass-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {d}d
        </button>
      ))}
    </div>
  );
};

// ─── Component ───────────────────────────────────────────────────

export const PlanOverview: React.FC<PlanOverviewProps> = ({
  initialBedCount,
  initialDuration,
  initialWorkerCount,
  predictedPricePerBag = DEFAULT_PRICE_PER_BAG,
  onEndPlan,
}) => {
  const [bedCount, setBedCount] = useState(initialBedCount);
  const [duration, setDuration] = useState(initialDuration);
  const [workerCount, setWorkerCount] = useState(initialWorkerCount);
  const [distributorOffers, setDistributorOffers] = useState<DistributorOfferObject[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);

  // Fetch distributor offers on mount
  useEffect(() => {
    const fetchOffers = async () => {
      setIsLoadingOffers(true);
      try {
        const response = await distributorOffersController.getDistributorOffers({
          page: 1,
          limit: 10,
          status: "PUBLISH", // Only show published offers
        });

        // Handle both response formats
        if (Array.isArray(response)) {
          setDistributorOffers(response as any);
        } else if ((response as any).success && (response as any).data) {
          setDistributorOffers((response as any).data);
        }
      } catch (error) {
        console.error("Failed to fetch distributor offers:", error);
      } finally {
        setIsLoadingOffers(false);
      }
    };

    fetchOffers();
  }, []);

  // Derived values — all recalculate instantly on input change
  const computed = useMemo(() => {
    const productionPerBed = duration <= 30 ? 3 : duration <= 45 ? 5 : 7;
    const totalBags = bedCount * productionPerBed;

    // Labour: workers are paid per bag (carrying at end of season)
    const totalWages = totalBags * CARRYING_COST_PER_BAG;

    // Work days: workers only work 1–2 days at the end of the season
    const workDays = Math.max(1, Math.ceil(totalBags / (workerCount * BAGS_PER_WORKER_PER_DAY)));
    const totalRefreshments = workerCount * REFRESHMENT_PER_DAY * workDays;

    const totalExpenses = totalWages + totalRefreshments;
    const revenue = totalBags * predictedPricePerBag;
    const profit = revenue - totalExpenses;

    // Best seller profit
    const bestSeller = SELLERS.reduce((best, s) =>
      s.pricePerBag > best.pricePerBag ? s : best
    );
    const bestProfit = totalBags * bestSeller.pricePerBag - totalExpenses;

    return {
      totalBags,
      totalExpenses,
      revenue,
      profit,
      bestProfit,
      workDays,
    };
  }, [bedCount, duration, workerCount]);

  // Cards config
  const editableCards = [
    {
      icon: Grid3X3,
      iconBg: "bg-amber-50 text-amber-600",
      label: "Number of Beds",
      control: (
        <Stepper value={bedCount} min={1} max={50} onChange={setBedCount} />
      ),
    },
    {
      icon: CalendarDays,
      iconBg: "bg-sky-50 text-sky-600",
      label: "Season Duration",
      control: <DurationPicker value={duration} onChange={setDuration} />,
    },
    {
      icon: Users,
      iconBg: "bg-violet-50 text-violet-600",
      label: "Workers",
      control: (
        <Stepper value={workerCount} min={1} max={30} onChange={setWorkerCount} />
      ),
    },
  ];

  const computedCards = [
    {
      icon: Package,
      iconBg: "bg-emerald-50 text-emerald-600",
      label: "Predicted Production",
      value: `~${computed.totalBags} bags`,
    },
    {
      icon: Wallet,
      iconBg: "bg-red-50 text-red-600",
      label: "Total Expenses",
      value: `Rs. ${computed.totalExpenses.toLocaleString()}`,
    },
  ];

  return (
    <div className="px-4 pt-4 pb-28 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-lg font-bold text-slate-900">Your Plan Overview</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Adjust numbers to see how they affect your profit
        </p>
      </div>

      {/* Editable cards */}
      <div className="space-y-2.5 mb-4">
        {editableCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}
                >
                  <Icon size={20} />
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {card.label}
                </p>
              </div>
              {card.control}
            </div>
          );
        })}
      </div>

      {/* Computed cards */}
      <div className="space-y-2.5 mb-4">
        {computedCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}
                >
                  <Icon size={20} />
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {card.label}
                </p>
              </div>
              <p className="text-base font-bold text-slate-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Profit hero card */}
      <div
        className={`rounded-xl p-5 mb-6 shadow-lg ${
          computed.profit >= 0
            ? "bg-emerald-600 shadow-emerald-600/20"
            : "bg-red-600 shadow-red-600/20"
        }`}
      >
        <p className="text-xs text-white/70 font-medium uppercase tracking-wide mb-1">
          Estimated Profit
        </p>
        <p className="text-2xl font-extrabold text-white">
          Rs. {computed.profit.toLocaleString()}
        </p>
        <p className="text-[11px] text-white/60 mt-1">
          Revenue Rs. {computed.revenue.toLocaleString()} − Expenses Rs.{" "}
          {computed.totalExpenses.toLocaleString()}
        </p>
      </div>

      {/* Recommended Sellers */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-slate-900 mb-3">
          Recommended Sellers
        </h2>
        {isLoadingOffers ? (
          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm text-center">
            <div className="w-8 h-8 border-4 border-compass-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-slate-500">Loading offers...</p>
          </div>
        ) : distributorOffers.length === 0 ? (
          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm text-center">
            <p className="text-sm text-slate-500">No offers available at the moment</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {distributorOffers
              .sort((a, b) => {
                // Calculate profit for each offer and sort by highest profit
                const profitA = computed.totalBags * a.pricePerKilo - computed.totalExpenses;
                const profitB = computed.totalBags * b.pricePerKilo - computed.totalExpenses;
                return profitB - profitA;
              })
              .slice(0, 3) // Show top 3 offers
              .map((offer, index) => {
                const sellerProfit = computed.totalBags * offer.pricePerKilo - computed.totalExpenses;
                const isBestOffer = index === 0; // Highlight the best offer
                const companyName = offer.distributor?.distributorDetails?.companyName || "Distributor";
                
                // Generate simple rating (can be enhanced with real data later)
                const rating = 4.3 + (index * 0.2);
                
                // Badge based on requirement level
                const badge = offer.requirement === "HIGH" 
                  ? "Urgent Need" 
                  : offer.requirement === "MEDIUM" 
                  ? "Quick Payment" 
                  : "Bulk Buyer";

                return (
                  <div
                    key={offer._id}
                    className={`rounded-xl p-4 border shadow-sm transition-all ${
                      isBestOffer
                        ? "bg-compass-50 border-compass-200 ring-1 ring-compass-300"
                        : "bg-white border-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {companyName}
                        </p>
                        {isBestOffer && (
                          <span className="px-2 py-0.5 bg-compass-600 text-white text-[10px] font-bold rounded-md uppercase">
                            Best Profit
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        <span className="text-xs font-semibold text-slate-600">
                          {rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <BadgeCheck size={14} className="text-slate-400" />
                          <span className="text-[11px] text-slate-500">
                            {badge}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">•</span>
                        <span className="text-[11px] text-slate-500">
                          Rs. {offer.pricePerKilo.toLocaleString()}/bag
                        </span>
                      </div>
                      <p
                        className={`text-sm font-bold ${
                          sellerProfit >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {sellerProfit >= 0 ? "+" : ""}Rs.{" "}
                        {sellerProfit.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
                    </span>
                  </div>
                  <p
                    className={`text-sm font-bold ${
                      sellerProfit >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {sellerProfit >= 0 ? "+" : ""}Rs.{" "}
                    {sellerProfit.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA — End Plan */}
      <div className="fixed bottom-20 right-4 lg:bottom-4 z-30">
        <button
          onClick={onEndPlan}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm py-3 px-5 rounded-xl shadow-lg shadow-slate-800/30 transition-all active:scale-[0.98]"
        >
          <LogOut size={16} />
          End Plan
        </button>
      </div>
    </div>
  );
};
