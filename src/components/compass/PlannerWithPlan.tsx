"use client";

import React from "react";
import {
  CalendarDays,
  Eye,
  Scissors,
  Clock,
  Grid3X3,
  TrendingUp,
  Shield,
} from "lucide-react";
import { HarvestCalendar } from "@/components/compass/HarvestCalendar";
import type { CalendarDay } from "@/sample-data/compass/mockCalendarData";

// ─── Types ───────────────────────────────────────────────────────

interface PlannerWithPlanProps {
  bedCount: number;
  duration: number;
  planType: string;
  date: string;
  onViewPlan: () => void;
  onHarvestNow: () => void;
  calendarDays: CalendarDay[];
  planDuration: number;
}

// ─── Component ───────────────────────────────────────────────────
//
// UX reasoning — why two separate CTAs:
//
// "View Plan" and "Harvest Now" serve fundamentally different mental states.
//   • "View Plan" = reviewing, adjusting, thinking about the future
//   • "Harvest Now" = acting, executing, committing to a sale
//
// Combining them would confuse the user. A farmer checking their plan
// shouldn't accidentally trigger a harvest record. These are different
// intents at different emotional moments.
//
// "Harvest Now" is visually secondary and uses an amber/warning color
// because it's an irreversible action — once you record a harvest,
// the data should be treated as committed. Making it a card (not the
// primary CTA) adds friction, which is the UX safeguard.

export const PlannerWithPlan: React.FC<PlannerWithPlanProps> = ({
  bedCount,
  duration,
  planType,
  date,
  onViewPlan,
  onHarvestNow,
  calendarDays,
  planDuration,
}) => {
  // Friendly date display
  const displayDate = (() => {
    try {
      const d = new Date(date + "T00:00:00");
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return date;
    }
  })();

  const planSummary = [
    {
      icon: Grid3X3,
      label: "Beds",
      value: bedCount.toString(),
      color: "text-amber-600 bg-amber-50",
    },
    {
      icon: Clock,
      label: "Duration",
      value: `${duration} days`,
      color: "text-sky-600 bg-sky-50",
    },
    {
      icon: CalendarDays,
      label: "Started",
      value: displayDate,
      color: "text-violet-600 bg-violet-50",
    },
  ];

  return (
    <div className="flex flex-col items-center px-5 pt-8 pb-12 max-w-md mx-auto">
      {/* Header */}
      <div className="relative mb-5">
        <div className="absolute inset-0 bg-compass-200/40 rounded-full blur-2xl scale-125" />
        <div className="relative w-16 h-16 bg-compass-50 border-2 border-compass-200 rounded-2xl flex items-center justify-center shadow-sm">
          <CalendarDays size={32} className="text-compass-600" />
        </div>
      </div>

      <h1 className="text-xl font-bold text-slate-900 text-center mb-1">
        Your Harvest Plan
      </h1>
      <p className="text-sm text-slate-500 text-center mb-6">
        {planType === "beginner" ? "Starting Fresh" : "Mid-Season"} plan is active
      </p>

      {/* Quick summary pills */}
      <div className="flex items-center gap-2 mb-8">
        {planSummary.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center gap-1.5 bg-white rounded-lg px-3 py-2 border border-slate-100 shadow-sm"
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center ${item.color}`}
              >
                <Icon size={13} />
              </div>
              <div className="text-left">
                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wide leading-none">
                  {item.label}
                </p>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* View Plan — primary CTA */}
      <button
        onClick={onViewPlan}
        className="w-full flex items-center justify-center gap-2.5 bg-compass-600 hover:bg-compass-700 text-white font-semibold text-base py-3.5 px-6 rounded-xl shadow-lg shadow-compass-600/25 transition-all active:scale-[0.98] hover:shadow-xl mb-3"
      >
        <Eye size={20} />
        View Plan
      </button>

      {/* Harvest Now — secondary CTA (intentionally less prominent) */}
      {/*
        UX safeguard: This button is styled as a warning-toned secondary action.
        It's NOT the primary button — the user must consciously choose to tap it.
        Additional safeguard: the flow itself starts with a confirmation step.
      */}
      <button
        onClick={onHarvestNow}
        className="w-full flex items-center gap-3 bg-white border border-amber-200 hover:border-amber-300 rounded-xl p-4 shadow-sm transition-all active:scale-[0.98] group"
      >
        <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
          <Scissors size={22} className="text-amber-600" />
        </div>
        <div className="text-left flex-1">
          <p className="text-sm font-semibold text-slate-900">Harvest Now</p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Record your harvest results and selling price
          </p>
        </div>
        <TrendingUp size={16} className="text-slate-300 flex-shrink-0" />
      </button>

      {/* Safeguard note */}
      <div className="flex items-center gap-1.5 mt-4">
        <Shield size={12} className="text-slate-300" />
        <p className="text-[10px] text-slate-400">
          Harvest recording is separate from your plan — your plan stays safe
        </p>
      </div>

      {/* Calendar Preview */}
      {calendarDays.length > 0 && (
        <div className="w-full mt-6">
          <HarvestCalendar days={calendarDays} planDuration={planDuration} compact />
        </div>
      )}
    </div>
  );
};
