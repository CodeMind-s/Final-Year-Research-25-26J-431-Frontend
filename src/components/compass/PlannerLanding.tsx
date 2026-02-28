"use client";

import React, { useState } from "react";
import {
  Plus,
  Scissors,
  CalendarDays,
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Clock,
  Grid3X3,
  Package,
  ChevronRight,
  AlertCircle,
  MapPin,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { HarvestCalendar } from "@/components/compass/HarvestCalendar";
import type { CalendarDay } from "@/sample-data/compass/mockCalendarData";

// ─── Types ───────────────────────────────────────────────────────

export interface PlanRecord {
  id: string;
  planType: string;
  date: string;
  duration: number;
  bedCount: number;
  workerCount?: number;
  status: "active" | "completed" | "cancelled";
  actualBags?: number;
  actualDate?: string;
}

interface PlannerLandingProps {
  activePlan: PlanRecord | null;
  planHistory: PlanRecord[];
  calendarDays: CalendarDay[];
  onCreatePlan: () => void;
  onHarvestNow: () => void;
  onDiscardPlan: () => void;
}

// ─── Weather helpers ──────────────────────────────────────────────

type WxKind = "sunny" | "cloudy" | "rainy" | "windy";

const WX_SEQ: WxKind[] = [
  "sunny","sunny","cloudy","rainy","sunny","windy","cloudy","sunny","sunny","rainy",
  "cloudy","sunny","windy","sunny","rainy","sunny","cloudy","sunny","sunny","windy",
  "rainy","sunny","cloudy","sunny","windy","sunny","sunny","rainy","cloudy","sunny",
  "sunny","cloudy","sunny","rainy","windy","sunny","cloudy","sunny","sunny","rainy",
  "windy","sunny","cloudy","sunny","sunny","rainy","sunny","cloudy","windy","sunny",
  "sunny","rainy","cloudy","sunny","windy","sunny","sunny","cloudy","rainy","sunny",
  "sunny","windy","sunny",
];
const TEMP_SEQ = [
  32,33,30,27,34,28,31,35,34,26,29,33,28,35,25,33,30,34,35,29,
  27,35,30,34,29,33,35,26,30,34,32,31,33,26,28,35,30,33,27,34,
  35,28,31,33,34,26,35,30,29,33,34,27,31,35,28,33,35,30,27,34,
  32,29,33,
];

function wxForDay(dayOffset: number): { kind: WxKind; temp: number } {
  const idx = Math.abs(dayOffset) % WX_SEQ.length;
  return { kind: WX_SEQ[idx], temp: TEMP_SEQ[idx] };
}

const WxIcon: React.FC<{ kind: WxKind; size?: number }> = ({ kind, size = 11 }) => {
  if (kind === "sunny") return <Sun size={size} className="text-amber-400" />;
  if (kind === "rainy") return <CloudRain size={size} className="text-sky-500" />;
  if (kind === "windy") return <Wind size={size} className="text-slate-400" />;
  return <Cloud size={size} className="text-slate-400" />;
};

const WX_BG: Record<WxKind, string> = {
  sunny: "bg-amber-50",
  cloudy: "bg-slate-50",
  rainy: "bg-sky-50",
  windy: "bg-slate-50",
};
const WX_BORDER: Record<WxKind, string> = {
  sunny: "border-amber-100",
  cloudy: "border-slate-100",
  rainy: "border-sky-100",
  windy: "border-slate-100",
};

// ─── Single month grid (forecast only — no past) ─────────────────

const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const ForecastMonthGrid: React.FC<{
  year: number;
  month: number;
  today: Date;
}> = ({ year, month, today }) => {
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDOW = firstOfMonth.getDay();
  const monthLabel = firstOfMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDOW; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <MapPin size={11} className="text-compass-500" />
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">{monthLabel}</p>
      </div>
      <div className="grid grid-cols-7 mb-0.5">
        {DAY_HEADERS.map((h) => (
          <div key={h} className="text-center text-[9px] font-bold text-slate-400 uppercase py-1">{h}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const cellDate = new Date(year, month, day);
          cellDate.setHours(0, 0, 0, 0);
          const dayOffset = Math.floor((cellDate.getTime() - today.getTime()) / 86_400_000);
          const isPast = dayOffset < 0;
          const isToday = dayOffset === 0;
          const wx = wxForDay(dayOffset);

          return (
            <div
              key={day}
              className={`flex flex-col items-center rounded-lg py-1.5 border transition-all ${
                isToday
                  ? "bg-compass-600 border-compass-500 shadow-sm"
                  : isPast
                  ? "invisible"          // hide past days completely
                  : `${WX_BG[wx.kind]} ${WX_BORDER[wx.kind]}`
              }`}
            >
              {!isPast && (
                <>
                  <WxIcon kind={wx.kind} size={isToday ? 12 : 11} />
                  <span className={`text-[9px] font-bold mt-0.5 leading-none ${isToday ? "text-white" : "text-slate-700"}`}>
                    {day}
                  </span>
                  <span className={`text-[7px] leading-none mt-0.5 ${isToday ? "text-white/70" : "text-slate-500"}`}>
                    {wx.temp}°
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── 2-Month Scrollable Forecast Calendar ─────────────────────────

const WeatherForecastCalendar: React.FC = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const next = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const months = [
    { year: today.getFullYear(), month: today.getMonth() },
    { year: next.getFullYear(), month: next.getMonth() },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-900">Weather Forecast</h2>
        <span className="text-[10px] font-semibold text-sky-500 uppercase tracking-wide">Next 2 months</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3">
        <div className="max-h-[440px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
          {months.map(({ year, month }) => (
            <ForecastMonthGrid
              key={`${year}-${month}`}
              year={year}
              month={month}
              today={today}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-slate-100 mt-1">
          {[
            { icon: <Sun size={10} className="text-amber-400" />, label: "Sunny" },
            { icon: <Cloud size={10} className="text-slate-400" />, label: "Cloudy" },
            { icon: <CloudRain size={10} className="text-sky-500" />, label: "Rain" },
            { icon: <Wind size={10} className="text-slate-400" />, label: "Windy" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1">
              {l.icon}
              <span className="text-[9px] text-slate-400">{l.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1 ml-auto">
            <div className="w-3 h-3 rounded-sm bg-compass-600" />
            <span className="text-[9px] text-slate-400">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Plan History Card ────────────────────────────────────────────

const PlanHistoryCard: React.FC<{ record: PlanRecord }> = ({ record }) => {
  const startDate = new Date(record.date + "T00:00:00");
  const fmtDate = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const statusStyle = record.status === "active"
    ? "bg-emerald-100 text-emerald-700"
    : record.status === "completed"
    ? "bg-slate-100 text-slate-600"
    : "bg-red-100 text-red-600";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
      <div className="w-10 h-10 bg-compass-50 rounded-xl flex items-center justify-center flex-shrink-0">
        <CalendarDays size={20} className="text-compass-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {record.planType === "fresher" ? "Fresh Start" : "Mid-Season"} · {record.duration}d
          </p>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${statusStyle}`}>
            {record.status}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{fmtDate} · {record.bedCount} beds</p>
        {record.actualBags !== undefined && (
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">✓ {record.actualBags} bags harvested</p>
        )}
      </div>
      <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────

export const PlannerLanding: React.FC<PlannerLandingProps> = ({
  activePlan,
  planHistory,
  calendarDays,
  onCreatePlan,
  onHarvestNow,
  onDiscardPlan,
}) => {
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const startDate = activePlan ? new Date(activePlan.date + "T00:00:00") : null;
  const endDate = activePlan && startDate
    ? new Date(startDate.getTime() + (activePlan.duration - 1) * 86_400_000)
    : null;

  const fmtShort = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="flex flex-col px-4 pt-5 pb-32 max-w-lg mx-auto w-full">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Planner</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activePlan ? "Active plan in progress" : "No active plan"}
          </p>
        </div>
        {!activePlan && (
          <button
            onClick={onCreatePlan}
            className="flex items-center gap-1.5 bg-compass-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-compass-600/25 hover:bg-compass-700 active:scale-95 transition-all"
          >
            <Plus size={14} />
            New Plan
          </button>
        )}
      </div>

      {/* ── ACTIVE PLAN ── */}
      {activePlan ? (
        <>
          {/* Active plan summary strip */}
          <div className="bg-compass-600 rounded-2xl p-4 mb-4 shadow-lg shadow-compass-600/20">
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-wide mb-1">Active Plan</p>
            <h2 className="text-base font-bold text-white mb-3">
              {activePlan.planType === "fresher" ? "Starting Fresh" : "Mid-Season"} · {activePlan.duration}-Day Plan
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { icon: <Grid3X3 size={12} className="text-white/70" />, label: `${activePlan.bedCount} beds` },
                { icon: <Clock size={12} className="text-white/70" />, label: startDate ? fmtShort(startDate) : "—" },
                { icon: <CalendarDays size={12} className="text-white/70" />, label: endDate ? fmtShort(endDate) : "—" },
                ...(activePlan.workerCount ? [{ icon: <Package size={12} className="text-white/70" />, label: `${activePlan.workerCount} workers` }] : []),
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1">
                  {item.icon}
                  <span className="text-[11px] text-white/80 font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Harvest Now + Discard row */}
          <div className="flex gap-2 mb-5">
            <button
              onClick={onHarvestNow}
              className="flex-1 flex items-center gap-2 bg-amber-50 border-2 border-amber-200 hover:border-amber-400 rounded-2xl p-4 transition-all active:scale-[0.98] group"
            >
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors">
                <Scissors size={20} className="text-amber-600" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm font-bold text-slate-900">Harvest Now</p>
                <p className="text-[10px] text-slate-500 leading-snug">Record actual results</p>
              </div>
            </button>

            <button
              onClick={() => setConfirmDiscard(true)}
              className="flex flex-col items-center justify-center gap-1.5 bg-red-50 border-2 border-red-100 hover:border-red-300 rounded-2xl px-4 transition-all active:scale-[0.98]"
            >
              <Trash2 size={18} className="text-red-500" />
              <span className="text-[10px] font-bold text-red-500 whitespace-nowrap">Discard</span>
            </button>
          </div>

          {/* Inline discard confirmation */}
          {confirmDiscard && (
            <div className="mb-5 bg-red-50 border-2 border-red-200 rounded-2xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-800">Discard this plan?</p>
                  <p className="text-xs text-red-600 mt-0.5">This will permanently remove your current plan. This cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDiscard(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setConfirmDiscard(false); onDiscardPlan(); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white shadow-md shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all"
                >
                  Yes, Discard
                </button>
              </div>
            </div>
          )}

          {/* Plan Calendar — only shown when plan exists */}
          {calendarDays.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Plan Calendar</h2>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <HarvestCalendar
                  days={calendarDays}
                  planDuration={activePlan.duration}
                  compact
                />
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* No plan — create CTA */}
          <div
            onClick={onCreatePlan}
            className="flex items-center gap-4 bg-white rounded-2xl border-2 border-dashed border-compass-200 p-5 mb-6 cursor-pointer hover:border-compass-400 hover:bg-compass-50 active:scale-[0.99] transition-all"
          >
            <div className="w-12 h-12 bg-compass-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Plus size={24} className="text-compass-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Create a Harvest Plan</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Start planning your salt harvest season with AI-powered guidance
              </p>
            </div>
          </div>

          {/* Weather forecast — only shown when no active plan */}
          <WeatherForecastCalendar />
        </>
      )}

      {/* ── Plan History (always shown) ── */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-3">Plan History</h2>
        {planHistory.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-5 text-center">
            <CalendarDays size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-400">No past plans yet</p>
            <p className="text-xs text-slate-400 mt-0.5">Your completed plans will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {planHistory.map((r) => <PlanHistoryCard key={r.id} record={r} />)}
          </div>
        )}
      </div>
    </div>
  );
};
