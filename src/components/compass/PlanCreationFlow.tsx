"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Grid3X3,
  Sprout,
  CalendarDays,
  Sparkles,
  TrendingUp,
  Sun,
  Cloud,
  CloudRain,
  Wind,
  X,
  Droplets,
  Thermometer,
  Waves,
  RotateCcw,
  MapPin,
  Users,
  Star,
  BadgeCheck,
  Package,
  Wallet,
  BarChart2,
  ClipboardList,
  Banknote,
  Loader2,
  Clock,
} from "lucide-react";
import { harvestPlanController } from "@/services/plan.controller";
import { crystallizationController } from "@/services/crystallization.controller";
import { WeatherForecastDay } from "@/types/crystallization.types";
import { tokenStorage } from "@/lib/storage.utils";
import { useToast } from "@/hooks/use-toast";
import { aiController } from "@/services/gemini.controller";
import { PlanCreateHintResponse } from "@/types/gemini.types";

// ─── Types ───────────────────────────────────────────────────────
type PlanType = "FRESHER" | "MIDLEVEL";
type Duration = 30 | 45;

interface PlanData {
  bedCount: number;
  planType: PlanType | null;
  date: string;
  duration: Duration | null;
  workerCount: number;
}

interface PlanCreationFlowProps {
  onComplete: (plan: PlanData) => void;
  onBack: () => void;
}

// ─── Step Indicator ───────────────────────────────────────────────
const StepIndicator: React.FC<{ current: number; total: number }> = ({
  current,
  total,
}) => (
  <div className="flex items-center gap-1.5">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-1 rounded-full transition-all duration-300 ${
          i < current
            ? "bg-compass-600 w-5"
            : i === current
              ? "bg-compass-400 w-5"
              : "bg-slate-200 w-3"
        }`}
      />
    ))}
  </div>
);

// ─── Constants ───────────────────────────────────────────────────
const PRICE_PER_BAG = 1550;
const CARRYING_COST_PER_BAG = 500;
const REFRESHMENT_PER_DAY = 350;
const BAGS_PER_WORKER_PER_DAY = 50;

// ─── Shared profit computation ────────────────────────────────────
function computeProfit(
  bedCount: number,
  duration: number,
  workerCount: number,
) {
  const productionPerBed = duration <= 30 ? 3 : 5;
  const totalBags = bedCount * productionPerBed;
  const totalWages = totalBags * CARRYING_COST_PER_BAG;
  const workDays = Math.max(
    1,
    Math.ceil(totalBags / (workerCount * BAGS_PER_WORKER_PER_DAY)),
  );
  const totalRefreshments = workerCount * REFRESHMENT_PER_DAY * workDays;
  const totalExpenses = totalWages + totalRefreshments;
  const revenue = totalBags * PRICE_PER_BAG;
  return {
    profit: revenue - totalExpenses,
    revenue,
    totalExpenses,
    totalBags,
    workDays,
    totalWages,
    totalRefreshments,
  };
}

// Suggested workers = bags to carry in at most 2 working days
function suggestedWorkerCount(totalBags: number) {
  return Math.max(2, Math.ceil(totalBags / (BAGS_PER_WORKER_PER_DAY * 2)));
}

// ─── Profit Banner ────────────────────────────────────────────────
const ProfitBanner: React.FC<{
  bedCount: number;
  duration: number;
  workerCount: number;
  label?: string;
}> = ({ bedCount, duration, workerCount, label }) => {
  const t = useTranslations("compass");
  const data = useMemo(
    () => computeProfit(bedCount, duration, workerCount),
    [bedCount, duration, workerCount],
  );
  const pos = data.profit >= 0;
  return (
    <div
      className={`rounded-2xl p-4 mb-4 shadow-lg transition-colors duration-300 ${
        pos
          ? "bg-emerald-600 shadow-emerald-600/20"
          : "bg-red-600 shadow-red-600/20"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp size={13} className="text-white/70" />
        <p className="text-[11px] text-white/70 font-semibold uppercase tracking-wide">
          {label ?? t("creation.predictedProfit")}
        </p>
      </div>
      <p className="text-2xl font-extrabold text-white leading-tight">
        Rs. {data.profit.toLocaleString()}
      </p>
      <p className="text-[11px] text-white/60 mt-0.5">
        {t("creation.bagsRevenueCosts", {
          bags: data.totalBags,
          revenue: data.revenue.toLocaleString(),
          costs: data.totalExpenses.toLocaleString(),
        })}
      </p>
    </div>
  );
};

// ─── Weather helpers ─────────────────────────────────────────────
type WeatherKind = "sunny" | "cloudy" | "rainy" | "windy";
interface DayWeather {
  kind: WeatherKind;
  temp: number;
  rainfall: number;
  salinity: number;
}
type Phase = "prep" | "growth" | "harvest-ready";

// Convert OpenWeather icon code to our weather kind
function getWeatherKindFromIcon(iconCode: string): WeatherKind {
  const code = iconCode.replace(/[dn]$/, ""); // Remove day/night suffix
  switch (code) {
    case "01": // clear sky
      return "sunny";
    case "02": // few clouds
    case "03": // scattered clouds
    case "04": // broken clouds
      return "cloudy";
    case "09": // shower rain
    case "10": // rain
    case "11": // thunderstorm
      return "rainy";
    case "50": // mist/fog
      return "windy";
    default:
      return "cloudy";
  }
}

// Convert Kelvin to Celsius
function kelvinToCelsius(kelvin: number): number {
  return Math.round(kelvin - 273.15);
}

function rainfallForKind(kind: WeatherKind, seed: number): number {
  if (kind === "rainy") return 12 + (seed % 25);
  if (kind === "cloudy") return 1 + (seed % 5);
  if (kind === "windy") return 2 + (seed % 7);
  return seed % 2 === 0 ? 0 : 1;
}

function salinityForPhase(phase: Phase | null, seed: number): number {
  const base = phase === "prep" ? 80 : phase === "growth" ? 140 : 260;
  return base + (seed % 30);
}

