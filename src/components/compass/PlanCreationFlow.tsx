"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
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
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────
type PlanType = "fresher" | "mid-season";
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

const SELLERS = [
  { name: "Colombo Salt Co.", pricePerBag: 2100, rating: 4.8, badge: "Best Price", highlight: true },
  { name: "Southern Traders", pricePerBag: 1950, rating: 4.5, badge: "Quick Payment", highlight: false },
  { name: "Lanka Salt Exports", pricePerBag: 1850, rating: 4.3, badge: "Bulk Buyer", highlight: false },
];

// ─── Shared profit computation ────────────────────────────────────
function computeProfit(bedCount: number, duration: number, workerCount: number) {
  const productionPerBed = duration <= 30 ? 3 : 5;
  const totalBags = bedCount * productionPerBed;
  const totalWages = totalBags * CARRYING_COST_PER_BAG;
  const workDays = Math.max(1, Math.ceil(totalBags / (workerCount * BAGS_PER_WORKER_PER_DAY)));
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
  const data = useMemo(
    () => computeProfit(bedCount, duration, workerCount),
    [bedCount, duration, workerCount]
  );
  const pos = data.profit >= 0;
  return (
    <div
      className={`rounded-2xl p-4 mb-4 shadow-lg transition-colors duration-300 ${
        pos ? "bg-emerald-600 shadow-emerald-600/20" : "bg-red-600 shadow-red-600/20"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp size={13} className="text-white/70" />
        <p className="text-[11px] text-white/70 font-semibold uppercase tracking-wide">
          {label ?? "Predicted Profit"}
        </p>
      </div>
      <p className="text-2xl font-extrabold text-white leading-tight">
        Rs. {data.profit.toLocaleString()}
      </p>
      <p className="text-[11px] text-white/60 mt-0.5">
        ~{data.totalBags} bags · Revenue Rs. {data.revenue.toLocaleString()} − Costs Rs.{" "}
        {data.totalExpenses.toLocaleString()}
      </p>
    </div>
  );
};

// ─── Weather helpers ─────────────────────────────────────────────
type WeatherKind = "sunny" | "cloudy" | "rainy" | "windy";
interface DayWeather { kind: WeatherKind; temp: number; rainfall: number; salinity: number; }
type Phase = "prep" | "growth" | "harvest-ready";

const WEATHER_SEQ: WeatherKind[] = [
  "sunny","sunny","cloudy","sunny","rainy","windy","cloudy","sunny","sunny","rainy",
  "cloudy","sunny","windy","sunny","sunny","rainy","sunny","cloudy","sunny","sunny",
  "windy","cloudy","sunny","rainy","sunny","sunny","cloudy","sunny","windy","sunny",
  "sunny","cloudy","sunny","sunny","rainy","windy","sunny","sunny","cloudy","rainy",
  "sunny","sunny","sunny","cloudy","windy",
];
const TEMP_SEQ = [
  32,33,30,34,27,28,31,35,34,26,29,33,28,35,36,25,33,30,34,35,
  29,31,34,27,33,35,30,34,29,33,34,31,33,35,26,28,34,33,30,27,
  35,34,33,29,28,
];

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

function mockDayData(dayOffset: number, phase: Phase | null): DayWeather {
  const idx = Math.abs(dayOffset) % WEATHER_SEQ.length;
  const kind = WEATHER_SEQ[idx];
  return { kind, temp: TEMP_SEQ[idx], rainfall: rainfallForKind(kind, dayOffset), salinity: salinityForPhase(phase, dayOffset) };
}

const WeatherIcon: React.FC<{ kind: WeatherKind; size?: number }> = ({ kind, size = 10 }) => {
  if (kind === "sunny") return <Sun size={size} className="text-amber-400" />;
  if (kind === "rainy") return <CloudRain size={size} className="text-sky-500" />;
  if (kind === "windy") return <Wind size={size} className="text-slate-400" />;
  return <Cloud size={size} className="text-slate-400" />;
};

interface PhaseStyle { bg: string; text: string; dot: string; label: string; labelBg: string; labelText: string; }
const PHASE_STYLE: Record<Phase, PhaseStyle> = {
  prep: { bg: "bg-amber-50", text: "text-amber-900", dot: "bg-amber-400", label: "Preparation", labelBg: "bg-amber-100", labelText: "text-amber-700" },
  growth: { bg: "bg-emerald-50", text: "text-emerald-900", dot: "bg-emerald-500", label: "Growth", labelBg: "bg-emerald-100", labelText: "text-emerald-700" },
  "harvest-ready": { bg: "bg-teal-50", text: "text-teal-900", dot: "bg-teal-500", label: "Harvest Ready", labelBg: "bg-teal-100", labelText: "text-teal-700" },
};

function getPhase(dayIndex: number, duration: number): Phase {
  const pct = dayIndex / Math.max(duration - 1, 1);
  if (pct < 0.20) return "prep";
  if (pct < 0.75) return "growth";
  return "harvest-ready";
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function dayDiff(from: Date, to: Date) {
  return Math.floor((to.getTime() - from.getTime()) / 86_400_000);
}
function fmtLong(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
function fmtShort(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Date Detail Bottom Sheet ─────────────────────────────────────
const DateDetailSheet: React.FC<{
  date: Date; phase: Phase | null; weather: DayWeather;
  isStart: boolean; isEnd: boolean;
  onSetStart: () => void; onSetEnd: () => void; onClose: () => void;
}> = ({ date, phase, weather, isStart, isEnd, onSetStart, onSetEnd, onClose }) => {
  const labels: Record<WeatherKind, string> = { sunny: "Sunny & Clear", cloudy: "Partly Cloudy", rainy: "Rainy", windy: "Windy" };
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 duration-300">
        <div className="max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl px-5 pt-4 pb-8">
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Selected Date</p>
              <h3 className="text-lg font-bold text-slate-900">{fmtLong(date)}</h3>
              {phase && (
                <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${PHASE_STYLE[phase].labelBg} ${PHASE_STYLE[phase].labelText} uppercase tracking-wide`}>
                  {PHASE_STYLE[phase].label} Phase
                </span>
              )}
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><X size={18} className="text-slate-500" /></button>
          </div>
          <div className="flex items-center gap-2 mb-5 bg-slate-50 rounded-xl px-3 py-2.5">
            <WeatherIcon kind={weather.kind} size={18} /><span className="text-sm font-semibold text-slate-700">{labels[weather.kind]}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: <Thermometer size={18} className="text-rose-500" />, label: "Temperature", value: `${weather.temp}°C`, bg: "bg-rose-50" },
              { icon: <Droplets size={18} className="text-sky-500" />, label: "Rainfall", value: `${weather.rainfall} mm`, bg: "bg-sky-50" },
              { icon: <Waves size={18} className="text-teal-500" />, label: "Salinity", value: phase ? `${weather.salinity} g/L` : "—", bg: "bg-teal-50" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-3 flex flex-col items-center text-center`}>
                {s.icon}
                <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wide mt-1.5 mb-0.5">{s.label}</p>
                <p className="text-sm font-bold text-slate-900">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2.5">
            <button onClick={() => { onSetStart(); onClose(); }} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${isStart ? "bg-compass-100 text-compass-700 border-2 border-compass-300 cursor-default" : "bg-compass-600 text-white shadow-md shadow-compass-600/20 hover:bg-compass-700"}`}>
              {isStart ? <><CheckCircle2 size={15} />Already the Start Date</> : <><CalendarDays size={15} />Set as Start Date</>}
            </button>
            <button onClick={() => { onSetEnd(); onClose(); }} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${isEnd ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300 cursor-default" : "bg-white text-slate-700 border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50"}`}>
              {isEnd ? <><CheckCircle2 size={15} />Already the End Date</> : <><CalendarDays size={15} />Set as End Date</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Month Grid ───────────────────────────────────────────────────
const MonthGrid: React.FC<{ year: number; month: number; startDate: Date; endDate: Date; onDateClick: (d: Date) => void; }> = ({ year, month, startDate, endDate, onDateClick }) => {
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDOW = firstOfMonth.getDay();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDOW; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const today = new Date();
  const duration = dayDiff(startDate, endDate) + 1;
  const monthLabel = firstOfMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const DAY_HEADERS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <MapPin size={11} className="text-compass-500" />
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">{monthLabel}</p>
      </div>
      <div className="grid grid-cols-7 mb-0.5">
        {DAY_HEADERS.map(h => <div key={h} className="text-center text-[10px] font-bold text-slate-400 uppercase py-1">{h}</div>)}
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
          const wx = inRange ? mockDayData(diff, phase) : null;
          const style = phase ? PHASE_STYLE[phase] : null;
          const roundL = isStart || date.getDay() === 0;
          const roundR = isEnd || date.getDay() === 6;
          return (
            <button key={date.toISOString()} onClick={() => onDateClick(date)}
              className={`relative flex flex-col items-center py-1 min-h-[52px] transition-all active:brightness-95 ${inRange && style ? style.bg : ""} ${roundL && inRange ? "rounded-l-lg" : ""} ${roundR && inRange ? "rounded-r-lg" : ""} ${isStart ? "ring-2 ring-compass-400 ring-inset z-10" : ""} ${isEnd ? "ring-2 ring-emerald-400 ring-inset z-10" : ""}`}>
              {wx ? (
                <div className="flex flex-col items-center leading-none mb-0.5">
                  <WeatherIcon kind={wx.kind} size={11} />
                  <span className="text-[9px] text-slate-500 font-medium mt-px leading-none">{wx.temp}°</span>
                </div>
              ) : <div className="h-[18px]" />}
              <span className={`text-xs font-bold leading-none ${inRange && style ? style.text : "text-slate-400"} ${isToday ? "underline underline-offset-2" : ""}`}>{date.getDate()}</span>
              {inRange && phase && <span className={`w-1 h-1 rounded-full mt-0.5 ${PHASE_STYLE[phase].dot}`} />}
              {isStart && <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[7px] font-extrabold text-compass-700 bg-compass-100 px-1 py-px rounded whitespace-nowrap z-10">Start</span>}
              {isEnd && <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[7px] font-extrabold text-emerald-700 bg-emerald-100 px-1 py-px rounded whitespace-nowrap z-10">End</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const MultiMonthCalendar: React.FC<{ startDate: Date; endDate: Date; onDateClick: (d: Date) => void; }> = ({ startDate, endDate, onDateClick }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const months = useMemo(() => {
    const arr: { year: number; month: number; id: string }[] = [];
    for (let offset = -6; offset <= 6; offset++) {
      const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
      arr.push({ year: d.getFullYear(), month: d.getMonth(), id: `${d.getFullYear()}-${d.getMonth()}` });
    }
    return arr;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current.querySelector(`[data-month-id="month-${today.getFullYear()}-${today.getMonth()}"]`);
    if (el) (el as HTMLElement).scrollIntoView({ block: "start", behavior: "auto" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div>
      <div ref={scrollRef} className="max-h-[400px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
        {months.map(({ year, month, id }) => (
          <div key={id} data-month-id={`month-${id}`}>
            <MonthGrid year={year} month={month} startDate={startDate} endDate={endDate} onDateClick={onDateClick} />
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          {[{ color: "bg-amber-200", label: "Preparation" }, { color: "bg-emerald-200", label: "Growth" }, { color: "bg-teal-200", label: "Harvest Ready" }].map(l => (
            <div key={l.label} className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded-sm ${l.color}`} /><span className="text-[10px] text-slate-500 font-medium">{l.label}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Step 1: Plan Type ────────────────────────────────────────────
const StepPlanType: React.FC<{ value: PlanType | null; onChange: (v: PlanType) => void; onNext: () => void; }> = ({ value, onChange, onNext }) => {
  const options = [
    { id: "fresher" as PlanType, icon: Sprout, title: "Starting Fresh", description: "I'm preparing my beds from the very beginning of the season. I want a full plan from day one.", tag: "Fresher", tagColor: "bg-emerald-100 text-emerald-700" },
    { id: "mid-season" as PlanType, icon: CalendarDays, title: "Mid-Season Planning", description: "My beds are already set up and I'm planning a harvest mid-way through the season.", tag: "Mid-Season", tagColor: "bg-sky-100 text-sky-700" },
  ];
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4"><Sparkles size={28} className="text-emerald-600" /></div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">Where are you in the season?</h2>
      <p className="text-sm text-slate-500 mb-7 max-w-xs">This helps us tailor your harvest plan to exactly where you are right now.</p>
      <div className="w-full space-y-3 mb-8">
        {options.map(opt => {
          const Icon = opt.icon; const isSel = value === opt.id;
          return (
            <button key={opt.id} onClick={() => onChange(opt.id)} className={`w-full flex items-start gap-4 p-4 rounded-2xl text-left transition-all active:scale-[0.98] ${isSel ? "bg-compass-50 border-2 border-compass-500 shadow-md" : "bg-white border-2 border-slate-100 hover:border-compass-200 shadow-sm"}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${isSel ? "bg-compass-600 text-white" : "bg-slate-100 text-slate-500"}`}><Icon size={24} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className={`text-base font-semibold ${isSel ? "text-compass-800" : "text-slate-900"}`}>{opt.title}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${opt.tagColor}`}>{opt.tag}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{opt.description}</p>
              </div>
              {isSel && <CheckCircle2 size={20} className="text-compass-600 flex-shrink-0 mt-1" />}
            </button>
          );
        })}
      </div>
      <button onClick={onNext} disabled={!value} className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-semibold transition-all ${value ? "bg-compass-600 text-white shadow-lg shadow-compass-600/25 active:scale-[0.98]" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
        Continue <ArrowRight size={18} />
      </button>
    </div>
  );
};

// ─── Step 2: Bed Count ────────────────────────────────────────────
const StepBedCount: React.FC<{ value: number; onChange: (v: number) => void; onNext: () => void; }> = ({ value, onChange, onNext }) => {
  const presets = [5, 10, 15, 20, 25, 30];
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-4"><Grid3X3 size={28} className="text-amber-600" /></div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">How many beds are you harvesting?</h2>
      <p className="text-sm text-slate-500 mb-8 max-w-xs">Select the number of salt beds you'll be working on this season</p>
      <div className="grid grid-cols-3 gap-3 w-full mb-6">
        {presets.map(n => (
          <button key={n} onClick={() => onChange(n)} className={`py-4 rounded-xl text-lg font-bold transition-all active:scale-95 ${value === n ? "bg-compass-600 text-white shadow-lg shadow-compass-600/25 ring-2 ring-compass-300" : "bg-white text-slate-700 border border-slate-200 hover:border-compass-300 hover:bg-compass-50"}`}>{n}</button>
        ))}
      </div>
      <div className="flex items-center gap-2 w-full mb-8">
        <span className="text-sm text-slate-500 whitespace-nowrap">Or enter:</span>
        <input type="number" min={1} max={50} value={value || ""} onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v > 0 && v <= 50) onChange(v); }} placeholder="e.g. 15" className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-compass-400 focus:border-compass-400" />
      </div>
      <button onClick={onNext} disabled={!value} className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-semibold transition-all ${value ? "bg-compass-600 text-white shadow-lg shadow-compass-600/25 active:scale-[0.98]" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
        Continue <ArrowRight size={18} />
      </button>
    </div>
  );
};

// ─── Step 3: Duration + Interactive Calendar ──────────────────────
const StepDurationCalendar: React.FC<{
  bedCount: number; planType: PlanType; duration: Duration;
  onDurationChange: (d: Duration) => void;
  onNext: (startDate: Date, endDate: Date) => void;
}> = ({ bedCount, planType, duration, onDurationChange, onNext }) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const suggestedStart = useMemo(() => {
    const d = new Date(today);
    if (planType === "mid-season") d.setDate(d.getDate() + 3);
    return d;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planType]);
  const suggestedEnd = useMemo(() => {
    const d = new Date(suggestedStart); d.setDate(d.getDate() + duration - 1); return d;
  }, [suggestedStart, duration]);

  const [customStart, setCustomStart] = useState<Date | null>(null);
  const [customEnd, setCustomEnd] = useState<Date | null>(null);
  const activeStart = customStart ?? suggestedStart;
  const activeEnd = customEnd ?? suggestedEnd;
  const isCustomised = customStart !== null || customEnd !== null;
  const activeDuration = dayDiff(activeStart, activeEnd) + 1;
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDurationChange = (d: Duration) => { onDurationChange(d); setCustomEnd(null); };

  const handleSetStart = () => {
    if (!selectedDate) return;
    const ns = new Date(selectedDate);
    const ne = customEnd ?? suggestedEnd;
    if (ne <= ns) { const e = new Date(ns); e.setDate(e.getDate() + duration - 1); setCustomEnd(e); } else { setCustomEnd(ne); }
    setCustomStart(ns);
  };
  const handleSetEnd = () => {
    if (!selectedDate) return;
    const ne = new Date(selectedDate);
    const ns = customStart ?? suggestedStart;
    if (ne <= ns) { const s = new Date(ne); s.setDate(s.getDate() - duration + 1); setCustomStart(s); } else { setCustomStart(ns); }
    setCustomEnd(ne);
  };

  const selDiff = selectedDate ? dayDiff(activeStart, selectedDate) : 0;
  const selPhase: Phase | null = selectedDate && selDiff >= 0 && selDiff < activeDuration ? getPhase(selDiff, activeDuration) : null;
  const selWeather = selectedDate ? mockDayData(selDiff, selPhase) : null;

  return (
    <div className="flex flex-col">
      <ProfitBanner bedCount={bedCount} duration={activeDuration} workerCount={3} label={`Predicted Profit · ${activeDuration} Days`} />

      <p className="text-xs font-semibold text-slate-500 mb-2">Choose plan duration:</p>
      <div className="flex gap-2 mb-4">
        {([30, 45] as Duration[]).map(d => {
          const isActive = duration === d;
          return (
            <button key={d} onClick={() => handleDurationChange(d)} className={`flex-1 relative py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${isActive ? "bg-compass-600 text-white shadow-lg shadow-compass-600/25" : "bg-white text-slate-600 border-2 border-slate-200 hover:border-compass-300"}`}>
              {d} Days
              {d === 45 && <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap leading-none ${isActive ? "bg-white text-compass-700" : "bg-compass-600 text-white"}`}>Suggested</span>}
            </button>
          );
        })}
      </div>

      <div className="bg-compass-50 border border-compass-100 rounded-xl px-4 py-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-compass-600 uppercase tracking-wide">{isCustomised ? "Custom Plan" : "Suggested Plan"}</p>
          {isCustomised && (
            <button onClick={() => { setCustomStart(null); setCustomEnd(null); }} className="flex items-center gap-1 text-[10px] font-bold text-compass-700 bg-white border border-compass-200 px-2 py-1 rounded-lg hover:bg-compass-100 transition-colors">
              <RotateCcw size={10} />Use Suggested Plan
            </button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-center"><p className="text-[9px] text-slate-400 uppercase font-semibold mb-0.5">Start</p><p className="text-xs font-bold text-compass-800">{fmtShort(activeStart)}</p></div>
          <div className="flex-1 mx-3"><div className="w-full h-px bg-compass-200 relative"><span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-semibold text-compass-500 whitespace-nowrap">{activeDuration} days</span></div></div>
          <div className="text-center"><p className="text-[9px] text-slate-400 uppercase font-semibold mb-0.5">End</p><p className="text-xs font-bold text-emerald-700">{fmtShort(activeEnd)}</p></div>
        </div>
        {!isCustomised && <p className="text-[9px] text-compass-500 mt-2 text-center">Tap any date to view details or change start / end</p>}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 mb-6">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">Plan Calendar · Tap a date to explore</p>
        <MultiMonthCalendar startDate={activeStart} endDate={activeEnd} onDateClick={setSelectedDate} />
      </div>

      <button onClick={() => onNext(activeStart, activeEnd)} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-semibold bg-compass-600 text-white shadow-lg shadow-compass-600/25 active:scale-[0.98] transition-all">
        Confirm &amp; Continue <ArrowRight size={18} />
      </button>

      {selectedDate && selWeather && (
        <DateDetailSheet date={selectedDate} phase={selPhase} weather={selWeather} isStart={isSameDay(selectedDate, activeStart)} isEnd={isSameDay(selectedDate, activeEnd)} onSetStart={handleSetStart} onSetEnd={handleSetEnd} onClose={() => setSelectedDate(null)} />
      )}
    </div>
  );
};

// ─── Step 4: Worker Count ─────────────────────────────────────────
const StepWorkerCount: React.FC<{
  bedCount: number; duration: number;
  value: number; onChange: (v: number) => void; onNext: () => void;
}> = ({ bedCount, duration, value, onChange, onNext }) => {
  const productionPerBed = duration <= 30 ? 3 : 5;
  const totalBags = bedCount * productionPerBed;
  const pssRecommended = suggestedWorkerCount(totalBags);
  const presets = [2, 3, 4, 5, 6, 8];
  const isUsingPSS = value === pssRecommended;

  return (
    <div className="flex flex-col">
      <ProfitBanner bedCount={bedCount} duration={duration} workerCount={value || pssRecommended} label="Predicted Profit (updates live)" />

      <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
        <Users size={28} className="text-sky-600" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-1 text-center">
        How many workers are you planning to hire?
      </h2>
      <p className="text-sm text-slate-500 mb-5 text-center max-w-xs mx-auto">
        Include yourself if you'll be working on the beds
      </p>

      {/* PSS Suggestion chip */}
      <div className="bg-compass-50 border border-compass-100 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-compass-600" />
          <div>
            <p className="text-[10px] font-bold text-compass-700 uppercase tracking-wide">PSS Recommended</p>
            <p className="text-xs text-slate-600">
              <span className="font-bold text-compass-800">{pssRecommended} workers</span> for ~{totalBags} bags
            </p>
          </div>
        </div>
        {!isUsingPSS && (
          <button
            onClick={() => onChange(pssRecommended)}
            className="text-[10px] font-bold text-compass-700 bg-white border border-compass-200 px-2 py-1 rounded-lg hover:bg-compass-100 transition-colors"
          >
            Use This
          </button>
        )}
        {isUsingPSS && (
          <span className="text-[10px] font-bold text-compass-700 bg-compass-100 px-2 py-1 rounded-lg">
            ✓ Selected
          </span>
        )}
      </div>

      {/* Preset grid */}
      <div className="grid grid-cols-3 gap-3 w-full mb-5">
        {presets.map(n => (
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
              <span className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[7px] font-bold px-1 py-px rounded-full whitespace-nowrap leading-none ${value === n ? "bg-white text-compass-700" : "bg-compass-600 text-white"}`}>
                PSS
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Custom input */}
      <div className="flex items-center gap-2 w-full mb-6">
        <span className="text-sm text-slate-500 whitespace-nowrap">Or enter:</span>
        <input
          type="number" min={1} max={30}
          value={value || ""}
          onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1 && v <= 30) onChange(v); }}
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
        See Plan Summary <ArrowRight size={18} />
      </button>
    </div>
  );
};

// ─── Step 5: Plan Summary ─────────────────────────────────────────
const StepPlanSummary: React.FC<{
  plan: PlanData; onConfirm: () => void;
}> = ({ plan, onConfirm }) => {
  const duration = plan.duration ?? 45;
  const workers = plan.workerCount || 3;
  const computed = useMemo(() => computeProfit(plan.bedCount, duration, workers), [plan.bedCount, duration, workers]);

  const demandLevel = computed.totalBags <= 20 ? "High" : computed.totalBags <= 50 ? "Moderate" : "Strong";
  const demandColor = demandLevel === "High" ? "text-emerald-600 bg-emerald-50 border-emerald-100" : demandLevel === "Strong" ? "text-teal-600 bg-teal-50 border-teal-100" : "text-amber-600 bg-amber-50 border-amber-100";
  const demandNote = demandLevel === "High" ? "Buyers are actively looking — your salt will sell fast" : demandLevel === "Strong" ? "Plenty of demand — good season to sell in bulk" : "Steady market — plan your sales timing carefully";

  const startDate = new Date(plan.date + "T00:00:00");
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + duration - 1);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 bg-compass-50 rounded-2xl flex items-center justify-center flex-shrink-0">
          <ClipboardList size={24} className="text-compass-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Plan Summary</h2>
          <p className="text-xs text-slate-500">Review and confirm your harvest plan</p>
        </div>
      </div>

      {/* Profit hero */}
      <div className={`rounded-2xl p-4 mb-4 shadow-lg ${computed.profit >= 0 ? "bg-emerald-600 shadow-emerald-600/20" : "bg-red-600 shadow-red-600/20"}`}>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={13} className="text-white/70" />
          <p className="text-[11px] text-white/70 font-semibold uppercase tracking-wide">Estimated Profit</p>
        </div>
        <p className="text-2xl font-extrabold text-white">Rs. {computed.profit.toLocaleString()}</p>
        <p className="text-[11px] text-white/60 mt-0.5">~{computed.totalBags} bags across {plan.bedCount} beds · {duration}-day plan</p>
      </div>

      {/* Demand */}
      <div className={`flex items-center justify-between rounded-xl p-4 border mb-3 ${demandColor}`}>
        <div className="flex items-center gap-2">
          <BarChart2 size={18} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide opacity-70">Demand Forecast</p>
            <p className="text-sm font-bold">{demandLevel}</p>
            <p className="text-[10px] opacity-70 mt-0.5">{demandNote}</p>
          </div>
        </div>
      </div>

      {/* Sellers */}
      <p className="text-xs font-bold text-slate-700 mb-2">Recommended Sellers</p>
      <div className="space-y-2 mb-4">
        {SELLERS.map(seller => {
          const sellerProfit = computed.totalBags * seller.pricePerBag - computed.totalExpenses;
          return (
            <div key={seller.name} className={`rounded-xl p-3.5 border flex items-center justify-between ${seller.highlight ? "bg-compass-50 border-compass-200 ring-1 ring-compass-200" : "bg-white border-slate-100"}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{seller.name}</p>
                  {seller.highlight && <span className="text-[9px] font-bold bg-compass-600 text-white px-1.5 py-0.5 rounded uppercase">Best</span>}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-0.5"><Star size={10} className="text-amber-500 fill-amber-500" /><span className="text-[10px] text-slate-500 font-semibold">{seller.rating}</span></div>
                  <span className="text-[10px] text-slate-400">·</span>
                  <BadgeCheck size={10} className="text-slate-400" /><span className="text-[10px] text-slate-500">{seller.badge}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <p className="text-xs text-slate-500">Rs. {seller.pricePerBag.toLocaleString()}/bag</p>
                <p className={`text-sm font-bold ${sellerProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {sellerProfit >= 0 ? "+" : ""}Rs. {sellerProfit.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expenses */}
      <p className="text-xs font-bold text-slate-700 mb-2">Expense Breakdown</p>
      <div className="space-y-2 mb-4">
        {[
          { icon: <Banknote size={16} className="text-sky-500" />, label: "Carrying Cost", amount: computed.totalWages, detail: `${computed.totalBags} bags × Rs. ${CARRYING_COST_PER_BAG}/bag`, bg: "bg-sky-50" },
          { icon: <Users size={16} className="text-violet-500" />, label: "Refreshments", amount: computed.totalRefreshments, detail: `${workers} workers × Rs. ${REFRESHMENT_PER_DAY}/day × ${computed.workDays} day(s)`, bg: "bg-violet-50" },
        ].map(e => (
          <div key={e.label} className="bg-white rounded-xl p-3.5 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${e.bg}`}>{e.icon}</div>
              <div><p className="text-sm font-semibold text-slate-900">{e.label}</p><p className="text-[10px] text-slate-400 mt-0.5">{e.detail}</p></div>
            </div>
            <p className="text-sm font-bold text-slate-900 ml-3">Rs. {e.amount.toLocaleString()}</p>
          </div>
        ))}
        <div className="bg-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center"><Wallet size={16} className="text-white" /></div><p className="text-sm font-semibold text-white">Total Expenses</p></div>
          <p className="text-sm font-bold text-white">Rs. {computed.totalExpenses.toLocaleString()}</p>
        </div>
      </div>

      {/* Form data summary */}
      <p className="text-xs font-bold text-slate-700 mb-2">Your Inputs</p>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-6 space-y-2.5">
        {[
          { icon: <Sprout size={14} className="text-emerald-600" />, label: "Plan Type", value: plan.planType === "fresher" ? "Starting Fresh" : "Mid-Season" },
          { icon: <Grid3X3 size={14} className="text-amber-600" />, label: "Number of Beds", value: `${plan.bedCount} beds` },
          { icon: <CalendarDays size={14} className="text-sky-600" />, label: "Start Date", value: fmtShort(startDate) },
          { icon: <CalendarDays size={14} className="text-sky-600" />, label: "End Date", value: fmtShort(endDate) },
          { icon: <Package size={14} className="text-violet-600" />, label: "Plan Duration", value: `${duration} days` },
          { icon: <Users size={14} className="text-slate-600" />, label: "Workers", value: `${workers} workers` },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">{row.icon}<span className="text-xs text-slate-500 font-medium">{row.label}</span></div>
            <span className="text-xs font-bold text-slate-900">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Confirm button */}
      <button
        onClick={onConfirm}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-bold bg-compass-600 text-white shadow-xl shadow-compass-600/30 active:scale-[0.98] transition-all"
      >
        <CheckCircle2 size={20} />
        Confirm &amp; Create Plan
      </button>
      <p className="text-[10px] text-slate-400 text-center mt-2">
        Estimates based on current market rates · Actual results may vary
      </p>
    </div>
  );
};

// ─── Main Flow ────────────────────────────────────────────────────
export const PlanCreationFlow: React.FC<PlanCreationFlowProps> = ({
  onComplete,
  onBack,
}) => {
  const TOTAL_STEPS = 5;
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<PlanData>({
    bedCount: 0,
    planType: null,
    date: new Date().toISOString().split("T")[0],
    duration: 45,
    workerCount: 0,
  });

  const handleBack = () => {
    if (step === 0) onBack();
    else setStep(s => s - 1);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] max-w-md mx-auto px-5 pt-4 pb-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={handleBack} className="p-2 -ml-2 rounded-xl hover:bg-slate-100 active:scale-95 transition-all" aria-label="Go back">
          <ArrowLeft size={22} className="text-slate-700" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">{step + 1}/{TOTAL_STEPS}</span>
          <StepIndicator current={step} total={TOTAL_STEPS} />
        </div>
        <div className="w-10" />
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col justify-start animate-in fade-in slide-in-from-right-4 duration-300" key={step}>
        {step === 0 && (
          <StepPlanType
            value={plan.planType}
            onChange={v => setPlan(p => ({ ...p, planType: v }))}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <StepBedCount
            value={plan.bedCount}
            onChange={v => setPlan(p => ({ ...p, bedCount: v }))}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && plan.planType !== null && (
          <StepDurationCalendar
            bedCount={plan.bedCount}
            planType={plan.planType}
            duration={(plan.duration as Duration) ?? 45}
            onDurationChange={d => setPlan(p => ({ ...p, duration: d }))}
            onNext={(startDate, endDate) => {
              const finalDuration = dayDiff(startDate, endDate) + 1;
              setPlan(p => ({
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
            onChange={v => setPlan(p => ({ ...p, workerCount: v }))}
            onNext={() => setStep(4)}
          />
        )}
        {step === 4 && (
          <StepPlanSummary
            plan={plan}
            onConfirm={() => onComplete(plan)}
          />
        )}
      </div>
    </div>
  );
};
