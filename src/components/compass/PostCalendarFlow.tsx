"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  TrendingUp,
  Banknote,
  Users,
  CheckCircle2,
  Sparkles,
  Coffee,
  Wallet,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────

interface PostCalendarFlowProps {
  bedCount: number;
  duration: number;
  onComplete: (data: { workerCount: number }) => void;
  onBack: () => void;
}

// ─── Step Progress ───────────────────────────────────────────────

const StepDots: React.FC<{ current: number; total: number }> = ({
  current,
  total,
}) => (
  <div className="flex items-center gap-1.5">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-1 rounded-full transition-all duration-300 ${
          i < current
            ? "bg-compass-600 w-6"
            : i === current
              ? "bg-compass-400 w-6"
              : "bg-slate-200 w-4"
        }`}
      />
    ))}
  </div>
);

// ─── Screen 1: Insight Cards ─────────────────────────────────────
//
// UX reasoning:
//   These cards frame the financial opportunity BEFORE asking for input.
//   By showing predicted production, demand, and price first, the user
//   feels informed and motivated. This is the "show value first" pattern —
//   they see what they could earn before we ask them to invest (hire workers).
//   No raw numbers are shown as formulas; everything reads as a friendly fact.

const InsightCards: React.FC<{
  bedCount: number;
  duration: number;
  onNext: () => void;
}> = ({ bedCount, duration, onNext }) => {
  // "Invisible math" — derived values presented as friendly insights
  const productionPerBed = duration <= 30 ? 3 : duration <= 45 ? 5 : 7;
  const totalBags = bedCount * productionPerBed;
  const pricePerBag = 1550; // LKR — predicted selling price (will come from backend)
  const demandLevel = totalBags <= 20 ? "High" : totalBags <= 40 ? "Moderate" : "Strong";
  const demandNote =
    demandLevel === "High"
      ? "Buyers are actively looking — your salt will sell fast"
      : demandLevel === "Strong"
        ? "Plenty of demand — good season to sell in bulk"
        : "Steady market — plan your sales timing carefully";

  const insights = [
    {
      icon: Package,
      iconBg: "bg-violet-50 text-violet-600",
      title: "Predicted Production",
      value: `~${totalBags} bags`,
      note: `Based on ${bedCount} beds over ${duration} days`,
    },
    {
      icon: TrendingUp,
      iconBg: "bg-emerald-50 text-emerald-600",
      title: "Demand Forecast",
      value: demandLevel,
      note: demandNote,
    },
    {
      icon: Banknote,
      iconBg: "bg-amber-50 text-amber-600",
      title: "Price Per Bag",
      value: `~Rs. ${pricePerBag.toLocaleString()}`,
      note: "Current market estimate for your region",
    },
  ];

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-compass-50 rounded-2xl flex items-center justify-center mb-4">
        <Sparkles size={28} className="text-compass-600" />
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-2">
        Here's what we see for your season
      </h2>
      <p className="text-sm text-slate-500 mb-6 max-w-xs">
        Based on your plan, here are some helpful predictions
      </p>

      <div className="w-full space-y-3 mb-8">
        {insights.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconBg}`}
                >
                  <Icon size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 font-medium">
                    {item.title}
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {item.value}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed pl-[52px]">
                {item.note}
              </p>
            </div>
          );
        })}
      </div>

      <button
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 bg-compass-600 text-white font-semibold text-base py-3.5 rounded-xl shadow-lg shadow-compass-600/25 active:scale-[0.98] transition-all"
      >
        Continue
        <ArrowRight size={18} />
      </button>
    </div>
  );
};

// ─── Screen 2: Worker Count Input ────────────────────────────────
//
// UX reasoning:
//   Full-screen single question. The user has just seen encouraging
//   production/demand/price data, so they're primed to think about
//   execution. A single, large input with preset buttons makes this
//   feel effortless. Presets are common crew sizes for salt operations.
//   The question uses "planning to hire" not "how many employees" —
//   keeping it conversational and non-corporate.

const WorkerInput: React.FC<{
  value: number;
  onChange: (v: number) => void;
  onNext: () => void;
}> = ({ value, onChange, onNext }) => {
  const presets = [2, 3, 4, 5, 6, 8];

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center mb-4">
        <Users size={28} className="text-sky-600" />
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-2">
        How many workers are you planning to hire?
      </h2>
      <p className="text-sm text-slate-500 mb-8 max-w-xs">
        Include yourself if you'll be working on the beds
      </p>

      {/* Preset grid */}
      <div className="grid grid-cols-3 gap-3 w-full mb-6">
        {presets.map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`
              py-4 rounded-xl text-lg font-bold transition-all active:scale-95
              ${
                value === n
                  ? "bg-compass-600 text-white shadow-lg shadow-compass-600/25 ring-2 ring-compass-300"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-compass-300 hover:bg-compass-50"
              }
            `}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Custom input */}
      <div className="flex items-center gap-2 w-full mb-8">
        <span className="text-sm text-slate-500 whitespace-nowrap">
          Or enter:
        </span>
        <input
          type="number"
          min={1}
          max={30}
          value={value || ""}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            if (!isNaN(v) && v > 0 && v <= 30) onChange(v);
          }}
          placeholder="e.g. 10"
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-compass-400 focus:border-compass-400"
        />
      </div>

      <button
        onClick={onNext}
        disabled={!value}
        className={`
          w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-semibold transition-all
          ${
            value
              ? "bg-compass-600 text-white shadow-lg shadow-compass-600/25 active:scale-[0.98]"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }
        `}
      >
        See Cost Breakdown
        <ArrowRight size={18} />
      </button>
    </div>
  );
};

