"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Package,
  CheckCircle2,
  Star,
  PartyPopper,
  Sparkles,
  Leaf,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────

interface HarvestNowFlowProps {
  predictedBags: number;
  planStartDate: string;  // ISO date string
  onComplete: (data: {
    actualDate: string;
    actualBags: number;
  }) => void;
  onBack: () => void;
}

// ─── Progress Dots ───────────────────────────────────────────────

const StepDots: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div className="flex items-center gap-1.5">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-1 rounded-full transition-all duration-300 ${
          i < current ? "bg-amber-500 w-6" : i === current ? "bg-amber-400 w-6" : "bg-slate-200 w-4"
        }`}
      />
    ))}
  </div>
);

// ─── Step 1: Actual Harvest Date ──────────────────────────────────

const StepHarvestDate: React.FC<{
  value: string;
  planStartDate: string;
  onChange: (v: string) => void;
  onNext: () => void;
}> = ({ value, planStartDate, onChange, onNext }) => {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 ring-2 ring-amber-100">
        <CalendarDays size={28} className="text-amber-600" />
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-1">
        When did you harvest?
      </h2>
      <p className="text-sm text-slate-500 mb-7 max-w-xs">
        Select the exact date you completed your harvest
      </p>

      {/* Date input */}
      <div className="w-full mb-4">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 text-left">
          Actual Harvest Date
        </label>
        <input
          type="date"
          min={planStartDate}
          max={today}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-4 rounded-2xl border-2 border-slate-200 text-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-white appearance-none"
        />
      </div>

      {/* Quick select shortcuts */}
      <div className="flex gap-2 w-full mb-8">
        {["Today", "Yesterday"].map((label) => {
          const d = new Date();
          if (label === "Yesterday") d.setDate(d.getDate() - 1);
          const iso = d.toISOString().split("T")[0];
          return (
            <button
              key={label}
              onClick={() => onChange(iso)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all active:scale-95 ${
                value === iso
                  ? "bg-amber-600 text-white border-amber-600 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-amber-300"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!value}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-semibold transition-all ${
          value
            ? "bg-amber-600 text-white shadow-lg shadow-amber-600/25 active:scale-[0.98]"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        Continue <ArrowRight size={18} />
      </button>
    </div>
  );
};

// ─── Step 2: Actual Bag Count ─────────────────────────────────────

const StepBagCount: React.FC<{
  value: number;
  predictedBags: number;
  onChange: (v: number) => void;
  onNext: () => void;
}> = ({ value, predictedBags, onChange, onNext }) => {
  const diff = value > 0 ? value - predictedBags : 0;
  const isOver = diff > 0;
  const isExact = diff === 0 && value > 0;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
        <Package size={28} className="text-emerald-600" />
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-1">
        How many bags did you produce?
      </h2>
      <p className="text-sm text-slate-500 mb-4 max-w-xs">
        Count all bags ready for sale
      </p>

      {/* Prediction reference */}
      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl mb-6">
        <Star size={13} className="text-slate-400" />
        <span className="text-xs text-slate-500">
          We predicted <strong className="text-slate-700">~{predictedBags} bags</strong> for your plan
        </span>
      </div>

      {/* Large number input */}
      <div className="w-full mb-4">
        <input
          type="number"
          min={0}
          max={9999}
          value={value || ""}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            if (!isNaN(v) && v >= 0 && v <= 9999) onChange(v);
          }}
          placeholder="0"
          className="w-full px-6 py-5 rounded-2xl border-2 border-slate-200 text-center text-5xl font-extrabold text-slate-900
                     focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all"
        />
        <p className="text-xs text-slate-400 mt-2">bags of salt</p>
      </div>

      {/* Comparison feedback */}
      {value > 0 && (
        <div className={`w-full rounded-xl p-3.5 mb-6 text-left text-sm font-semibold ${
          isExact
            ? "bg-compass-50 text-compass-700 border border-compass-100"
            : isOver
            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
            : "bg-amber-50 text-amber-700 border border-amber-100"
        }`}>
          {isExact && "🎯 Perfect — right on target!"}
          {isOver && `🎉 ${diff} more bags than predicted — great season!`}
          {!isExact && !isOver && value > 0 && `📉 ${Math.abs(diff)} fewer than predicted — noted for next season`}
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!value}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-semibold transition-all ${
          value
            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 active:scale-[0.98]"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        Submit Harvest <ArrowRight size={18} />
      </button>
    </div>
  );
};

// ─── Step 3: Thank You Page ───────────────────────────────────────

const StepThankYou: React.FC<{
  actualBags: number;
  predictedBags: number;
  actualDate: string;
  onDone: () => void;
}> = ({ actualBags, predictedBags, actualDate, onDone }) => {
  const diff = actualBags - predictedBags;
  const dateLabel = new Date(actualDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="flex flex-col items-center text-center">
      {/* Celebration icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-emerald-200/40 rounded-full blur-2xl scale-150" />
        <div className="relative w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center shadow-lg border-2 border-emerald-100">
          <PartyPopper size={36} className="text-emerald-600" />
        </div>
      </div>

      <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
        Harvest Recorded!
      </h2>
      <p className="text-sm text-slate-500 mb-6 max-w-xs">
        Your harvest has been successfully logged. Great job this season!
      </p>

      {/* Result cards */}
      <div className="w-full space-y-3 mb-7">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <CalendarDays size={20} className="text-amber-600" />
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-400 font-medium">Harvest Date</p>
              <p className="text-sm font-bold text-slate-900">{dateLabel}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl border p-4 flex items-center justify-between ${
          diff >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${diff >= 0 ? "bg-emerald-100" : "bg-amber-100"}`}>
              <Package size={20} className={diff >= 0 ? "text-emerald-600" : "text-amber-600"} />
            </div>
            <div className="text-left">
              <p className={`text-xs font-medium ${diff >= 0 ? "text-emerald-600" : "text-amber-600"}`}>Bags Produced</p>
              <p className="text-xl font-extrabold text-slate-900">{actualBags}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400">vs predicted</p>
            <p className={`text-sm font-bold ${diff >= 0 ? "text-emerald-600" : "text-amber-600"}`}>
              {diff >= 0 ? "+" : ""}{diff} bags
            </p>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="w-full bg-compass-50 border border-compass-100 rounded-2xl p-4 mb-8 text-left">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-compass-600" />
          <p className="text-xs font-bold text-compass-700 uppercase tracking-wide">PSS Insight</p>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {diff > 0
            ? `You exceeded the prediction by ${diff} bags. Our model will learn from your results to improve future recommendations.`
            : diff === 0
            ? "Your production matched the prediction exactly — excellent planning and execution!"
            : `You produced ${Math.abs(diff)} fewer bags than predicted. Weather and brine conditions may have been factors. We'll refine future forecasts.`
          }
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <Leaf size={11} className="text-compass-500" />
          <p className="text-[10px] text-compass-500 font-medium">Data saved to improve your next season</p>
        </div>
      </div>

      <button
        onClick={onDone}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-bold bg-compass-600 text-white shadow-xl shadow-compass-600/25 active:scale-[0.98] transition-all"
      >
        <CheckCircle2 size={20} />
        Back to Planner
      </button>
    </div>
  );
};

