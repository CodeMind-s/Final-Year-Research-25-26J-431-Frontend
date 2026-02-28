"use client";

import React from "react";
import {
  CalendarDays,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

interface PlannerEmptyStateProps {
  onCreatePlan: () => void;
}

const BENEFITS = [
  {
    icon: Sparkles,
    title: "Know the best time to harvest",
    description:
      "Get AI-powered suggestions on when your salt is ready to collect.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: TrendingUp,
    title: "Sell at the right price",
    description:
      "Plan your sales around market peaks so you earn more per ton.",
    color: "bg-sky-50 text-sky-600",
  },
  {
    icon: ShieldCheck,
    title: "Avoid weather surprises",
    description:
      "We'll warn you about upcoming rain so your harvest stays safe.",
    color: "bg-emerald-50 text-emerald-600",
  },
];

export const PlannerEmptyState: React.FC<PlannerEmptyStateProps> = ({
  onCreatePlan,
}) => {
  return (
    <div className="flex flex-col items-center px-5 pt-8 pb-12 max-w-md mx-auto">
      {/* Hero Illustration Area */}
      <div className="relative mb-6">
        {/* Background glow */}
        <div className="absolute inset-0 bg-compass-200/40 rounded-full blur-2xl scale-125" />
        {/* Icon container */}
        <div className="relative w-20 h-20 bg-compass-50 border-2 border-compass-200 rounded-2xl flex items-center justify-center shadow-sm">
          <CalendarDays size={36} className="text-compass-600" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold text-slate-900 text-center mb-2">
        Plan Your Harvest Season
      </h1>

      {/* Explanation — why planning matters (clear, non-technical) */}
      <p className="text-sm text-slate-500 text-center leading-relaxed mb-8 max-w-xs">
        A harvest plan helps you pick the right time to collect and sell your
        salt — so you lose less and earn more.
      </p>

      {/* Benefits — 3 cards stacked vertically */}
      <div className="w-full space-y-3 mb-8">
        {BENEFITS.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <div
              key={benefit.title}
              className="flex items-start gap-3 bg-white rounded-xl p-3.5 border border-slate-100 shadow-sm"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${benefit.color}`}
              >
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  {benefit.title}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                  {benefit.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary CTA */}
      <button
        onClick={onCreatePlan}
        className="w-full flex items-center justify-center gap-2 bg-compass-600 hover:bg-compass-700 text-white font-semibold text-base py-3.5 px-6 rounded-xl shadow-lg shadow-compass-600/25 transition-all active:scale-[0.98] hover:shadow-xl"
      >
        <CalendarDays size={20} />
        Create My Harvest Plan
        <ArrowRight size={18} className="ml-1" />
      </button>

      {/* Subtle reassurance */}
      <p className="text-[11px] text-slate-400 mt-3 text-center">
        Takes less than 2 minutes • You can change it anytime
      </p>
    </div>
  );
};
