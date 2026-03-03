"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
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
  Trash2,
  AlertTriangle,
  X,
  CheckCircle2,
  XCircle,
  MapPin,
  ChevronRight,
  ArrowRight,
  Lightbulb,
} from "lucide-react";


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
  onCreatePlan: () => void;
  onHarvestNow: () => void;
  onDiscardPlan: () => void;
}

// ─── Onboarding coach marks ───────────────────────────────────────

const TOUR_KEY = "pss_planner_tour_done";

interface TourStep {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
}

// NO_PLAN_STEPS and WITH_PLAN_STEPS moved inside PlannerLanding component for i18n

const CoachOverlay: React.FC<{
  steps: TourStep[];
  guideLabel: string;
  onDone: () => void;
}> = ({ steps, guideLabel, onDone }) => {
  const [idx, setIdx] = useState(0);
  const step = steps[idx];
  const isLast = idx === steps.length - 1;

  return (
    <>
      {/* Soft backdrop */}
      <div className="fixed inset-0 bg-black/20 z-30 pointer-events-none" />

      {/* Coach card — pinned above bottom nav */}
      <div className="fixed bottom-24 left-0 right-0 z-40 px-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl shadow-black/15 border border-slate-100 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-slate-100">
            <div
              className="h-1 bg-compass-500 transition-all duration-500"
              style={{ width: `${((idx + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="px-5 pt-4 pb-5">
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                {step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Lightbulb size={12} className="text-amber-500" />
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">
                    {guideLabel}
                  </p>
                </div>
                <p className="text-base font-bold text-slate-900">{step.title}</p>
              </div>
              <button
                onClick={onDone}
                className="p-1.5 rounded-lg hover:bg-slate-100 flex-shrink-0"
              >
                <X size={16} className="text-slate-400" />
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-4">{step.body}</p>

            <button
              onClick={() => {
                if (isLast) onDone();
                else setIdx((i) => i + 1);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-compass-600 text-white text-sm font-bold active:scale-[0.98] transition-all"
            >
              {isLast ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
              {step.cta}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Pulsing ring helper ──────────────────────────────────────────
// Wraps a child with an animated attention ring
const PulseRing: React.FC<{ children: React.ReactNode; active: boolean }> = ({
  children,
  active,
}) => {
  if (!active) return <>{children}</>;
  return (
    <div className="relative inline-flex">
      <span className="absolute inset-0 rounded-xl animate-ping bg-compass-400 opacity-30 z-0" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

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

const WxIcon: React.FC<{ kind: WxKind; size?: number }> = ({ kind, size = 14 }) => {
  if (kind === "sunny") return <Sun size={size} className="text-amber-400" />;
  if (kind === "rainy") return <CloudRain size={size} className="text-sky-500" />;
  if (kind === "windy") return <Wind size={size} className="text-slate-400" />;
  return <Cloud size={size} className="text-slate-400" />;
};

const WX_BG: Record<WxKind, string> = {
  sunny: "bg-amber-50", cloudy: "bg-slate-50", rainy: "bg-sky-50", windy: "bg-slate-50",
};
const WX_BORDER: Record<WxKind, string> = {
  sunny: "border-amber-100", cloudy: "border-slate-100", rainy: "border-sky-100", windy: "border-slate-100",
};

// ─── Forecast month grid ──────────────────────────────────────────

const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const ForecastMonthGrid: React.FC<{
  year: number; month: number; today: Date; maxDays: number;
}> = ({ year, month, today, maxDays }) => {
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
        <MapPin size={13} className="text-compass-500" />
        <p className="text-sm font-bold text-slate-700">{monthLabel}</p>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map(h => (
          <div key={h} className="text-center text-[10px] font-bold text-slate-400 uppercase py-1">{h}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const cellDate = new Date(year, month, day);
          cellDate.setHours(0, 0, 0, 0);
          const dayOffset = Math.floor((cellDate.getTime() - today.getTime()) / 86_400_000);
          const isPast = dayOffset < 0;
          const isBeyond = dayOffset >= maxDays;
          const isToday = dayOffset === 0;
          const wx = wxForDay(dayOffset);
          if (isPast || isBeyond) return <div key={`h-${day}`} className="invisible" />;
          return (
            <div
              key={day}
              className={`flex flex-col items-center rounded-xl py-1.5 border ${
                isToday
                  ? "bg-compass-600 border-compass-500 shadow-sm"
                  : `${WX_BG[wx.kind]} ${WX_BORDER[wx.kind]}`
              }`}
            >
              <WxIcon kind={wx.kind} size={isToday ? 14 : 13} />
              <span className={`text-[11px] font-bold mt-0.5 leading-none ${isToday ? "text-white" : "text-slate-800"}`}>
                {day}
              </span>
              <span className={`text-[9px] leading-none mt-0.5 font-medium ${isToday ? "text-white/80" : "text-slate-500"}`}>
                {wx.temp}°
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WeatherForecastCalendar: React.FC = () => {
  const t = useTranslations('compass');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const FORECAST_DAYS = 60;
  const lastDay = new Date(today.getTime() + (FORECAST_DAYS - 1) * 86_400_000);
  const months: { year: number; month: number }[] = [];
  const cursor = new Date(today.getFullYear(), today.getMonth(), 1);
  while (cursor <= lastDay) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-slate-900">{t('weather.next60Days')} ☀️</p>
        <span className="text-[10px] font-semibold text-sky-500 uppercase tracking-wide">{t('weather.forecast')}</span>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3">
        <div className="max-h-[460px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
          {months.map(({ year, month }) => (
            <ForecastMonthGrid key={`${year}-${month}`} year={year} month={month} today={today} maxDays={FORECAST_DAYS} />
          ))}
        </div>
        <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-slate-100 mt-1">
          {[
            { icon: <Sun size={12} className="text-amber-400" />, label: t('weather.sunny') },
            { icon: <Cloud size={12} className="text-slate-400" />, label: t('weather.cloudy') },
            { icon: <CloudRain size={12} className="text-sky-500" />, label: t('weather.rain') },
            { icon: <Wind size={12} className="text-slate-400" />, label: t('weather.windy') },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">{l.icon}<span className="text-[10px] text-slate-500 font-medium">{l.label}</span></div>
          ))}
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="w-3 h-3 rounded-sm bg-compass-600" />
            <span className="text-[10px] text-slate-500 font-medium">{t('weather.today')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Plan History Detail Sheet ────────────────────────────────────

const PlanDetailSheet: React.FC<{ record: PlanRecord; onClose: () => void }> = ({ record, onClose }) => {
  const t = useTranslations('compass');
  const start = new Date(record.date + "T00:00:00");
  const end = new Date(start.getTime() + (record.duration - 1) * 86_400_000);
  const fmtDate = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const isCompleted = record.status === "completed";
  const isCancelled = record.status === "cancelled";
  const predictedBags = record.bedCount * (record.duration <= 30 ? 3 : 5);
  const bagDiff = record.actualBags !== undefined ? record.actualBags - predictedBags : null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 duration-300">
        <div className="max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl px-5 pt-4 pb-10">
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">{t('planner.planSummary')}</p>
              <h3 className="text-lg font-bold text-slate-900">
                {record.planType === "fresher" ? t('planner.freshStartPlan') : t('planner.midSeasonPlan')}
              </h3>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100">
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          <div className={`flex items-center gap-2 rounded-xl px-4 py-3 mb-4 ${
            isCompleted ? "bg-emerald-50 border border-emerald-100"
            : isCancelled ? "bg-red-50 border border-red-100"
            : "bg-compass-50 border border-compass-100"
          }`}>
            {isCompleted && <CheckCircle2 size={18} className="text-emerald-600" />}
            {isCancelled && <XCircle size={18} className="text-red-500" />}
            <p className={`text-sm font-bold ${isCompleted ? "text-emerald-700" : isCancelled ? "text-red-600" : "text-compass-700"}`}>
              {isCompleted ? t('planner.harvestCompletedSuccess') : isCancelled ? t('planner.planDiscarded') : t('planner.active')}
            </p>
          </div>

          <div className="space-y-2.5 mb-5">
            {[
              { icon: <CalendarDays size={16} className="text-sky-500" />, label: t('planner.startDate'), value: fmtDate(start) },
              { icon: <CalendarDays size={16} className="text-sky-500" />, label: t('planner.endDate'), value: fmtDate(end) },
              { icon: <Grid3X3 size={16} className="text-amber-500" />, label: t('planner.numberOfBeds'), value: t('planner.beds', { count: record.bedCount }) },
              { icon: <Clock size={16} className="text-slate-400" />, label: t('planner.planDuration'), value: t('planner.days', { count: record.duration }) },
              ...(record.workerCount ? [{ icon: <Package size={16} className="text-violet-500" />, label: t('planner.workersHired'), value: t('planner.workers', { count: record.workerCount }) }] : []),
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">{row.icon}<span className="text-sm text-slate-500">{row.label}</span></div>
                <span className="text-sm font-bold text-slate-900">{row.value}</span>
              </div>
            ))}
          </div>

          {isCompleted && record.actualBags !== undefined && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-3">{t('planner.whatActuallyHappened')}</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">{t('planner.bagsProduced')}</span>
                <span className="text-xl font-extrabold text-emerald-700">{record.actualBags}</span>
              </div>
              {record.actualDate && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">{t('planner.harvestDate')}</span>
                  <span className="text-sm font-bold text-slate-900">{fmtDate(new Date(record.actualDate + "T00:00:00"))}</span>
                </div>
              )}
              {bagDiff !== null && (
                <div className={`mt-2 rounded-xl px-3 py-2 text-sm font-semibold ${bagDiff >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {bagDiff > 0 && `🎉 ${t('planner.moreBagsThanPredicted', { count: bagDiff })}`}
                  {bagDiff === 0 && `🎯 ${t('planner.exactlyAsPredicted')}`}
                  {bagDiff < 0 && `📉 ${t('planner.fewerBagsThanPredicted', { count: Math.abs(bagDiff) })}`}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ─── Plan History Card ────────────────────────────────────────────

const PlanHistoryCard: React.FC<{ record: PlanRecord; onTap: () => void; t: ReturnType<typeof useTranslations> }> = ({ record, onTap, t }) => {
  const start = new Date(record.date + "T00:00:00");
  const fmtDate = start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const statusConfig = {
    active: { label: t('planner.active'), color: "bg-emerald-100 text-emerald-700" },
    completed: { label: t('planner.done'), color: "bg-slate-100 text-slate-600" },
    cancelled: { label: t('planner.discarded'), color: "bg-red-100 text-red-500" },
  };
  const sc = statusConfig[record.status];

  return (
    <button
      onClick={onTap}
      className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md active:scale-[0.99] transition-all text-left"
    >
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
        <CalendarDays size={20} className="text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {record.planType === "fresher" ? t('planner.freshStart') : t('planner.midSeason')} · {t('planner.days', { count: record.duration })}
          </p>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase flex-shrink-0 ${sc.color}`}>{sc.label}</span>
        </div>
        <p className="text-xs text-slate-400">{fmtDate} · {t('planner.beds', { count: record.bedCount })}</p>
        {record.actualBags !== undefined && (
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">✓ {t('planner.bagsHarvested', { count: record.actualBags })}</p>
        )}
      </div>
      <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
    </button>
  );
};

// ─── Main Component ───────────────────────────────────────────────

export const PlannerLanding: React.FC<PlannerLandingProps> = ({
  activePlan,
  planHistory,
  onCreatePlan,
  onHarvestNow,
  onDiscardPlan,
}) => {
  const t = useTranslations('compass');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<PlanRecord | null>(null);
  const [showTour, setShowTour] = useState(false);

  // Tour steps defined inside component for i18n access
  const NO_PLAN_STEPS: TourStep[] = [
    { icon: <Plus size={20} className="text-compass-600" />, title: t('tour.createFirstPlan'), body: t('tour.createFirstPlanBody'), cta: t('tour.nextTip') },
    { icon: <Sun size={20} className="text-amber-500" />, title: t('tour.checkWeather'), body: t('tour.checkWeatherBody'), cta: t('tour.nextTip') },
    { icon: <CalendarDays size={20} className="text-slate-500" />, title: t('tour.yourPastPlans'), body: t('tour.yourPastPlansBody'), cta: t('tour.gotIt') },
  ];

  const WITH_PLAN_STEPS: TourStep[] = [
    { icon: <Scissors size={20} className="text-amber-600" />, title: t('tour.harvestWhenReady'), body: t('tour.harvestWhenReadyBody'), cta: t('tour.nextTip') },
    { icon: <Trash2 size={20} className="text-red-400" />, title: t('tour.changedMind'), body: t('tour.changedMindBody'), cta: t('tour.nextTip') },
    { icon: <CalendarDays size={20} className="text-compass-600" />, title: t('tour.planOnCalendar'), body: t('tour.planOnCalendarBody'), cta: t('tour.gotIt') },
  ];

  // Show tour only on first visit (localStorage flag)
  useEffect(() => {
    try {
      if (!localStorage.getItem(TOUR_KEY)) setShowTour(true);
    } catch { /* ignore SSR */ }
  }, []);

  const dismissTour = () => {
    setShowTour(false);
    try { localStorage.setItem(TOUR_KEY, "1"); } catch { /* ignore */ }
  };

  const startDate = activePlan ? new Date(activePlan.date + "T00:00:00") : null;
  const endDate = activePlan && startDate
    ? new Date(startDate.getTime() + (activePlan.duration - 1) * 86_400_000)
    : null;
  const fmtShort = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const tourSteps = activePlan ? WITH_PLAN_STEPS : NO_PLAN_STEPS;

  return (
    <div className="flex flex-col px-4 pt-5 pb-32 max-w-lg mx-auto w-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{t('planner.myPlans')}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {activePlan ? t('planner.youHaveActivePlan') : t('planner.noActivePlanNow')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Show guide button if tour was dismissed */}
          {!showTour && (
            <button
              onClick={() => setShowTour(true)}
              className="p-2 rounded-xl bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors"
              title={t('tour.guide', { current: 1, total: tourSteps.length })}
            >
              <Lightbulb size={16} className="text-amber-500" />
            </button>
          )}
          {!activePlan && (
            <PulseRing active={!activePlan && planHistory.length === 0}>
              <button
                onClick={onCreatePlan}
                className="flex items-center gap-1.5 bg-compass-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md shadow-compass-600/25 active:scale-95 transition-all"
              >
                <Plus size={16} />
                {t('planner.newPlan')}
              </button>
            </PulseRing>
          )}
        </div>
      </div>

      {/* ── ACTIVE PLAN ── */}
      {activePlan ? (
        <>
          <div className="bg-compass-600 rounded-2xl p-4 mb-4 shadow-lg shadow-compass-600/20">
            <p className="text-xs text-white/60 mb-1">{t('planner.yourCurrentPlan')}</p>
            <h2 className="text-base font-bold text-white mb-3">
              {activePlan.planType === "fresher" ? t('planner.freshStart') : t('planner.midSeason')} · {t('planner.days', { count: activePlan.duration })}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <div className="flex items-center gap-1.5"><Grid3X3 size={13} className="text-white/60" /><span className="text-xs text-white/80">{t('planner.beds', { count: activePlan.bedCount })}</span></div>
              {startDate && <div className="flex items-center gap-1.5"><Clock size={13} className="text-white/60" /><span className="text-xs text-white/80">{t('planner.from', { date: fmtShort(startDate) })}</span></div>}
              {endDate && <div className="flex items-center gap-1.5"><CalendarDays size={13} className="text-white/60" /><span className="text-xs text-white/80">{t('planner.to', { date: fmtShort(endDate) })}</span></div>}
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={onHarvestNow}
              className="flex-1 flex items-center gap-3 bg-amber-50 border-2 border-amber-200 hover:border-amber-300 rounded-2xl p-4 active:scale-[0.98] transition-all"
            >
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Scissors size={20} className="text-amber-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900">{t('planner.harvestNow')}</p>
                <p className="text-xs text-slate-500">{t('planner.recordResults')}</p>
              </div>
            </button>
            <button
              onClick={() => setConfirmDiscard(true)}
              className="flex flex-col items-center justify-center gap-1.5 bg-red-50 border-2 border-red-100 hover:border-red-300 rounded-2xl px-5 active:scale-[0.98] transition-all"
            >
              <Trash2 size={20} className="text-red-400" />
              <span className="text-xs font-bold text-red-400">{t('planner.discard')}</span>
            </button>
          </div>

          {confirmDiscard && (
            <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-2xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-800">{t('planner.removePlan')}</p>
                  <p className="text-xs text-red-500 mt-0.5">{t('planner.cannotBeUndone')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDiscard(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-700 active:scale-95 transition-all">{t('planner.keepIt')}</button>
                <button onClick={() => { setConfirmDiscard(false); onDiscardPlan(); }} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white active:scale-95 transition-all">{t('planner.yesRemove')}</button>
              </div>
            </div>
          )}


          <WeatherForecastCalendar />
        </>
      ) : (
        <>
          <button
            onClick={onCreatePlan}
            className="w-full flex items-center gap-4 bg-white rounded-2xl border-2 border-dashed border-compass-200 p-5 mb-6 hover:border-compass-400 hover:bg-compass-50 active:scale-[0.99] transition-all text-left"
          >
            <div className="w-12 h-12 bg-compass-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Plus size={26} className="text-compass-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{t('planner.startNewPlan')}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t('planner.guideYou')}</p>
            </div>
          </button>

          <WeatherForecastCalendar />
        </>
      )}

      {/* ── Past Plans ── */}
      <div>
        <p className="text-sm font-bold text-slate-900 mb-3">{t('planner.pastPlans')}</p>
        {planHistory.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center">
            <CalendarDays size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">{t('planner.noPastPlans')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {planHistory.map(r => (
              <PlanHistoryCard key={r.id} record={r} onTap={() => setSelectedHistory(r)} t={t} />
            ))}
          </div>
        )}
      </div>

      {/* ── Plan Detail Sheet ── */}
      {selectedHistory && (
        <PlanDetailSheet record={selectedHistory} onClose={() => setSelectedHistory(null)} />
      )}

      {/* ── Onboarding coach marks ── */}
      {showTour && <CoachOverlay steps={tourSteps} guideLabel={t('tour.guide', { current: 1, total: tourSteps.length })} onDone={dismissTour} />}
    </div>
  );
};
