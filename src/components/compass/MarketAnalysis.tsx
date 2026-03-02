"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  TrendingUp,
  MapPin,
  Package,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  Send,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  PRICE_DATA,
  DEMAND_DATA,
  MOCK_DISTRIBUTORS,
  Distributor,
  MarketDeal,
  DealStatus,
} from "@/sample-data/compass/mockMarketData";

// ─── Distributor card ────────────────────────────────────────────

const DistributorCard: React.FC<{
  distributor: Distributor;
  rank: number;
  onSelect: () => void;
}> = ({ distributor, rank, onSelect }) => {
  const t = useTranslations('compass');
  const isRecommended = rank === 1;
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border-2 p-4 transition-all active:scale-[0.99] hover:shadow-md ${
        isRecommended
          ? "border-compass-300 bg-compass-50"
          : "border-slate-100 bg-white"
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">

          <p className="text-sm font-bold text-slate-900">{distributor.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={11} className="text-slate-400" />
            <span className="text-xs text-slate-400">{distributor.location}</span>
          </div>
        </div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${
          isRecommended ? "bg-compass-600 text-white" : "bg-slate-100 text-slate-500"
        }`}>#{rank}</div>
      </div>


      {/* Offer details */}
      <div className="flex items-center gap-3 mt-3">
        <div className="flex-1 bg-white rounded-xl border border-slate-100 px-3 py-2">
          <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">{t('market.offers')}</p>
          <p className="text-base font-extrabold text-slate-900">Rs. {distributor.offerPricePerBag.toLocaleString()}</p>
          <p className="text-[9px] text-slate-400">{t('market.perBag')}</p>
        </div>
        <div className="flex-1 bg-white rounded-xl border border-slate-100 px-3 py-2">
          <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">{t('market.needs')}</p>
          <p className="text-base font-extrabold text-slate-900">{distributor.bagsNeeded}</p>
          <p className="text-[9px] text-slate-400">{t('market.bags')}</p>
        </div>
        <div className="flex items-center gap-1 text-compass-600 flex-shrink-0">
          <span className="text-xs font-bold">{t('market.offer')}</span>
          <ChevronRight size={14} />
        </div>
      </div>
    </button>
  );
};

// ─── Request sheet ────────────────────────────────────────────────

const RequestSheet: React.FC<{
  distributor: Distributor;
  onClose: () => void;
  onSend: (bags: number, price: number) => void;
}> = ({ distributor, onClose, onSend }) => {
  const t = useTranslations('compass');
  const [bags, setBags] = useState(distributor.bagsNeeded);
  const [price, setPrice] = useState(distributor.offerPricePerBag);
  const totalValue = bags * price;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 duration-300">
        <div className="max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl px-5 pt-4 pb-10">
          {/* Handle */}
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />

          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">{t('market.makeRequestTo')}</p>
              <h3 className="text-lg font-bold text-slate-900">{distributor.name}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={11} className="text-slate-400" />
                <span className="text-xs text-slate-400">{distributor.location}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100">
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          {/* Their offer */}
          <div className="bg-compass-50 border border-compass-100 rounded-2xl p-3 mb-5">
            <p className="text-xs font-bold text-compass-700 mb-2">{t('market.theirOffer')}</p>
            <div className="flex gap-3">
              <div className="flex-1 bg-white rounded-xl px-3 py-2 border border-compass-100">
                <p className="text-[9px] text-slate-400 uppercase tracking-wide">{t('market.pricePerBag')}</p>
                <p className="text-base font-extrabold text-compass-700">Rs. {distributor.offerPricePerBag.toLocaleString()}</p>
              </div>
              <div className="flex-1 bg-white rounded-xl px-3 py-2 border border-compass-100">
                <p className="text-[9px] text-slate-400 uppercase tracking-wide">{t('market.bagsNeeded')}</p>
                <p className="text-base font-extrabold text-compass-700">{distributor.bagsNeeded}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{distributor.description}</p>
          </div>

          {/* Your request */}
          <p className="text-sm font-bold text-slate-900 mb-3">{t('market.yourCounterRequest')}</p>
          <div className="space-y-3 mb-5">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                {t('market.bagsYouCanOffer')}
              </label>
              <input
                type="number"
                min={1}
                max={9999}
                value={bags}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (!isNaN(v) && v > 0) setBags(v);
                }}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-lg font-bold text-slate-900 focus:outline-none focus:border-compass-400 focus:ring-2 focus:ring-compass-100 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                {t('market.yourPricePerBag')}
              </label>
              <input
                type="number"
                min={1}
                max={99999}
                value={price}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (!isNaN(v) && v > 0) setPrice(v);
                }}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-lg font-bold text-slate-900 focus:outline-none focus:border-compass-400 focus:ring-2 focus:ring-compass-100 transition-all"
              />
            </div>
          </div>

          {/* Total preview */}
          <div className="bg-slate-50 rounded-2xl px-4 py-3 mb-5 flex items-center justify-between">
            <p className="text-sm text-slate-500">{t('market.totalDealValue')}</p>
            <p className="text-lg font-extrabold text-slate-900">Rs. {totalValue.toLocaleString()}</p>
          </div>

          <button
            onClick={() => onSend(bags, price)}
            disabled={!bags || !price}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-compass-600 text-white text-sm font-bold shadow-lg shadow-compass-600/25 active:scale-[0.98] transition-all"
          >
            <Send size={16} />
            {t('market.sendRequest')}
          </button>
          <p className="text-xs text-slate-400 text-center mt-2">{t('market.distributorReview')}</p>
        </div>
      </div>
    </>
  );
};

// ─── Deal card ────────────────────────────────────────────────────

const DealCard: React.FC<{
  deal: MarketDeal;
  onAccept: () => void;
  onClose: () => void;
  onCancel: () => void;
}> = ({ deal, onAccept, onClose, onCancel }) => {
  const t = useTranslations('compass');

  const STATUS_CFG: Record<DealStatus, { label: string; color: string; icon: React.ReactNode }> = {
    DRAFT:    { label: t('market.draft'),    color: "bg-slate-100 text-slate-500",  icon: <Clock size={11} /> },
    PENDING:  { label: t('market.pending'),  color: "bg-amber-100 text-amber-700",  icon: <Clock size={11} /> },
    ACCEPTED: { label: t('market.accepted'), color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 size={11} /> },
    CLOSED:   { label: t('market.closed'),   color: "bg-blue-100 text-blue-700",    icon: <CheckCircle2 size={11} /> },
    CANCELED: { label: t('market.cancelled'), color: "bg-red-100 text-red-500",     icon: <XCircle size={11} /> },
  };

  const sc = STATUS_CFG[deal.status];
  const totalValue = deal.requestedBags * deal.requestedPricePerBag;

  const dealRows = [
    { label: t('market.bags'), value: deal.requestedBags.toString() },
    { label: t('market.pricePerBag'), value: `Rs. ${deal.requestedPricePerBag.toLocaleString()}` },
    { label: t('market.total'), value: `Rs. ${totalValue.toLocaleString()}` },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-slate-900">{deal.distributorName}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={10} className="text-slate-400" />
            <span className="text-xs text-slate-400">{deal.distributorLocation}</span>
          </div>
        </div>
        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${sc.color}`}>
          {sc.icon} {sc.label}
        </span>
      </div>

      {/* Numbers */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {dealRows.map((row) => (
          <div key={row.label} className="bg-slate-50 rounded-xl px-2 py-2 text-center">
            <p className="text-[9px] text-slate-400 uppercase tracking-wide">{row.label}</p>
            <p className="text-xs font-bold text-slate-900 mt-0.5">{row.value}</p>
          </div>
        ))}
      </div>

      {/* Actions — demo buttons to simulate distributor response */}
      {deal.status === "PENDING" && (
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-50 border border-red-100 active:scale-95 transition-all"
          >
            {t('market.cancel')}
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 active:scale-95 transition-all"
          >
            ✓ {t('market.simulateAccept')}
          </button>
        </div>
      )}
      {deal.status === "ACCEPTED" && (
        <div className="pt-2 border-t border-slate-100">
          <div className="bg-emerald-50 rounded-xl px-3 py-2 mb-2 text-center">
            <p className="text-xs font-bold text-emerald-700">{t('market.dealAcceptedReady')}</p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 active:scale-95 transition-all"
          >
            {t('market.markAsClosed')}
          </button>
        </div>
      )}
      {deal.status === "CLOSED" && (
        <div className="pt-2 border-t border-slate-100">
          <div className="bg-blue-50 rounded-xl px-3 py-2 text-center">
            <p className="text-xs font-bold text-blue-700">✅ {t('market.transactionComplete')}</p>
          </div>
        </div>
      )}
      {deal.status === "CANCELED" && (
        <div className="pt-2 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl px-3 py-2 text-center">
            <p className="text-xs text-slate-400">{t('market.dealCancelled')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main MarketAnalysis component ───────────────────────────────

export const MarketAnalysis: React.FC = () => {
  const t = useTranslations('compass');
  const [selectedDist, setSelectedDist] = useState<Distributor | null>(null);
  const [deals, setDeals] = useState<MarketDeal[]>([]);
  const [dealsTab, setDealsTab] = useState<"active" | "done">("active");

  const handleSendRequest = (bags: number, price: number) => {
    if (!selectedDist) return;
    const newDeal: MarketDeal = {
      id: `deal-${Date.now()}`,
      distributorId: selectedDist.id,
      distributorName: selectedDist.name,
      distributorLocation: selectedDist.location,
      offeredPricePerBag: selectedDist.offerPricePerBag,
      offeredBagsNeeded: selectedDist.bagsNeeded,
      requestedBags: bags,
      requestedPricePerBag: price,
      status: "PENDING",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setDeals((d) => [newDeal, ...d]);
    setSelectedDist(null);
  };

  const updateDealStatus = (id: string, status: DealStatus) => {
    setDeals((prev) =>
      prev.map((d) => d.id === id ? { ...d, status, updatedAt: Date.now() } : d)
    );
  };

  const activeDeals = deals.filter((d) => d.status === "PENDING" || d.status === "ACCEPTED");
  const doneDeals = deals.filter((d) => d.status === "CLOSED" || d.status === "CANCELED" || d.status === "DRAFT");

  const pssStats = [
    { label: t('market.currentPriceLabel'), value: t('market.currentPriceValue') },
    { label: t('market.expectedPeak'), value: t('market.expectedPeakValue') },
  ];

  return (
    <div className="flex flex-col px-4 pt-5 pb-28 max-w-lg mx-auto w-full">

      {/* ── PSS Recommendation ── */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-white shadow-xl shadow-indigo-200 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles size={14} className="text-indigo-200" />
            <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-wider">{t('market.pssRecommendation')}</p>
          </div>
          <h2 className="text-xl font-extrabold mb-2">{t('market.holdForWeeks')}</h2>
          <p className="text-indigo-100 text-sm leading-relaxed mb-4">
            {t('market.holdDescription')}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {pssStats.map((s) => (
              <div key={s.label} className="bg-white/15 rounded-xl px-3 py-2 backdrop-blur-sm">
                <p className="text-[9px] text-indigo-200 uppercase tracking-wide">{s.label}</p>
                <p className="text-sm font-bold text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Salt Distributors ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">{t('market.saltDistributors')}</h2>
          <span className="text-[10px] font-semibold text-compass-600 uppercase tracking-wide">{t('market.tapToOffer')}</span>
        </div>
        {/* Mobile: vertical list | Desktop: 2-col grid */}
        <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0">
          {MOCK_DISTRIBUTORS.map((dist, i) => (
            <DistributorCard
              key={dist.id}
              distributor={dist}
              rank={i + 1}
              onSelect={() => setSelectedDist(dist)}
            />
          ))}
        </div>
      </div>

      {/* ── My Deals ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">{t('market.myDeals')}</h2>
          <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5">
            {(["active", "done"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setDealsTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  dealsTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                {tab === "active" ? t('market.activeDealCount', { count: activeDeals.length }) : t('market.doneDealCount', { count: doneDeals.length })}
              </button>
            ))}
          </div>
        </div>

        {(dealsTab === "active" ? activeDeals : doneDeals).length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
            <Package size={28} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">
              {dealsTab === "active" ? t('market.noActiveDeals') : t('market.noCompletedDeals')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(dealsTab === "active" ? activeDeals : doneDeals).map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                onAccept={() => updateDealStatus(deal.id, "ACCEPTED")}
                onClose={() => updateDealStatus(deal.id, "CLOSED")}
                onCancel={() => updateDealStatus(deal.id, "CANCELED")}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Charts section ── */}
      <div className="space-y-4">

        {/* Price Trend */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp size={16} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">{t('market.priceTrend')}</p>
              <p className="text-xs text-slate-500">{t('market.priceTrendSub')}</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{t('market.yoyChange')}</span>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-3 ml-1">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 bg-emerald-500 rounded" />
              <span className="text-[10px] text-slate-500">{t('market.actual')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 bg-emerald-300 rounded border-dashed" style={{borderTop: '1px dashed #6ee7b7'}} />
              <span className="text-[10px] text-slate-500">{t('market.forecastLabel')}</span>
            </div>
          </div>

          <div className="h-48 w-full -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PRICE_DATA}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="42%" stopColor="#10b981" />
                    <stop offset="42%" stopColor="#6ee7b7" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} dy={8} />
                <YAxis hide domain={["dataMin - 150", "dataMax + 150"]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any, _: any, entry: any) => [
                    `Rs. ${Number(v).toLocaleString()}${entry?.payload?.isForecast ? ` ${t('market.forecastSuffix')}` : ""}`,
                    t('market.price'),
                  ]}
                  cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                />
                <ReferenceLine x="Feb" stroke="#6366f1" strokeDasharray="4 3" label={{ position: "top", value: t('market.now'), fill: "#6366f1", fontSize: 9, fontWeight: 700 }} />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="url(#priceGrad)"
                  strokeWidth={3}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (cx == null || cy == null) return <></>;                    return <circle key={`dot-p-${cx}`} cx={cx} cy={cy} r={4} fill={payload?.isForecast ? "#6ee7b7" : "#10b981"} stroke="#fff" strokeWidth={2} />;
                  }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400 text-center mt-1">
            {t('market.projectedPeak', {
              price: t('market.projectedPeakValue'),
              month: t('market.projectedPeakMonth'),
            })}
          </p>
        </div>

        {/* Market Demand */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp size={16} className="text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">{t('market.marketDemand')}</p>
              <p className="text-xs text-slate-500">{t('market.marketDemandSub')}</p>
            </div>
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">{t('market.highNow')}</span>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-3 ml-1">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-3 bg-orange-400 rounded-sm" />
              <span className="text-[10px] text-slate-500">{t('market.actual')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-3 bg-orange-200 rounded-sm" />
              <span className="text-[10px] text-slate-500">{t('market.forecastLabel')}</span>
            </div>
          </div>

          <div className="h-44 w-full -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMAND_DATA} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} dy={8} />
                <YAxis hide domain={[0, 110]} />
                <Tooltip
                  cursor={{ fill: "#fafafa" }}
                  contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any, _: any, entry: any) => [
                    `${v}${entry?.payload?.isForecast ? ` ${t('market.forecastSuffix')}` : ""}`,
                    t('market.demand'),
                  ]}
                />
                <ReferenceLine x="Feb" stroke="#6366f1" strokeDasharray="4 3" label={{ position: "top", value: t('market.now'), fill: "#6366f1", fontSize: 9, fontWeight: 700 }} />
                <Bar dataKey="demand" radius={[4, 4, 0, 0]}>
                  {DEMAND_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isForecast ? "#fdba74" : "#f97316"} fillOpacity={0.9} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400 text-center mt-1">
            {t('market.demandPeakExpected', {
              month: t('market.demandPeakMonth'),
            })}
          </p>
        </div>

      </div>

      {/* ── Request sheet ── */}
      {selectedDist && (
        <RequestSheet
          distributor={selectedDist}
          onClose={() => setSelectedDist(null)}
          onSend={handleSendRequest}
        />
      )}
    </div>
  );
};