// Get weather data for a specific date from API data (only for next 16 days)
function getDayWeather(
  date: Date,
  phase: Phase | null,
  weatherDataMap: Map<string, WeatherForecastDay>,
): DayWeather | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOffset = Math.floor((date.getTime() - today.getTime()) / 86_400_000);

  // Only return weather data for next 16 days
  if (dayOffset < 0 || dayOffset >= 16) {
    return null;
  }

  const dateStr = date.toISOString().split("T")[0];
  const weatherDay = weatherDataMap.get(dateStr);

  if (weatherDay) {
    const kind = getWeatherKindFromIcon(weatherDay.weather[0]?.icon || "01d");
    const temp = kelvinToCelsius(weatherDay.temp.day);
    const rainfall = weatherDay.rain || 0;
    const salinity = salinityForPhase(phase, date.getDate());
    return { kind, temp, rainfall, salinity };
  }

  // Return null if no weather data available (beyond forecast)
  return null;
}

const WeatherIcon: React.FC<{ kind: WeatherKind; size?: number }> = ({
  kind,
  size = 10,
}) => {
  if (kind === "sunny") return <Sun size={size} className="text-amber-400" />;
  if (kind === "rainy")
    return <CloudRain size={size} className="text-sky-500" />;
  if (kind === "windy") return <Wind size={size} className="text-slate-400" />;
  return <Cloud size={size} className="text-slate-400" />;
};

interface PhaseStyle {
  bg: string;
  text: string;
  dot: string;
  labelKey: string;
  labelBg: string;
  labelText: string;
}
const PHASE_STYLE: Record<Phase, PhaseStyle> = {
  prep: {
    bg: "bg-amber-50",
    text: "text-amber-900",
    dot: "bg-amber-400",
    labelKey: "creation.preparation",
    labelBg: "bg-amber-100",
    labelText: "text-amber-700",
  },
  growth: {
    bg: "bg-emerald-50",
    text: "text-emerald-900",
    dot: "bg-emerald-500",
    labelKey: "creation.growth",
    labelBg: "bg-emerald-100",
    labelText: "text-emerald-700",
  },
  "harvest-ready": {
    bg: "bg-teal-50",
    text: "text-teal-900",
    dot: "bg-teal-500",
    labelKey: "creation.harvestReady",
    labelBg: "bg-teal-100",
    labelText: "text-teal-700",
  },
};

