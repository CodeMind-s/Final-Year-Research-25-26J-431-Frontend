"use client";

import React, { useMemo, useState } from "react";
import {
  Sun,
  Cloud,
  CloudRain,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
} from "lucide-react";
import type {
  CalendarDay,
  WeatherType,
  DayCondition,
} from "@/sample-data/compass/mockCalendarData";

// ─── Config ──────────────────────────────────────────────────────

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const WEATHER_ICON: Record<WeatherType, { icon: React.ElementType; className: string }> = {
  sunny: { icon: Sun, className: "text-amber-500" },
  cloudy: { icon: Cloud, className: "text-slate-400" },
  rainy: { icon: CloudRain, className: "text-blue-500" },
};

const CONDITION_STYLES: Record<
  DayCondition,
  { bg: string; border: string; label: string; labelColor: string }
> = {
  ideal: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    label: "Ideal",
    labelColor: "text-emerald-700",
  },
  moderate: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "Moderate",
    labelColor: "text-amber-700",
  },
  poor: {
    bg: "bg-red-50",
    border: "border-red-200",
    label: "Poor",
    labelColor: "text-red-700",
  },
  rest: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    label: "Rest",
    labelColor: "text-slate-500",
  },
};

// ─── Types ───────────────────────────────────────────────────────

interface HarvestCalendarProps {
  days: CalendarDay[];
  planDuration: number;
  onContinuePlanning?: () => void;
  compact?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────
// (no helpers needed — calendar math is inline)

// ─── Component ───────────────────────────────────────────────────

export const HarvestCalendar: React.FC<HarvestCalendarProps> = ({
  days,
  planDuration,
  onContinuePlanning,
  compact = false,
}) => {
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  // Build lookup by date string for O(1) access
  const dayLookup = useMemo(() => {
    const map = new Map<string, CalendarDay>();
    for (const d of days) {
      map.set(d.date, d);
    }
    return map;
  }, [days]);

  // Start calendar on plan's first month
  const startDate = days.length > 0 ? new Date(days[0].date + "T00:00:00") : new Date();
  const [displayYear, setDisplayYear] = useState(startDate.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(startDate.getMonth()); // 0-indexed

  const monthLabel = new Date(displayYear, displayMonth, 1).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

  const goToPrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear((y) => y - 1);
    } else {
      setDisplayMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear((y) => y + 1);
    } else {
      setDisplayMonth((m) => m + 1);
    }
  };