// ─── Screen 3: Expense Calculation ───────────────────────────────
//
// UX reasoning:
//   The expense screen uses large, scannable cards — not a table.
//   Each cost line is a visually distinct card so the user can parse
//   it at a glance. The total is a hero element at the bottom with
//   a colored background to draw the eye. All math stays invisible:
//   the user sees "Rs. 72,000" not "4 workers × Rs. 1,200/day × 15 days".
//   The "per day" rate and assumptions are shown as small footnotes
//   for transparency without cluttering the primary view.

const ExpenseScreen: React.FC<{
  bedCount: number;
  workerCount: number;
  duration: number;
  onFinish: () => void;
}> = ({ bedCount, workerCount, duration, onFinish }) => {
  // Invisible math
  const productionPerBed = duration <= 30 ? 3 : duration <= 45 ? 5 : 7;
  const totalBags = bedCount * productionPerBed;

  // Labour: workers are paid Rs. 500 per bag (carrying at end of season)
  const carryingCostPerBag = 500;
  const totalWages = totalBags * carryingCostPerBag;

  // Work days: workers only work 1–2 days at end of season
  const bagsPerWorkerPerDay = 50;
  const workDays = Math.max(1, Math.ceil(totalBags / (workerCount * bagsPerWorkerPerDay)));

  const refreshmentPerDay = 350; // LKR per worker per day
  const totalRefreshments = workerCount * refreshmentPerDay * workDays;

  const totalCost = totalWages + totalRefreshments;

  const expenses = [
    {
      icon: Users,
      iconBg: "bg-sky-50 text-sky-600",
      label: "Carrying Cost",
      amount: totalWages,
      detail: `~${totalBags} bags × Rs. ${carryingCostPerBag}/bag`,
    },
    {
      icon: Coffee,
      iconBg: "bg-orange-50 text-orange-600",
      label: "Refreshments",
      amount: totalRefreshments,
      detail: `Tea, meals & water for your crew`,
    },
  ];

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
        <Wallet size={28} className="text-emerald-600" />
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-2">
        Your estimated expenses
      </h2>
      <p className="text-sm text-slate-500 mb-6 max-w-xs">
        Here's a rough cost breakdown for your season
      </p>

      {/* Expense cards */}
      <div className="w-full space-y-3 mb-4">
        {expenses.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconBg}`}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.detail}
                    </p>
                  </div>
                </div>
                <p className="text-base font-bold text-slate-900 whitespace-nowrap ml-3">
                  Rs. {item.amount.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total — hero card */}
      <div className="w-full bg-compass-600 rounded-xl p-5 mb-8 shadow-lg shadow-compass-600/20">
        <p className="text-xs text-compass-200 font-medium uppercase tracking-wide mb-1">
          Estimated Total Cost
        </p>
        <p className="text-2xl font-extrabold text-white">
          Rs. {totalCost.toLocaleString()}
        </p>
        <p className="text-[11px] text-compass-200 mt-1">
          For a {duration}-day season with {workerCount} workers
        </p>
      </div>

      <button
        onClick={onFinish}
        className="w-full flex items-center justify-center gap-2 bg-compass-600 text-white font-semibold text-base py-3.5 rounded-xl shadow-lg shadow-compass-600/25 active:scale-[0.98] transition-all"
      >
        <CheckCircle2 size={18} />
        Finish Planning
      </button>

      <p className="text-[11px] text-slate-400 mt-3 text-center">
        Estimates based on average rates • Actual costs may vary
      </p>
    </div>
  );
};

// ─── Main Flow ───────────────────────────────────────────────────

export const PostCalendarFlow: React.FC<PostCalendarFlowProps> = ({
  bedCount,
  duration,
  onComplete,
  onBack,
}) => {
  const [step, setStep] = useState(0);
  const [workerCount, setWorkerCount] = useState(0);

  const totalSteps = 3;

  const handleBack = () => {
    if (step === 0) {
      onBack();
    } else {
      setStep((s) => s - 1);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] max-w-md mx-auto px-5 pt-4 pb-8">
      {/* Top bar: back + progress */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
          aria-label="Go back"
        >
          <ArrowLeft size={22} className="text-slate-700" />
        </button>
        <StepDots current={step} total={totalSteps} />
        <div className="w-10" />
      </div>

      {/* Step content */}
      <div
        className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-300"
        key={step}
      >
        {step === 0 && (
          <InsightCards
            bedCount={bedCount}
            duration={duration}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <WorkerInput
            value={workerCount}
            onChange={setWorkerCount}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <ExpenseScreen
            bedCount={bedCount}
            workerCount={workerCount}
            duration={duration}
            onFinish={() => onComplete({ workerCount })}
          />
        )}
      </div>
    </div>
  );
};