function getPhase(dayIndex: number, duration: number): Phase {
  const pct = dayIndex / Math.max(duration - 1, 1);
  if (pct < 0.2) return "prep";
  if (pct < 0.75) return "growth";
  return "harvest-ready";
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function dayDiff(from: Date, to: Date) {
  return Math.floor((to.getTime() - from.getTime()) / 86_400_000);
}
function fmtLong(d: Date) {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function fmtShort(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Date Detail Bottom Sheet ─────────────────────────────────────
const DateDetailSheet: React.FC<{
  date: Date;
  phase: Phase | null;
  weather: DayWeather;
  isStart: boolean;
  isEnd: boolean;
  isLoading: boolean;
  onSetStart: () => void;
  onSetEnd: () => void;
  onClose: () => void;
}> = ({
  date,
  phase,
  weather,
  isStart,
  isEnd,
  isLoading,
  onSetStart,
  onSetEnd,
  onClose,
}) => {
  const t = useTranslations("compass");
  const labels: Record<WeatherKind, string> = {
    sunny: t("weather.sunnyAndClear"),
    cloudy: t("weather.partlyCloudy"),
    rainy: t("weather.rainy"),
    windy: t("weather.windy"),
  };
  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 duration-300">
        <div className="max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl px-5 pt-4 pb-8">
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                {t("creation.selectedDate")}
              </p>
              <h3 className="text-lg font-bold text-slate-900">
                {fmtLong(date)}
              </h3>
              {phase && (
                <span
                  className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${PHASE_STYLE[phase].labelBg} ${PHASE_STYLE[phase].labelText} uppercase tracking-wide`}
                >
                  {t(PHASE_STYLE[phase].labelKey)} {t("creation.phase")}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100"
            >
              <X size={18} className="text-slate-500" />
            </button>
          </div>
          <div className="flex items-center gap-2 mb-5 bg-slate-50 rounded-xl px-3 py-2.5">
            <WeatherIcon kind={weather.kind} size={18} />
            <span className="text-sm font-semibold text-slate-700">
              {labels[weather.kind]}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              {
                icon: <Thermometer size={18} className="text-rose-500" />,
                label: t("creation.temperature"),
                value: `${weather.temp}°C`,
                bg: "bg-rose-50",
              },
              {
                icon: <Droplets size={18} className="text-sky-500" />,
                label: t("creation.rainfall"),
                value: `${weather.rainfall} mm`,
                bg: "bg-sky-50",
              },
              {
                icon: <Waves size={18} className="text-teal-500" />,
                label: t("creation.salinity"),
                value: phase ? `${weather.salinity} g/L` : "—",
                bg: "bg-teal-50",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`${s.bg} rounded-xl p-3 flex flex-col items-center text-center`}
              >
                {s.icon}
                <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wide mt-1.5 mb-0.5">
                  {s.label}
                </p>
                <p className="text-sm font-bold text-slate-900">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2.5">
            <button
              onClick={() => {
                onSetStart();
              }}
              disabled={isStart || isLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${isStart ? "bg-compass-100 text-compass-700 border-2 border-compass-300 cursor-default" : isLoading ? "bg-compass-400 text-white cursor-not-allowed" : "bg-compass-600 text-white shadow-md shadow-compass-600/20 hover:bg-compass-700"}`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {t("creation.loading")}
                </>
              ) : isStart ? (
                <>
                  <CheckCircle2 size={15} />
                  {t("creation.alreadyStartDate")}
                </>
              ) : (
                <>
                  <CalendarDays size={15} />
                  {t("creation.setAsStartDate")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Month Grid ───────────────────────────────────────────────────
const MonthGrid: React.FC<{
  year: number;
  month: number;
  startDate: Date;
  endDate: Date;
  onDateClick: (d: Date) => void;
  t: ReturnType<typeof useTranslations>;
  weatherData: Map<string, WeatherForecastDay>;
}> = ({ year, month, startDate, endDate, onDateClick, t, weatherData }) => {
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDOW = firstOfMonth.getDay();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDOW; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const today = new Date();
  const duration = dayDiff(startDate, endDate) + 1;
  const monthLabel = firstOfMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <MapPin size={11} className="text-compass-500" />
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
          {monthLabel}
        </p>
      </div>
      <div className="grid grid-cols-7 mb-0.5">
        {DAY_HEADERS.map((h) => (
          <div
            key={h}
            className="text-center text-[10px] font-bold text-slate-400 uppercase py-1"
          >
            {h}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 gap-x-0.5">
        {cells.map((date, idx) => {
          if (!date) return <div key={`e-${idx}`} />;
          const diff = dayDiff(startDate, date);
          const inRange = diff >= 0 && diff < duration;
          const isStart = isSameDay(date, startDate);
          const isEnd = isSameDay(date, endDate);
          const isToday = isSameDay(date, today);
          const phase: Phase | null = inRange ? getPhase(diff, duration) : null;
          const wx = inRange ? getDayWeather(date, phase, weatherData) : null;
          const style = phase ? PHASE_STYLE[phase] : null;
          const roundL = isStart || date.getDay() === 0;
          const roundR = isEnd || date.getDay() === 6;
          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateClick(date)}
              className={`relative flex flex-col items-center py-1 min-h-[52px] transition-all active:brightness-95 ${inRange && style ? style.bg : ""} ${roundL && inRange ? "rounded-l-lg" : ""} ${roundR && inRange ? "rounded-r-lg" : ""} ${isStart ? "ring-2 ring-compass-400 ring-inset z-10" : ""} ${isEnd ? "ring-2 ring-emerald-400 ring-inset z-10" : ""}`}
            >
              {wx ? (
                <div className="flex flex-col items-center leading-none mb-0.5">
                  <WeatherIcon kind={wx.kind} size={11} />
                  <span className="text-[9px] text-slate-500 font-medium mt-px leading-none">
                    {wx.temp}°
                  </span>
                </div>
              ) : (
                <div className="h-[18px]" />
              )}
              <span
                className={`text-xs font-bold leading-none ${inRange && style ? style.text : "text-slate-400"} ${isToday ? "underline underline-offset-2" : ""}`}
              >
                {date.getDate()}
              </span>
              {inRange && phase && (
                <span
                  className={`w-1 h-1 rounded-full mt-0.5 ${PHASE_STYLE[phase].dot}`}
                />
              )}
              {isStart && (
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[7px] font-extrabold text-compass-700 bg-compass-100 px-1 py-px rounded whitespace-nowrap z-10">
                  {t("creation.start")}
                </span>
              )}
              {isEnd && (
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[7px] font-extrabold text-emerald-700 bg-emerald-100 px-1 py-px rounded whitespace-nowrap z-10">
                  {t("creation.end")}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const MultiMonthCalendar: React.FC<{
  startDate: Date;
  endDate: Date;
  onDateClick: (d: Date) => void;
  weatherData: Map<string, WeatherForecastDay>;
}> = ({ startDate, endDate, onDateClick, weatherData }) => {
  const t = useTranslations("compass");
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const months = useMemo(() => {
    const arr: { year: number; month: number; id: string }[] = [];
    for (let offset = -6; offset <= 6; offset++) {
      const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
      arr.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        id: `${d.getFullYear()}-${d.getMonth()}`,
      });
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current.querySelector(
      `[data-month-id="month-${today.getFullYear()}-${today.getMonth()}"]`,
    );
    if (el)
      (el as HTMLElement).scrollIntoView({ block: "start", behavior: "auto" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div>
      <div
        ref={scrollRef}
        className="max-h-[400px] overflow-y-auto pr-1"
        style={{ scrollbarWidth: "thin" }}
      >
        {months.map(({ year, month, id }) => (
          <div key={id} data-month-id={`month-${id}`}>
            <MonthGrid
              year={year}
              month={month}
              startDate={startDate}
              endDate={endDate}
              onDateClick={onDateClick}
              t={t}
              weatherData={weatherData}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { color: "bg-amber-200", labelKey: "creation.preparation" },
            { color: "bg-emerald-200", labelKey: "creation.growth" },
            { color: "bg-teal-200", labelKey: "creation.harvestReady" },
          ].map((l) => (
            <div key={l.labelKey} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm ${l.color}`} />
              <span className="text-[10px] text-slate-500 font-medium">
                {t(l.labelKey)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Step 1: Plan Type ────────────────────────────────────────────
const StepPlanType: React.FC<{
  value: PlanType | null;
  onChange: (v: PlanType) => void;
  onNext: () => void;
}> = ({ value, onChange, onNext }) => {
  const t = useTranslations("compass");
  const options = [
    {
      id: "FRESHER" as PlanType,
      icon: Sprout,
      title: t("creation.startingFresh"),
      description: t("creation.startingFreshDesc"),
      tag: t("creation.fresher"),
      tagColor: "bg-emerald-100 text-emerald-700",
    },
    {
      id: "MIDLEVEL" as PlanType,
      icon: CalendarDays,
      title: t("creation.midSeasonPlanning"),
      description: t("creation.midSeasonDesc"),
      tag: t("creation.midSeasonTag"),
      tagColor: "bg-sky-100 text-sky-700",
    },
  ];
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
        <Sparkles size={28} className="text-emerald-600" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">
        {t("creation.whereInSeason")}
      </h2>
      <p className="text-sm text-slate-500 mb-7 max-w-xs">
        {t("creation.tailorPlan")}
      </p>
      <div className="w-full space-y-3 mb-8">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSel = value === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`w-full flex items-start gap-4 p-4 rounded-2xl text-left transition-all active:scale-[0.98] ${isSel ? "bg-compass-50 border-2 border-compass-500 shadow-md" : "bg-white border-2 border-slate-100 hover:border-compass-200 shadow-sm"}`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${isSel ? "bg-compass-600 text-white" : "bg-slate-100 text-slate-500"}`}
              >
                <Icon size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p
                    className={`text-base font-semibold ${isSel ? "text-compass-800" : "text-slate-900"}`}
                  >
                    {opt.title}
                  </p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${opt.tagColor}`}
                  >
                    {opt.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {opt.description}
                </p>
              </div>
              {isSel && (
                <CheckCircle2
                  size={20}
                  className="text-compass-600 flex-shrink-0 mt-1"
                />
              )}
            </button>
          );
        })}
      </div>
      <button
        onClick={onNext}
        disabled={!value}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-semibold transition-all ${value ? "bg-compass-600 text-white shadow-lg shadow-compass-600/25 active:scale-[0.98]" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
      >
        {t("creation.continue")} <ArrowRight size={18} />
      </button>
    </div>
  );
};

// ─── Step 2: Bed Count ────────────────────────────────────────────
const StepBedCount: React.FC<{
  value: number;
  onChange: (v: number) => void;
  onNext: () => void;
}> = ({ value, onChange, onNext }) => {
  const t = useTranslations("compass");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const presets = [5, 10, 15, 20, 25, 30];

  const handleContinue = async () => {
    if (!value) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = {
        start_date: new Date().toISOString().split("T")[0],
        forecast_days: 60,
        num_salt_beds: value,
        latitude: 8.061542,
        longitude: 79.814714,
      };
      
      await crystallizationController.getCrystallizationPredictions(data);
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch predictions");
      console.error("Error fetching predictions:", err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
        <Grid3X3 size={28} className="text-amber-600" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">
        {t("creation.howManyBeds")}
      </h2>
      <p className="text-sm text-slate-500 mb-8 max-w-xs">
        {t("creation.selectBeds")}
      </p>
      <div className="grid grid-cols-3 gap-3 w-full mb-6">
        {presets.map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`py-4 rounded-xl text-lg font-bold transition-all active:scale-95 ${value === n ? "bg-compass-600 text-white shadow-lg shadow-compass-600/25 ring-2 ring-compass-300" : "bg-white text-slate-700 border border-slate-200 hover:border-compass-300 hover:bg-compass-50"}`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 w-full mb-4">
        <span className="text-sm text-slate-500 whitespace-nowrap">
          {t("creation.orEnter")}
        </span>
        <input
          type="number"
          min={1}
          max={50}
          value={value || ""}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            if (!isNaN(v) && v > 0 && v <= 50) onChange(v);
          }}
          placeholder="e.g. 15"
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-compass-400 focus:border-compass-400"
        />
      </div>
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      <button
        onClick={handleContinue}
        disabled={!value || isLoading}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-semibold transition-all ${!value || isLoading ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-compass-600 text-white shadow-lg shadow-compass-600/25 active:scale-[0.98]"}`}
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {t("creation.loading")}
          </>
        ) : (
          <>
            {t("creation.continue")} <ArrowRight size={18} />
          </>
        )}
      </button>
    </div>
  );
};

// ─── Step 3: Duration + Interactive Calendar ──────────────────────
const StepDurationCalendar: React.FC<{
  bedCount: number;
  planType: PlanType;
  duration: Duration;
  onDurationChange: (d: Duration) => void;
  onNext: (startDate: Date, endDate: Date) => void;
  weatherData: Map<string, WeatherForecastDay>;
  planHint: PlanCreateHintResponse | null;
  hintLoading: boolean;
}> = ({
  bedCount,
  planType,
  duration,
  onDurationChange,
  onNext,
  weatherData,
  planHint,
  hintLoading,
}) => {
  const t = useTranslations("compass");
  const locale = useLocale() as 'en' | 'si' | 'ta';
  const today = new Date();
  const [isLoading, setIsLoading] = useState(false);
  today.setHours(0, 0, 0, 0);
  
  // Debug hint changes
  useEffect(() => {
    console.log('[StepDurationCalendar] planHint changed:', planHint);
    console.log('[StepDurationCalendar] hintLoading:', hintLoading);
  }, [planHint, hintLoading]);
  
  const suggestedStart = useMemo(() => {
    console.log('[StepDurationCalendar] Computing suggestedStart, planHint:', planHint);
    // Use hint start date if available
    if (planHint?.startdate) {
      const hintDate = new Date(planHint.startdate + 'T00:00:00');
      console.log('[StepDurationCalendar] Using hint start date:', hintDate);
      return hintDate;
    }
    const d = new Date(today);
    if (planType === "MIDLEVEL") d.setDate(d.getDate() + 3);
    console.log('[StepDurationCalendar] Using fallback start date:', d);
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planType, planHint]);
  const suggestedEnd = useMemo(() => {
    const d = new Date(suggestedStart);
    // Use hint duration if available
    const effectiveDuration = planHint?.plandays || duration;
    console.log('[StepDurationCalendar] Computing suggestedEnd, using duration:', effectiveDuration);
    d.setDate(d.getDate() + effectiveDuration - 1);
    console.log('[StepDurationCalendar] Suggested end date:', d);
    return d;
  }, [suggestedStart, duration, planHint]);

  const [customStart, setCustomStart] = useState<Date | null>(null);
  const [customEnd, setCustomEnd] = useState<Date | null>(null);
  const activeStart = customStart ?? suggestedStart;
  const activeEnd = customEnd ?? suggestedEnd;
  const isCustomised = customStart !== null || customEnd !== null;
  const activeDuration = dayDiff(activeStart, activeEnd) + 1;
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Debug active dates
  useEffect(() => {
    console.log('[StepDurationCalendar] Active dates updated:');
    console.log('  - activeStart:', activeStart);
    console.log('  - activeEnd:', activeEnd);
    console.log('  - activeDuration:', activeDuration);
    console.log('  - isCustomised:', isCustomised);
  }, [activeStart, activeEnd, activeDuration, isCustomised]);

  const handleDurationChange = (d: Duration) => {
    onDurationChange(d);
    // Reset custom end when duration changes
    setCustomEnd(null);
  };

  const handleSetStart = async () => {
    if (!selectedDate) return;
    const ns = new Date(selectedDate);
    const ne = customEnd ?? suggestedEnd;
    if (ne <= ns) {
      const e = new Date(ns);
      e.setDate(e.getDate() + duration - 1);
      setCustomEnd(e);
    } else {
      setCustomEnd(ne);
    }
    try {
      setIsLoading(true);
      const data = {
        start_date: ns.toISOString().split("T")[0],
        forecast_days: 60,
        num_salt_beds: bedCount,
        latitude: 8.061542,
        longitude: 79.814714,
      };
      await crystallizationController.getCrystallizationPredictions(data);
      setCustomStart(ns);
      setSelectedDate(null); // Close the sheet after success
    } catch (e) {
      console.error("Error fetching crystallization predictions:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetEnd = () => {
    if (!selectedDate) return;
    const ne = new Date(selectedDate);
    const ns = customStart ?? suggestedStart;
    if (ne <= ns) {
      const s = new Date(ne);
      s.setDate(s.getDate() - duration + 1);
      setCustomStart(s);
    } else {
      setCustomStart(ns);
    }
    setCustomEnd(ne);
  };

  const selDiff = selectedDate ? dayDiff(activeStart, selectedDate) : 0;
  const selPhase: Phase | null =
    selectedDate && selDiff >= 0 && selDiff < activeDuration
      ? getPhase(selDiff, activeDuration)
      : null;
  const selWeather = selectedDate
    ? getDayWeather(selectedDate, selPhase, weatherData)
    : null;

  return (
    <div className="flex flex-col">
      <ProfitBanner
        bedCount={bedCount}
        duration={activeDuration}
        workerCount={3}
        label={t("creation.predictedProfitDays", { days: activeDuration })}
      />

      <p className="text-xs font-semibold text-slate-500 mb-2">
        {t("creation.chooseDuration")}
      </p>
      <div className="flex gap-2 mb-4">
        {([30, 45] as Duration[]).map((d) => {
          const isActive = duration === d;
          return (
            <button
              key={d}
              onClick={() => handleDurationChange(d)}
              className={`flex-1 relative py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${isActive ? "bg-compass-600 text-white shadow-lg shadow-compass-600/25" : "bg-white text-slate-600 border-2 border-slate-200 hover:border-compass-300"}`}
            >
              {t("creation.daysLabel", { count: d })}
              {d === 45 && (
                <span
                  className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap leading-none ${isActive ? "bg-white text-compass-700" : "bg-compass-600 text-white"}`}
                >
                  {t("creation.suggested")}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-compass-50 border border-compass-100 rounded-xl px-4 py-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-compass-600 uppercase tracking-wide">
            {isCustomised
              ? t("creation.customPlan")
              : t("creation.suggestedPlan")}
          </p>
          {isCustomised && (
            <button
              onClick={() => {
                setCustomStart(null);
                setCustomEnd(null);
              }}
              className="flex items-center gap-1 text-[10px] font-bold text-compass-700 bg-white border border-compass-200 px-2 py-1 rounded-lg hover:bg-compass-100 transition-colors"
            >
              <RotateCcw size={10} />
              {t("creation.useSuggestedPlan")}
            </button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-[9px] text-slate-400 uppercase font-semibold mb-0.5">
              {t("creation.start")}
            </p>
            <p className="text-xs font-bold text-compass-800">
              {fmtShort(activeStart)}
            </p>
          </div>
          <div className="flex-1 mx-3">
            <div className="w-full h-px bg-compass-200 relative">
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-semibold text-compass-500 whitespace-nowrap">
                {t("creation.daysLabel", { count: activeDuration })}
              </span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-slate-400 uppercase font-semibold mb-0.5">
              {t("creation.end")}
            </p>
            <p className="text-xs font-bold text-emerald-700">
              {fmtShort(activeEnd)}
            </p>
          </div>
        </div>
        {!isCustomised && (
          <p className="text-[9px] text-compass-500 mt-2 text-center">
            {t("creation.tapDateHint")}
          </p>
        )}
      </div>

      {/* AI Hint Card */}
      {hintLoading ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4">
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 bg-purple-100 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-100 rounded w-24" />
              <div className="h-2.5 bg-slate-100 rounded w-full" />
            </div>
          </div>
        </div>
      ) : planHint ? (
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border border-purple-200 shadow-sm p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/30">
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1.5">
                <p className="text-[11px] font-extrabold text-purple-600 uppercase tracking-wide">
                  {planHint.notification[locale]}
                </p>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-3 font-medium">
                {planHint.description[locale]}
              </p>
              {planHint.plandays && planHint.startdate && (
                <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm rounded-xl px-3 py-2 border border-purple-100">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays size={14} className="text-purple-600" />
                    <span className="text-xs font-bold text-slate-800">
                      {new Date(planHint.startdate + 'T00:00:00').toLocaleDateString(locale === 'si' ? 'si-LK' : locale === 'ta' ? 'ta-LK' : 'en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-purple-200" />
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-purple-600" />
                    <span className="text-xs font-bold text-slate-800">
                      {planHint.plandays} {t('planner.days', { count: planHint.plandays })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 mb-6">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">
          {t("creation.planCalendar")} — Weather forecast marked for next 16
          days
        </p>
        <MultiMonthCalendar
          startDate={activeStart}
          endDate={activeEnd}
          onDateClick={setSelectedDate}
          weatherData={weatherData}
        />
      </div>

      <button
        onClick={async () => {
          try {
            setIsLoading(true);
            const data = {
              start_date: activeStart.toISOString().split("T")[0],
              forecast_days: 60,
              num_salt_beds: bedCount,
              latitude: 8.061542,
              longitude: 79.814714,
            };
            await crystallizationController.getCrystallizationPredictions(data);
            onNext(activeStart, activeEnd);
          } catch (e) {
            console.error("Error fetching crystallization predictions:", e);
          } finally {
            setIsLoading(false);
          }
        }}
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-semibold transition-all ${isLoading ? "bg-compass-400 text-white cursor-not-allowed" : "bg-compass-600 text-white shadow-lg shadow-compass-600/25 active:scale-[0.98]"}`}
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {t("creation.loading")}
          </>
        ) : (
          <>
            {t("creation.confirmAndContinue")} <ArrowRight size={18} />
          </>
        )}
      </button>

      {selectedDate && selWeather && (
        <DateDetailSheet
          date={selectedDate}
          phase={selPhase}
          weather={selWeather}
          isStart={isSameDay(selectedDate, activeStart)}
          isEnd={isSameDay(selectedDate, activeEnd)}
          isLoading={isLoading}
          onSetStart={handleSetStart}
          onSetEnd={handleSetEnd}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
};

// ─── Step 4: Worker Count ─────────────────────────────────────────
const StepWorkerCount: React.FC<{
  bedCount: number;
  duration: number;
  value: number;
  onChange: (v: number) => void;
  onNext: () => void;
}> = ({ bedCount, duration, value, onChange, onNext }) => {
  const t = useTranslations("compass");
  const productionPerBed = duration <= 30 ? 3 : 5;
  const totalBags = bedCount * productionPerBed;
  const pssRecommended = suggestedWorkerCount(totalBags);
  const presets = [2, 3, 4, 5, 6, 8];
  const isUsingPSS = value === pssRecommended;

  return (
    <div className="flex flex-col">
      <ProfitBanner
        bedCount={bedCount}
        duration={duration}
        workerCount={value || pssRecommended}
        label={t("creation.predictedProfitUpdates")}
      />

      <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
        <Users size={28} className="text-sky-600" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-1 text-center">
        {t("creation.howManyWorkers")}
      </h2>
      <p className="text-sm text-slate-500 mb-5 text-center max-w-xs mx-auto">
        {t("creation.includeSelf")}
      </p>

      {/* PSS Suggestion chip */}
      <div className="bg-compass-50 border border-compass-100 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-compass-600" />
          <div>
            <p className="text-[10px] font-bold text-compass-700 uppercase tracking-wide">
              {t("creation.pssRecommended")}
            </p>
            <p className="text-xs text-slate-600">
              {t("creation.workersForBags", {
                workers: pssRecommended,
                bags: totalBags,
              })}
            </p>
          </div>
        </div>
        {!isUsingPSS && (
          <button
            onClick={() => onChange(pssRecommended)}
            className="text-[10px] font-bold text-compass-700 bg-white border border-compass-200 px-2 py-1 rounded-lg hover:bg-compass-100 transition-colors"
          >
            {t("creation.useThis")}
          </button>
        )}
        {isUsingPSS && (
          <span className="text-[10px] font-bold text-compass-700 bg-compass-100 px-2 py-1 rounded-lg">
            ✓ {t("creation.selected")}
          </span>
        )}
      </div>

      {/* Preset grid */}
      <div className="grid grid-cols-3 gap-3 w-full mb-5">
        {presets.map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`relative py-4 rounded-xl text-lg font-bold transition-all active:scale-95 ${
              value === n
                ? "bg-compass-600 text-white shadow-lg shadow-compass-600/25 ring-2 ring-compass-300"
                : "bg-white text-slate-700 border border-slate-200 hover:border-compass-300 hover:bg-compass-50"
            }`}
          >
            {n}
            {n === pssRecommended && (
              <span
                className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[7px] font-bold px-1 py-px rounded-full whitespace-nowrap leading-none ${value === n ? "bg-white text-compass-700" : "bg-compass-600 text-white"}`}
              >
                PSS
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Custom input */}
      <div className="flex items-center gap-2 w-full mb-6">
        <span className="text-sm text-slate-500 whitespace-nowrap">
          {t("creation.orEnter")}
        </span>
        <input
          type="number"
          min={1}
          max={30}
          value={value || ""}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            if (!isNaN(v) && v >= 1 && v <= 30) onChange(v);
          }}
          placeholder={`e.g. ${pssRecommended}`}
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-compass-400 focus:border-compass-400"
        />
      </div>

      <button
        onClick={onNext}
        disabled={!value}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-semibold transition-all ${
          value
            ? "bg-compass-600 text-white shadow-lg shadow-compass-600/25 active:scale-[0.98]"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        {t("creation.seePlanSummary")} <ArrowRight size={18} />
      </button>
    </div>
  );
};

// ─── Step 5: Plan Summary ─────────────────────────────────────────
const StepPlanSummary: React.FC<{
  plan: PlanData;
  onConfirm: () => void;
  isCreating: boolean;
}> = ({ plan, onConfirm, isCreating }) => {
  const t = useTranslations("compass");
  const duration = plan.duration ?? 45;
  const workers = plan.workerCount || 3;
  const computed = useMemo(
    () => computeProfit(plan.bedCount, duration, workers),
    [plan.bedCount, duration, workers],
  );

  const demandKey =
    computed.totalBags <= 20
      ? "high"
      : computed.totalBags <= 50
        ? "moderate"
        : "strong";
  const demandLevel = t(`creation.${demandKey}`);
  const demandColor =
    demandKey === "high"
      ? "text-emerald-600 bg-emerald-50 border-emerald-100"
      : demandKey === "strong"
        ? "text-teal-600 bg-teal-50 border-teal-100"
        : "text-amber-600 bg-amber-50 border-amber-100";
  const demandNoteKey =
    demandKey === "high"
      ? "demandHigh"
      : demandKey === "strong"
        ? "demandStrong"
        : "demandModerate";
  const demandNote = t(`creation.${demandNoteKey}`);

  const startDate = new Date(plan.date + "T00:00:00");
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + duration - 1);

  const SELLERS_LOCAL = [
    {
      name: "Colombo Salt Co.",
      pricePerBag: 2100,
      rating: 4.8,
      badge: t("creation.bestPrice"),
      highlight: true,
    },
    {
      name: "Southern Traders",
      pricePerBag: 1950,
      rating: 4.5,
      badge: t("creation.quickPayment"),
      highlight: false,
    },
    {
      name: "Lanka Salt Exports",
      pricePerBag: 1850,
      rating: 4.3,
      badge: t("creation.bulkBuyer"),
      highlight: false,
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 bg-compass-50 rounded-2xl flex items-center justify-center flex-shrink-0">
          <ClipboardList size={24} className="text-compass-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {t("planner.planSummary")}
          </h2>
          <p className="text-xs text-slate-500">
            {t("creation.reviewAndConfirm")}
          </p>
        </div>
      </div>

      {/* Profit hero */}
      <div
        className={`rounded-2xl p-4 mb-4 shadow-lg ${computed.profit >= 0 ? "bg-emerald-600 shadow-emerald-600/20" : "bg-red-600 shadow-red-600/20"}`}
      >
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={13} className="text-white/70" />
          <p className="text-[11px] text-white/70 font-semibold uppercase tracking-wide">
            {t("creation.estimatedProfit")}
          </p>
        </div>
        <p className="text-2xl font-extrabold text-white">
          Rs. {computed.profit.toLocaleString()}
        </p>
        <p className="text-[11px] text-white/60 mt-0.5">
          {t("creation.bagsAcrossBeds", {
            bags: computed.totalBags,
            beds: plan.bedCount,
            duration,
          })}
        </p>
      </div>

      {/* Demand */}
      <div
        className={`flex items-center justify-between rounded-xl p-4 border mb-3 ${demandColor}`}
      >
        <div className="flex items-center gap-2">
          <BarChart2 size={18} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide opacity-70">
              {t("creation.demandForecast")}
            </p>
            <p className="text-sm font-bold">{demandLevel}</p>
            <p className="text-[10px] opacity-70 mt-0.5">{demandNote}</p>
          </div>
        </div>
      </div>

      {/* Sellers */}
      <p className="text-xs font-bold text-slate-700 mb-2">
        {t("creation.recommendedSellers")}
      </p>
      <div className="space-y-2 mb-4">
        {SELLERS_LOCAL.map((seller) => {
          const sellerProfit =
            computed.totalBags * seller.pricePerBag - computed.totalExpenses;
          return (
            <div
              key={seller.name}
              className={`rounded-xl p-3.5 border flex items-center justify-between ${seller.highlight ? "bg-compass-50 border-compass-200 ring-1 ring-compass-200" : "bg-white border-slate-100"}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {seller.name}
                  </p>
                  {seller.highlight && (
                    <span className="text-[9px] font-bold bg-compass-600 text-white px-1.5 py-0.5 rounded uppercase">
                      {t("creation.best")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-0.5">
                    <Star size={10} className="text-amber-500 fill-amber-500" />
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {seller.rating}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">·</span>
                  <BadgeCheck size={10} className="text-slate-400" />
                  <span className="text-[10px] text-slate-500">
                    {seller.badge}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <p className="text-xs text-slate-500">
                  Rs. {seller.pricePerBag.toLocaleString()}
                  {t("creation.perBag")}
                </p>
                <p
                  className={`text-sm font-bold ${sellerProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}
                >
                  {sellerProfit >= 0 ? "+" : ""}Rs.{" "}
                  {sellerProfit.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expenses */}
      <p className="text-xs font-bold text-slate-700 mb-2">
        {t("creation.expenseBreakdown")}
      </p>
      <div className="space-y-2 mb-4">
        {[
          {
            icon: <Banknote size={16} className="text-sky-500" />,
            label: t("creation.carryingCost"),
            amount: computed.totalWages,
            detail: t("creation.carryingCostDetail", {
              bags: computed.totalBags,
              cost: CARRYING_COST_PER_BAG,
            }),
            bg: "bg-sky-50",
          },
          {
            icon: <Users size={16} className="text-violet-500" />,
            label: t("creation.refreshments"),
            amount: computed.totalRefreshments,
            detail: t("creation.refreshmentsDetail", {
              workers,
              cost: REFRESHMENT_PER_DAY,
              days: computed.workDays,
            }),
            bg: "bg-violet-50",
          },
        ].map((e) => (
          <div
            key={e.label}
            className="bg-white rounded-xl p-3.5 border border-slate-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${e.bg}`}
              >
                {e.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {e.label}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{e.detail}</p>
              </div>
            </div>
            <p className="text-sm font-bold text-slate-900 ml-3">
              Rs. {e.amount.toLocaleString()}
            </p>
          </div>
        ))}
        <div className="bg-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center">
              <Wallet size={16} className="text-white" />
            </div>
            <p className="text-sm font-semibold text-white">
              {t("creation.totalExpenses")}
            </p>
          </div>
          <p className="text-sm font-bold text-white">
            Rs. {computed.totalExpenses.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Form data summary */}
      <p className="text-xs font-bold text-slate-700 mb-2">
        {t("creation.yourInputs")}
      </p>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-6 space-y-2.5">
        {[
          {
            icon: <Sprout size={14} className="text-emerald-600" />,
            label: t("creation.planType"),
            value:
              plan.planType === "FRESHER"
                ? t("creation.startingFresh")
                : t("creation.midSeasonTag"),
          },
          {
            icon: <Grid3X3 size={14} className="text-amber-600" />,
            label: t("creation.numberOfBedsLabel"),
            value: t("planner.beds", { count: plan.bedCount }),
          },
          {
            icon: <CalendarDays size={14} className="text-sky-600" />,
            label: t("creation.startDateLabel"),
            value: fmtShort(startDate),
          },
          {
            icon: <CalendarDays size={14} className="text-sky-600" />,
            label: t("creation.endDateLabel"),
            value: fmtShort(endDate),
          },
          {
            icon: <Package size={14} className="text-violet-600" />,
            label: t("creation.planDurationLabel"),
            value: t("planner.days", { count: duration }),
          },
          {
            icon: <Users size={14} className="text-slate-600" />,
            label: t("creation.workersLabel"),
            value: t("planner.workers", { count: workers }),
          },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {row.icon}
              <span className="text-xs text-slate-500 font-medium">
                {row.label}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-900">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Confirm button */}
      <button
        onClick={onConfirm}
        disabled={isCreating}
        className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-bold shadow-xl transition-all ${
          isCreating
            ? "bg-slate-400 cursor-not-allowed"
            : "bg-compass-600 shadow-compass-600/30 active:scale-[0.98]"
        } text-white`}
      >
        {isCreating ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            {t("creation.creating")}
          </>
        ) : (
          <>
            <CheckCircle2 size={20} />
            {t("creation.confirmAndCreate")}
          </>
        )}
      </button>
      <p className="text-[10px] text-slate-400 text-center mt-2">
        {t("creation.estimateDisclaimer")}
      </p>
    </div>
  );
};

// ─── Main Flow ────────────────────────────────────────────────────
export const PlanCreationFlow: React.FC<PlanCreationFlowProps> = ({
  onComplete,
  onBack,
}) => {
  const t = useTranslations("compass");
  const locale = useLocale() as 'en' | 'si' | 'ta';
  const { toast } = useToast();
  const TOTAL_STEPS = 5;
  const [step, setStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [weatherData, setWeatherData] = useState<
    Map<string, WeatherForecastDay>
  >(new Map());
  const [planHint, setPlanHint] = useState<PlanCreateHintResponse | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [plan, setPlan] = useState<PlanData>({
    bedCount: 0,
    planType: null,
    date: new Date().toISOString().split("T")[0],
    duration: 45,
    workerCount: 0,
  });

  // Fetch weather data on mount
  useEffect(() => {
    const fetchWeatherData = async () => {
      // Check if user is authenticated
      const token = tokenStorage.getToken();
      if (!token) {
        console.log(
          "[PlanCreation] No authentication token found. Weather data will not be available.",
        );
        return;
      }

      try {
        const response = await crystallizationController.getWeatherForecast();

        console.log("[PlanCreation] Weather API Response:", response);
        console.log(
          "[PlanCreation] Weather API Response keys:",
          Object.keys(response),
        );
        console.log(
          "[PlanCreation] Weather API Response.data:",
          response?.data,
        );

        // Check different possible response structures
        let weatherList = null;
        if (response?.data?.data?.list) {
          weatherList = response.data.data.list;
          console.log(
            "[PlanCreation] Found weather data at response.data.data.list",
          );
        } else if (response?.data?.list) {
          weatherList = response.data.list;
          console.log(
            "[PlanCreation] Found weather data at response.data.list",
          );
        } else if ((response as any)?.list) {
          weatherList = (response as any).list;
          console.log("[PlanCreation] Found weather data at response.list");
        }

        if (weatherList && Array.isArray(weatherList)) {
          const weatherMap = new Map<string, WeatherForecastDay>();
          weatherList.forEach((day: WeatherForecastDay) => {
            const date = new Date(day.dt * 1000);
            const dateStr = date.toISOString().split("T")[0];
            console.log(
              `[PlanCreation] Weather data for ${dateStr}:`,
              day.weather[0]?.icon,
            );
            weatherMap.set(dateStr, day);
          });
          console.log("[PlanCreation] Weather Map size:", weatherMap.size);
          console.log(
            "[PlanCreation] Weather Map keys:",
            Array.from(weatherMap.keys()),
          );
          setWeatherData(weatherMap);
        } else {
          console.log(
            "[PlanCreation] No weather data in response. Full response:",
            JSON.stringify(response, null, 2),
          );
        }
      } catch (error: any) {
        console.error("[PlanCreation] Failed to fetch weather data:", error);
        // Silently fail for auth errors in plan creation flow
        if (error?.status === 401) {
          console.log(
            "[PlanCreation] Authentication required for weather data",
          );
        }
      }
    };

    fetchWeatherData();
  }, []);

  // Fetch plan creation hint
  useEffect(() => {
    const fetchPlanHint = async () => {
      const token = tokenStorage.getToken();
      if (!token) {
        console.log('[PlanCreation] No token, skipping hint fetch');
        return;
      }

      try {
        console.log('[PlanCreation] Starting hint fetch...');
        setHintLoading(true);
        const response = await aiController.getPlanCreateHint();
        console.log('[PlanCreation] Raw API Response:', response);
        console.log('[PlanCreation] Response keys:', Object.keys(response));
        
        // Handle both direct response and wrapped response
        const hintData = (response as any)?.data || response;
        console.log('[PlanCreation] Extracted hint data:', hintData);
        
        if (hintData && hintData.startdate && hintData.plandays) {
          setPlanHint(hintData);
          console.log('[PlanCreation] Set planHint:', hintData);
          
          // Set the start date from hint if available
          setPlan((p) => ({
            ...p,
            date: hintData.startdate,
            duration: (hintData.plandays <= 37 ? 30 : 45) as Duration,
          }));
          console.log('[PlanCreation] Set plan date to:', hintData.startdate);
        } else {
          console.warn('[PlanCreation] Hint data missing required fields:', hintData);
        }
      } catch (error) {
        console.error('[PlanCreation] Failed to fetch plan hint:', error);
      } finally {
        setHintLoading(false);
        console.log('[PlanCreation] Hint loading complete');
      }
    };

    fetchPlanHint();
  }, [locale]);

  const handleBack = () => {
    if (step === 0) onBack();
    else setStep((s) => s - 1);
  };

  const handleCreatePlan = async () => {
    if (!plan.planType || !plan.duration) return;

    setIsCreating(true);
    try {
      const duration = plan.duration;
      const workers = plan.workerCount;
      const computed = computeProfit(plan.bedCount, duration, workers);

      const startDate = new Date(plan.date + "T00:00:00");
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + duration - 1);

      const requestData = {
        saltBeds: plan.bedCount,
        harvestStatus:
          plan.planType === "FRESHER"
            ? ("FRESHER" as const)
            : ("MIDLEVEL" as const),
        planPeriod: duration,
        startDate: startDate.toISOString(),
        predictedProduction: computed.totalBags,
        actualProduction: 0,
        workerCount: workers,
        predictedProfit: computed.profit,
        actualProfit: 0,
        expenses: computed.totalExpenses,
        earnings: 0,
        avgSellingPrice: PRICE_PER_BAG,
      };

      const response =
        await harvestPlanController.createHarvestPlan(requestData);

      // HTTP client unwraps the response, so we get the HarvestPlan directly
      // If the API call succeeds, response will contain the plan data
      if (response) {
        toast({
          title: t("creation.planCreated"),
          description: t("creation.planCreatedDesc"),
        });
        onComplete(plan);
      } else {
        throw new Error("Failed to create plan");
      }
    } catch (error) {
      console.error("Failed to create harvest plan:", error);
      toast({
        title: t("creation.planFailed"),
        description:
          error instanceof Error ? error.message : t("creation.planFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] max-w-md mx-auto px-5 pt-4 pb-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
          aria-label={t("creation.goBack")}
        >
          <ArrowLeft size={22} className="text-slate-700" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">
            {step + 1}/{TOTAL_STEPS}
          </span>
          <StepIndicator current={step} total={TOTAL_STEPS} />
        </div>
        <div className="w-10" />
      </div>

      {/* Step content */}
      <div
        className="flex-1 flex flex-col justify-start animate-in fade-in slide-in-from-right-4 duration-300"
        key={step}
      >
        {step === 0 && (
          <StepPlanType
            value={plan.planType}
            onChange={(v) => setPlan((p) => ({ ...p, planType: v }))}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <StepBedCount
            value={plan.bedCount}
            onChange={(v) => setPlan((p) => ({ ...p, bedCount: v }))}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && plan.planType !== null && (
          <StepDurationCalendar
            bedCount={plan.bedCount}
            planType={plan.planType}
            duration={(plan.duration as Duration) ?? 45}
            onDurationChange={(d) => setPlan((p) => ({ ...p, duration: d }))}
            weatherData={weatherData}
            planHint={planHint}
            hintLoading={hintLoading}
            onNext={(startDate, endDate) => {
              const finalDuration = dayDiff(startDate, endDate) + 1;
              setPlan((p) => ({
                ...p,
                date: startDate.toISOString().split("T")[0],
                duration: (finalDuration <= 37 ? 30 : 45) as Duration,
              }));
              setStep(3);
            }}
          />
        )}
        {step === 3 && (
          <StepWorkerCount
            bedCount={plan.bedCount}
            duration={plan.duration ?? 45}
            value={plan.workerCount}
            onChange={(v) => setPlan((p) => ({ ...p, workerCount: v }))}
            onNext={() => setStep(4)}
          />
        )}
        {step === 4 && (
          <StepPlanSummary
            plan={plan}
            onConfirm={handleCreatePlan}
            isCreating={isCreating}
          />
        )}
      </div>
    </div>
  );
};