  // Calendar grid
  const firstOfMonth = new Date(displayYear, displayMonth, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();

  type GridCell =
    | { type: "empty" }
    | { type: "locked"; day: number }
    | { type: "plan"; data: CalendarDay };

  const gridCells: GridCell[] = [];
  for (let i = 0; i < startOffset; i++) gridCells.push({ type: "empty" });
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${displayYear}-${String(displayMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const planDay = dayLookup.get(dateStr);
    if (planDay) {
      gridCells.push({ type: "plan", data: planDay });
    } else {
      gridCells.push({ type: "locked", day: d });
    }
  }
  while (gridCells.length % 7 !== 0) gridCells.push({ type: "empty" });

  return (
    <div className={`flex flex-col ${compact ? '' : 'min-h-[calc(100vh-8rem)]'}`}>
      <div className={`${compact ? 'pt-2 pb-4' : 'flex-1 px-4 pt-4 pb-6'} max-w-lg mx-auto w-full`}>
        {/* Month Header with free navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPrevMonth}
            className="p-2 rounded-xl transition-all active:scale-95 text-slate-700 hover:bg-slate-100"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="text-center">
            <h2 className="text-base font-bold text-slate-900">
              {monthLabel}
            </h2>
            <span className="text-[10px] text-slate-400 font-medium">
              {planDuration}-day plan
            </span>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 rounded-xl transition-all active:scale-95 text-slate-700 hover:bg-slate-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((wd) => (
            <div
              key={wd}
              className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-1"
            >
              {wd}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {gridCells.map((cell, i) => {
            // Empty padding (before 1st / after last of month)
            if (cell.type === "empty") {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            // Locked: day exists in month but not in the plan
            if (cell.type === "locked") {
              return (
                <div
                  key={`locked-${cell.day}`}
                  className="aspect-square rounded-lg flex flex-col items-center justify-center border border-dashed border-slate-200 bg-slate-50/50"
                >
                  <span className="text-xs font-medium text-slate-300 leading-none">
                    {cell.day}
                  </span>
                </div>
              );
            }

            // Plan day: interactive with color + weather
            const planDay = cell.data;
            const condStyle = CONDITION_STYLES[planDay.condition];
            const weatherCfg = WEATHER_ICON[planDay.weather];
            const WeatherIcon = weatherCfg.icon;
            const isSelected = selectedDay?.date === planDay.date;
            const isToday =
              planDay.date === new Date().toISOString().split("T")[0];

            return (
              <button
                key={planDay.date}
                onClick={() =>
                  setSelectedDay(isSelected ? null : planDay)
                }
                className={`
                  aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5
                  border transition-all duration-150 active:scale-95 relative
                  ${condStyle.bg} ${condStyle.border}
                  ${isSelected ? "ring-2 ring-compass-500 ring-offset-1 scale-105 shadow-md z-10" : ""}
                  ${isToday ? "ring-1 ring-compass-300" : ""}
                `}
              >
                {/* Day number */}
                <span
                  className={`text-xs font-bold leading-none ${
                    isSelected ? "text-compass-700" : "text-slate-700"
                  }`}
                >
                  {planDay.dayOfMonth}
                </span>

                {/* Weather icon */}
                <WeatherIcon size={12} className={weatherCfg.className} />
              </button>
            );
          })}
        </div>

        {/* Selected Day Detail */}
        {selectedDay && (
          <div className="mt-4 p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                    CONDITION_STYLES[selectedDay.condition].bg
                  } ${CONDITION_STYLES[selectedDay.condition].labelColor}`}
                >
                  {CONDITION_STYLES[selectedDay.condition].label}
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {new Date(selectedDay.date + "T00:00:00").toLocaleDateString(
                    "en-US",
                    { weekday: "short", month: "short", day: "numeric" }
                  )}
                </span>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1 rounded-lg hover:bg-slate-100 transition-all"
              >
                <X size={16} className="text-slate-400" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {(() => {
                const cfg = WEATHER_ICON[selectedDay.weather];
                const Icon = cfg.icon;
                return (
                  <div className="flex items-center gap-1.5">
                    <Icon size={16} className={cfg.className} />
                    <span className="text-xs text-slate-500 capitalize">
                      {selectedDay.weather}
                    </span>
                  </div>
                );
              })()}
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-600">
                {selectedDay.note}
              </span>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            {(["ideal", "moderate", "poor", "rest"] as DayCondition[]).map(
              (c) => (
                <div key={c} className="flex items-center gap-1">
                  <div
                    className={`w-3 h-3 rounded ${CONDITION_STYLES[c].bg} border ${CONDITION_STYLES[c].border}`}
                  />
                  <span className="text-[10px] text-slate-500 font-medium capitalize">
                    {c}
                  </span>
                </div>
              )
            )}
            <div className="w-px h-3 bg-slate-200 mx-1" />
            {(["sunny", "cloudy", "rainy"] as WeatherType[]).map((w) => {
              const cfg = WEATHER_ICON[w];
              const Icon = cfg.icon;
              return (
                <div key={w} className="flex items-center gap-1">
                  <Icon size={10} className={cfg.className} />
                  <span className="text-[10px] text-slate-500 capitalize">
                    {w}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom CTA — fixed to bottom-right */}
      {onContinuePlanning && (
        <div className="sticky bottom-20 lg:bottom-4 px-4 pb-4 flex justify-end">
          <button
            onClick={onContinuePlanning}
            className="flex items-center gap-2 bg-compass-600 hover:bg-compass-700 text-white font-semibold text-sm py-3 px-5 rounded-xl shadow-lg shadow-compass-600/25 transition-all active:scale-[0.98]"
          >
            Continue Planning
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