// ─── Main Flow ────────────────────────────────────────────────────

export const HarvestNowFlow: React.FC<HarvestNowFlowProps> = ({
  predictedBags,
  planStartDate,
  onComplete,
  onBack,
}) => {
  const TOTAL = 3;
  const [step, setStep] = useState(0);
  const [actualDate, setActualDate] = useState("");
  const [actualBags, setActualBags] = useState(0);

  const handleBack = () => {
    if (step === 0) onBack();
    else setStep((s) => s - 1);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] max-w-md mx-auto px-5 pt-4 pb-8">
      {/* Header (hidden on thank you page) */}
      {step < 2 && (
        <div className="flex items-center justify-between mb-6">
          <button onClick={handleBack} className="p-2 -ml-2 rounded-xl hover:bg-slate-100 active:scale-95 transition-all" aria-label="Go back">
            <ArrowLeft size={22} className="text-slate-700" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">{step + 1}/{TOTAL}</span>
            <StepDots current={step} total={TOTAL} />
          </div>
          <div className="w-10" />
        </div>
      )}

      <div
        className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-300"
        key={step}
      >
        {step === 0 && (
          <StepHarvestDate
            value={actualDate}
            planStartDate={planStartDate}
            onChange={setActualDate}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <StepBagCount
            value={actualBags}
            predictedBags={predictedBags}
            onChange={setActualBags}
            onNext={() => {
              onComplete({ actualDate, actualBags });
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <StepThankYou
            actualBags={actualBags}
            predictedBags={predictedBags}
            actualDate={actualDate}
            onDone={onBack}
          />
        )}
      </div>
    </div>
  );
};
