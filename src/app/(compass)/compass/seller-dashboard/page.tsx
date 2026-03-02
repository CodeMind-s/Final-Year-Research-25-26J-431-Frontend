"use client";

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import {
  Home,
  Tag,
  Bell,
  Handshake,
  CircleUserRound,
  Menu,
  X,
  Compass,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  ChevronRight,
  MapPin,
  Pencil,
  EyeOff,
  Plus,
  LogOut,
  AlertTriangle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────

type OfferStatus = "DRAFT" | "PUBLISH" | "CLOSED";
type OfferRequirement = "HIGH" | "MEDIUM" | "LOW";
type RequestStatus = "PENDING" | "ACCEPTED" | "DECLINED";
type DealStatus = "PENDING" | "ACCEPTED" | "CLOSED" | "CANCELED";
type Tab = "home" | "offers" | "requests" | "deals" | "account";

interface DistributorOffer {
  id: string;
  pricePerBag: number;
  bagsNeeded: number;
  status: OfferStatus;
  requirement: OfferRequirement;
  bagsSecured: number;
  createdAt: number;
}

interface IncomingRequest {
  id: string;
  landownerName: string;
  landownerLocation: string;
  offeredBags: number;
  offeredPricePerBag: number;
  status: RequestStatus;
  createdAt: number;
  offerId: string;
}

interface DistributorDeal {
  id: string;
  landownerName: string;
  bags: number;
  pricePerBag: number;
  status: DealStatus;
  createdAt: number;
}

// ─── Config ───────────────────────────────────────────────────────

const DISTRIBUTOR_NAME = "Lanka Salt Limited";
const DISTRIBUTOR_LOCATION = "Colombo";

// ─── Seed data ────────────────────────────────────────────────────

const SEED_OFFERS: DistributorOffer[] = [
  { id: "off-1", pricePerBag: 1950, bagsNeeded: 200, status: "PUBLISH", requirement: "HIGH", bagsSecured: 80, createdAt: Date.now() - 86400000 * 3 },
];

const SEED_REQUESTS: IncomingRequest[] = [
  { id: "req-1", landownerName: "Ravi Kumara",  landownerLocation: "Puttalam",  offeredBags: 50, offeredPricePerBag: 1950, status: "PENDING",  createdAt: Date.now() - 3600000 * 2, offerId: "off-1" },
  { id: "req-2", landownerName: "Saman Perera", landownerLocation: "Chilaw",    offeredBags: 30, offeredPricePerBag: 1900, status: "PENDING",  createdAt: Date.now() - 3600000 * 5, offerId: "off-1" },
  { id: "req-3", landownerName: "Nimal Silva",  landownerLocation: "Kalpitiya", offeredBags: 60, offeredPricePerBag: 1950, status: "ACCEPTED", createdAt: Date.now() - 86400000,    offerId: "off-1" },
  { id: "req-4", landownerName: "K. Gunaratne", landownerLocation: "Mannar",    offeredBags: 20, offeredPricePerBag: 1800, status: "DECLINED", createdAt: Date.now() - 86400000 * 2, offerId: "off-1" },
];

const SEED_DEALS: DistributorDeal[] = [
  { id: "deal-1", landownerName: "Nimal Silva",    bags: 60, pricePerBag: 1950, status: "ACCEPTED", createdAt: Date.now() - 86400000 },
  { id: "deal-2", landownerName: "Ayesha Fonseka", bags: 20, pricePerBag: 1950, status: "CLOSED",   createdAt: Date.now() - 86400000 * 5 },
];

// ─── Helpers ──────────────────────────────────────────────────────

function timeAgo(ts: number, t: ReturnType<typeof useTranslations>) {
  const d = Date.now() - ts;
  if (d < 3600000)  return t('time.minAgo', { count: Math.floor(d / 60000) });
  if (d < 86400000) return t('time.hrAgo', { count: Math.floor(d / 3600000) });
  const days = Math.floor(d / 86400000);
  return days > 1 ? t('time.daysAgo', { count: days }) : t('time.dayAgo', { count: days });
}

// ─── Confirmation Dialog ──────────────────────────────────────────

const ConfirmDialog: React.FC<{
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ title, message, confirmLabel, cancelLabel, confirmColor = "bg-emerald-600", onConfirm, onCancel }) => (
  <>
    <div className="fixed inset-0 bg-black/40 z-50" onClick={onCancel} />
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl px-5 pt-5 pb-10 pointer-events-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-amber-500" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900">{title}</p>
            <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3.5 rounded-2xl text-sm font-bold bg-slate-100 text-slate-600 active:scale-95 transition-all">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={`flex-1 py-3.5 rounded-2xl text-sm font-bold text-white active:scale-95 transition-all ${confirmColor}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  </>
);

// ─── Publish Offer Form ───────────────────────────────────────────

const PublishOfferForm: React.FC<{
  initialPrice?: number;
  initialBags?: number;
  initialReq?: OfferRequirement;
  onPublish: (price: number, bags: number, req: OfferRequirement) => void;
  onCancel?: () => void;
  isEdit?: boolean;
  t: ReturnType<typeof useTranslations>;
  tc: (key: string) => string;
}> = ({ initialPrice = 1950, initialBags = 200, initialReq = "MEDIUM", onPublish, onCancel, isEdit, t, tc }) => {
  const [price, setPrice] = useState(initialPrice);
  const [bags, setBags] = useState(initialBags);
  const [req, setReq] = useState<OfferRequirement>(initialReq);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-base font-bold text-slate-900">{isEdit ? ` ${t('offer.editOffer')}` : `📢 ${t('offer.publishNew')}`}</p>
        {onCancel && (
          <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600">{tc('cancel')}</button>
        )}
      </div>

      <p className="text-sm text-slate-500 mb-5 leading-relaxed">
        {isEdit
          ? t('offer.editDesc')
          : t('offer.publishDesc')}
      </p>

      <div className="space-y-5 mb-6">
        {/* Price input */}
        <div className="bg-slate-50 rounded-2xl p-4">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
            {t('offer.youWillPay')}
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPrice(p => Math.max(500, p - 50))}
              className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-2xl flex items-center justify-center shadow-sm active:scale-95"
            >−</button>
            <div className="flex-1 text-center">
              <span className="text-4xl font-extrabold text-slate-900">Rs.{price.toLocaleString()}</span>
              <span className="block text-xs text-slate-400 mt-0.5 font-medium">{t('offer.perBag')}</span>
            </div>
            <button
              onClick={() => setPrice(p => p + 50)}
              className="w-12 h-12 rounded-xl bg-compass-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-compass-600/20 active:scale-95"
            >+</button>
          </div>
        </div>

        {/* Bags input */}
        <div className="bg-slate-50 rounded-2xl p-4">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
            {t('offer.bagsNeedToBuy')}
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setBags(b => Math.max(10, b - 10))}
              className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-2xl flex items-center justify-center shadow-sm active:scale-95"
            >−</button>
            <div className="flex-1 text-center">
              <span className="text-4xl font-extrabold text-slate-900">{bags}</span>
              <span className="block text-xs text-slate-400 mt-0.5 font-medium">{t('offer.bagsLabel')}</span>
            </div>
            <button
              onClick={() => setBags(b => b + 10)}
              className="w-12 h-12 rounded-xl bg-compass-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-compass-600/20 active:scale-95"
            >+</button>
          </div>
        </div>

        {/* Urgency */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">{t('offer.howUrgent')}</label>
          <div className="flex gap-2">
            {(["HIGH", "MEDIUM", "LOW"] as OfferRequirement[]).map(r => (
              <button
                key={r}
                onClick={() => setReq(r)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${req === r ? "border-compass-500 bg-compass-50 text-compass-700" : "border-slate-100 bg-white text-slate-400"}`}
              >
                {r === "HIGH" ? `🔴 ${t('offer.urgent')}` : r === "MEDIUM" ? `🟡 ${t('offer.normal')}` : `🟢 ${t('offer.relaxed')}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="bg-compass-50 rounded-2xl px-4 py-3 mb-5 flex justify-between items-center border border-compass-100">
        <div>
          <p className="text-xs text-compass-700 font-medium">{t('offer.totalSpend')}</p>
          <p className="text-xs text-compass-500 mt-0.5">{t('offer.ifAllFilled')}</p>
        </div>
        <p className="text-xl font-extrabold text-compass-800">Rs. {(price * bags).toLocaleString()}</p>
      </div>

      <button
        onClick={() => onPublish(price, bags, req)}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-compass-600 text-white text-base font-bold shadow-lg shadow-compass-600/20 active:scale-[0.98] transition-all"
      >
        <Send size={18} />
        {isEdit ? t('offer.updateOffer') : t('offer.publishToAll')}
      </button>
      <p className="text-xs text-slate-400 text-center mt-2">
        {t('offer.landownersNearby')}
      </p>
    </div>
  );
};

// ─── Active Offer Card ────────────────────────────────────────────

const ActiveOfferCard: React.FC<{
  offer: DistributorOffer;
  hasRequests: boolean;
  onClose: () => void;
  t: ReturnType<typeof useTranslations>;
  reqBadge: Record<OfferRequirement, { label: string; color: string }>;
}> = ({ offer, hasRequests, onClose, t, reqBadge }) => {
  const pct = offer.bagsNeeded > 0 ? Math.min(100, (offer.bagsSecured / offer.bagsNeeded) * 100) : 0;
  const remaining = Math.max(0, offer.bagsNeeded - offer.bagsSecured);
  const rb = reqBadge[offer.requirement];

  return (
    <div className="bg-compass-600 rounded-3xl p-5 text-white shadow-xl shadow-compass-600/30 relative overflow-hidden">
      {/* bg decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 rounded-xl px-3 py-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-white">{t('offer.activeOffer')}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rb.color}`}>{rb.label}</span>
          </div>
          <div className="flex gap-1.5">
            {/* Close button — only shown when no requests exist for this offer */}
            {!hasRequests && (
              <button onClick={onClose} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all" title={t('offer.endThisOffer')}>
                <EyeOff size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-6 mb-5">
          <div>
            <p className="text-3xl font-extrabold">Rs. {offer.pricePerBag.toLocaleString()}</p>
            <p className="text-xs text-white/60 mt-0.5">{t('offer.youPayPerBag')}</p>
          </div>
          <div className="w-px bg-white/20" />
          <div>
            <p className="text-3xl font-extrabold">{offer.bagsNeeded}</p>
            <p className="text-xs text-white/60 mt-0.5">{t('offer.bagsNeeded')}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white/15 rounded-2xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/70 font-medium">{t('offer.bagsFilled')}</span>
            <span className="font-bold">{pct.toFixed(0)}%</span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-white/60">
            <span>{t('offer.bagsSecured', { count: offer.bagsSecured })}</span>
            <span>{t('offer.bagsStillNeeded', { count: remaining })}</span>
          </div>
        </div>
        {/* Readonly note */}
        <p className="text-[10px] text-white/50 text-center mt-3">
          {hasRequests
            ? t('offer.cannotEndOffer')
            : t('offer.endOfferHint')}
        </p>
      </div>
    </div>
  );
};

// ─── Request Card ─────────────────────────────────────────────────

const RequestCard: React.FC<{
  req: IncomingRequest;
  onAccept: () => void;
  onDecline: () => void;
  t: ReturnType<typeof useTranslations>;
  reqCfg: Record<RequestStatus, { label: string; color: string; icon: React.ReactNode }>;
}> = ({ req, onAccept, onDecline, t, reqCfg }) => {
  const sc = reqCfg[req.status];
  const total = req.offeredBags * req.offeredPricePerBag;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-base font-bold text-slate-900">{req.landownerName}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={11} className="text-slate-400" />
            <span className="text-xs text-slate-400">{req.landownerLocation}</span>
          </div>
        </div>
        <div className="text-right">
          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${sc.color}`}>{sc.icon} {sc.label}</span>
          <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(req.createdAt, t)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: t('requests.bagsOffered'), value: `${req.offeredBags} ${t('offer.bagsLabel')}` },
          { label: t('requests.pricePerBag'),  value: `Rs. ${req.offeredPricePerBag.toLocaleString()}` },
          { label: t('requests.totalValue'),  value: `Rs. ${total.toLocaleString()}` },
        ].map(r => (
          <div key={r.label} className="bg-slate-50 rounded-xl px-2 py-2.5 text-center">
            <p className="text-[9px] text-slate-400 uppercase tracking-wide">{r.label}</p>
            <p className="text-xs font-bold text-slate-900 mt-0.5">{r.value}</p>
          </div>
        ))}
      </div>

      {req.status === "PENDING" && (
        <div className="flex gap-2">
          <button onClick={onDecline} className="flex-1 py-3 rounded-xl text-sm font-bold text-red-500 bg-red-50 border border-red-100 active:scale-95 transition-all">
            ✕  {t('requests.decline')}
          </button>
          <button onClick={onAccept} className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 shadow-md shadow-emerald-600/20 active:scale-95 transition-all">
            ✓  {t('requests.acceptDeal')}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Deal Card ────────────────────────────────────────────────────

const DealCard: React.FC<{
  deal: DistributorDeal;
  t: ReturnType<typeof useTranslations>;
  dealCfg: Record<DealStatus, { label: string; color: string }>;
}> = ({ deal, t, dealCfg }) => {
  const sc = dealCfg[deal.status];
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-base font-bold text-slate-900">{deal.landownerName}</p>
          <p className="text-xs text-slate-400">{timeAgo(deal.createdAt, t)}</p>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${sc.color}`}>{sc.label}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: t('deals.bagsLabel'), value: `${deal.bags}` },
          { label: t('deals.pricePerBag'), value: `Rs. ${deal.pricePerBag.toLocaleString()}` },
          { label: t('deals.total'), value: `Rs. ${(deal.bags * deal.pricePerBag).toLocaleString()}` },
        ].map(r => (
          <div key={r.label} className="bg-slate-50 rounded-xl px-2 py-2.5 text-center">
            <p className="text-[9px] text-slate-400 uppercase tracking-wide">{r.label}</p>
            <p className="text-xs font-bold text-slate-900 mt-0.5">{r.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────

export default function DistributorDashboard() {
  const t = useTranslations('seller');
  const tc = useTranslations('common');
  const tn = useTranslations('nav');

  const [tab, setTab] = useState<Tab>("home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [offers, setOffers] = useState<DistributorOffer[]>(SEED_OFFERS);
  const [requests, setRequests] = useState<IncomingRequest[]>(SEED_REQUESTS);
  const [deals, setDeals] = useState<DistributorDeal[]>(SEED_DEALS);
  const [dealsTab, setDealsTab] = useState<"active" | "done">("active");
  const [reqFilter, setReqFilter] = useState<RequestStatus | "ALL">("ALL");
  const [editingOffer, setEditingOffer] = useState(false);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);

  // Confirmation dialog state
  const [confirm, setConfirm] = useState<{
    title: string; message: string; confirmLabel: string; confirmColor?: string; onConfirm: () => void;
  } | null>(null);

  // ── Translated config maps (must be inside component for hooks) ──
  const reqBadge: Record<OfferRequirement, { label: string; color: string }> = {
    HIGH:   { label: t('offer.urgent'),  color: "bg-red-500/20 text-red-200" },
    MEDIUM: { label: t('offer.normal'),  color: "bg-yellow-500/20 text-yellow-200" },
    LOW:    { label: t('offer.relaxed'), color: "bg-green-500/20 text-green-200" },
  };

  const reqCfg: Record<RequestStatus, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING:  { label: t('requests.waitingStatus'),  color: "bg-amber-50 text-amber-600",   icon: <Clock size={10} /> },
    ACCEPTED: { label: t('requests.acceptedStatus'), color: "bg-emerald-50 text-emerald-600", icon: <CheckCircle2 size={10} /> },
    DECLINED: { label: t('requests.declinedStatus'), color: "bg-red-50 text-red-500",        icon: <XCircle size={10} /> },
  };

  const dealCfg: Record<DealStatus, { label: string; color: string }> = {
    PENDING:  { label: t('deals.pendingStatus'),   color: "bg-amber-50 text-amber-600" },
    ACCEPTED: { label: t('deals.activeStatus'),    color: "bg-emerald-50 text-emerald-600" },
    CLOSED:   { label: t('deals.closedStatus'),    color: "bg-slate-100 text-slate-500" },
    CANCELED: { label: t('deals.cancelledStatus'), color: "bg-red-50 text-red-500" },
  };

  const activeOffer = useMemo(() => offers.find(o => o.status === "PUBLISH") ?? null, [offers]);
  const pendingRequests = useMemo(() => requests.filter(r => r.status === "PENDING"), [requests]);
  const unreadCount = pendingRequests.length;

  const activeDeals = deals.filter(d => d.status === "PENDING" || d.status === "ACCEPTED");
  const doneDeals   = deals.filter(d => d.status === "CLOSED"   || d.status === "CANCELED");
  const filteredRequests = reqFilter === "ALL" ? requests : requests.filter(r => r.status === reqFilter);

  // ── Actions ────────────────────────────────────────────────────

  const handlePublish = (price: number, bags: number, req: OfferRequirement) => {
    setOffers(prev => [
      ...prev.filter(o => o.status !== "PUBLISH"),
      { id: `off-${Date.now()}`, pricePerBag: price, bagsNeeded: bags, status: "PUBLISH", requirement: req, bagsSecured: 0, createdAt: Date.now() },
    ]);
    setEditingOffer(false);
  };

  const handleCloseOffer = () => {
    setConfirm({
      title: t('confirm.removeOffer'),
      message: t('confirm.removeOfferMsg'),
      confirmLabel: t('confirm.yesRemove'),
      confirmColor: "bg-red-500",
      onConfirm: () => {
        setOffers(prev => prev.map(o => o.status === "PUBLISH" ? { ...o, status: "CLOSED" } : o));
        setConfirm(null);
      },
    });
  };

  const handleAccept = (reqId: string) => {
    const r = requests.find(x => x.id === reqId);
    if (!r) return;
    setConfirm({
      title: t('confirm.acceptDeal'),
      message: t('confirm.acceptDealMsg', { bags: r.offeredBags, name: r.landownerName, price: r.offeredPricePerBag.toLocaleString() }),
      confirmLabel: `✓ ${t('confirm.yesAccept')}`,
      confirmColor: "bg-emerald-600",
      onConfirm: () => {
        setRequests(prev => prev.map(x => x.id === reqId ? { ...x, status: "ACCEPTED" } : x));
        setDeals(prev => [{ id: `deal-${Date.now()}`, landownerName: r.landownerName, bags: r.offeredBags, pricePerBag: r.offeredPricePerBag, status: "ACCEPTED", createdAt: Date.now() }, ...prev]);
        setOffers(prev => prev.map(o => o.id === r.offerId ? { ...o, bagsSecured: o.bagsSecured + r.offeredBags } : o));
        setConfirm(null);
      },
    });
  };

  const handleDecline = (reqId: string) => {
    const r = requests.find(x => x.id === reqId);
    if (!r) return;
    setConfirm({
      title: t('confirm.declineRequest'),
      message: t('confirm.declineRequestMsg', { name: r.landownerName, bags: r.offeredBags }),
      confirmLabel: t('requests.decline'),
      confirmColor: "bg-red-500",
      onConfirm: () => {
        setRequests(prev => prev.map(x => x.id === reqId ? { ...x, status: "DECLINED" } : x));
        setConfirm(null);
      },
    });
  };

  // ── Side Drawer ────────────────────────────────────────────────

  type DrawerTab = Tab;
  const drawerItems: { id: DrawerTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "home",     label: tn('seller.home'),       icon: Home },
    { id: "offers",   label: tn('seller.myOffers'),   icon: Tag },
    { id: "requests", label: tn('seller.requests'),   icon: Bell, badge: unreadCount },
    { id: "deals",    label: tn('seller.myDeals'),    icon: Handshake },
    { id: "account",  label: tn('seller.myAccount'),  icon: CircleUserRound },
  ];

  // ── Tab pages ──────────────────────────────────────────────────

  const HomeTab = (
    <div className="px-4 pt-5 pb-6 space-y-5">

      {/* Summary chips */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-compass-600 rounded-2xl p-4 text-white relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
          <p className="text-xs text-white/60 font-medium">{t('activeDeals')}</p>
          <p className="text-3xl font-extrabold mt-1">{activeDeals.length}</p>
          <p className="text-[10px] text-white/50 mt-0.5">{t('dealsInProgress')}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-400 font-medium">{t('pendingRequests')}</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{unreadCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{t('waitingForReply')}</p>
        </div>
      </div>

      {/* Active offer or publish CTA */}
      {activeOffer && !editingOffer ? (
        <ActiveOfferCard
          offer={activeOffer}
          hasRequests={requests.some(r => r.offerId === activeOffer.id && (r.status === "PENDING" || r.status === "ACCEPTED"))}
          onClose={handleCloseOffer}
          t={t}
          reqBadge={reqBadge}
        />
      ) : (
        <PublishOfferForm
          initialPrice={activeOffer?.pricePerBag}
          initialBags={activeOffer?.bagsNeeded}
          initialReq={activeOffer?.requirement}
          isEdit={editingOffer}
          onPublish={handlePublish}
          onCancel={editingOffer ? () => setEditingOffer(false) : undefined}
          t={t}
          tc={tc}
        />
      )}

      {/* Replace offer option when offer is live */}
      {activeOffer && !editingOffer && (
        <button
          onClick={() => setShowReplaceConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm font-semibold text-slate-400 hover:bg-slate-50 transition-all"
        >
          <Plus size={16} /> {t('offer.replaceWithNew')}
        </button>
      )}

      {/* Recent requests */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-base font-bold text-slate-900">{t('requests.recentRequests')}</p>
          <button onClick={() => setTab("requests")} className="text-sm font-semibold text-compass-600 flex items-center gap-0.5">
            {t('requests.seeAll')} <ChevronRight size={14} />
          </button>
        </div>
        {pendingRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
            <Bell size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-400">{t('requests.noNewRequests')}</p>
            <p className="text-xs text-slate-300 mt-1">{t('requests.landowersCanSend')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.slice(0, 2).map(r => (
              <RequestCard key={r.id} req={r} onAccept={() => handleAccept(r.id)} onDecline={() => handleDecline(r.id)} t={t} reqCfg={reqCfg} />
            ))}
            {pendingRequests.length > 2 && (
              <button onClick={() => setTab("requests")} className="w-full text-sm font-semibold text-compass-600 py-2">
                {t('requests.moreWaiting', { count: pendingRequests.length - 2 })}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const OffersTab = (
    <div className="px-4 pt-5 pb-6 space-y-5">
      <h2 className="text-xl font-bold text-slate-900">{tn('seller.myOffers')}</h2>

      {activeOffer && !editingOffer ? (
        <>
          <ActiveOfferCard
            offer={activeOffer}
            hasRequests={requests.some(r => r.offerId === activeOffer.id && (r.status === "PENDING" || r.status === "ACCEPTED"))}
            onClose={handleCloseOffer}
            t={t}
            reqBadge={reqBadge}
          />
          <button onClick={() => setShowReplaceConfirm(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm font-semibold text-slate-400 hover:bg-slate-50 transition-all">
            <Plus size={16} /> {t('offer.replaceWithNew')}
          </button>
        </>
      ) : (
        <PublishOfferForm
          initialPrice={activeOffer?.pricePerBag}
          initialBags={activeOffer?.bagsNeeded}
          initialReq={activeOffer?.requirement}
          isEdit={editingOffer}
          onPublish={handlePublish}
          onCancel={editingOffer ? () => setEditingOffer(false) : undefined}
          t={t}
          tc={tc}
        />
      )}

      {/* Past offers */}
      {offers.filter(o => o.status !== "PUBLISH").length > 0 && (
        <div>
          <p className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wide">{t('offer.pastOffers')}</p>
          <div className="space-y-2">
            {offers.filter(o => o.status !== "PUBLISH").map(o => (
              <div key={o.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{t('offer.pricePerBagValue', { price: o.pricePerBag.toLocaleString() })}</p>
                  <p className="text-xs text-slate-400">{t('offer.bagsAndTime', { bags: o.bagsNeeded, time: timeAgo(o.createdAt, t) })}</p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">{t('offer.closedStatus')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const RequestsTab = (
    <div className="px-4 pt-5 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">{t('requests.title')}</h2>
        {unreadCount > 0 && (
          <span className="text-xs font-bold bg-red-500 text-white px-2.5 py-1 rounded-full">{t('requests.newBadge', { count: unreadCount })}</span>
        )}
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {(["ALL", "PENDING", "ACCEPTED", "DECLINED"] as const).map(f => (
          <button key={f} onClick={() => setReqFilter(f)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${reqFilter === f ? "bg-compass-600 text-white" : "bg-white border border-slate-200 text-slate-500"}`}>
            {f === "ALL" ? t('requests.all', { count: requests.length }) : f === "PENDING" ? t('requests.waiting', { count: requests.filter(r => r.status === "PENDING").length }) : f === "ACCEPTED" ? t('requests.accepted', { count: requests.filter(r => r.status === "ACCEPTED").length }) : t('requests.declined', { count: requests.filter(r => r.status === "DECLINED").length })}
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center mt-4">
          <Bell size={28} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-400">{t('requests.noRequests')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map(r => (
            <RequestCard key={r.id} req={r} onAccept={() => handleAccept(r.id)} onDecline={() => handleDecline(r.id)} t={t} reqCfg={reqCfg} />
          ))}
        </div>
      )}
    </div>
  );

  const DealsTab = (
    <div className="px-4 pt-5 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">{t('deals.title')}</h2>
        <div className="flex bg-slate-100 rounded-xl p-0.5">
          {(["active", "done"] as const).map(dt => (
            <button key={dt} onClick={() => setDealsTab(dt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${dealsTab === dt ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
              {dt === "active" ? t('deals.activeTab', { count: activeDeals.length }) : t('deals.doneTab', { count: doneDeals.length })}
            </button>
          ))}
        </div>
      </div>

      {(dealsTab === "active" ? activeDeals : doneDeals).length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
          <Package size={28} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-400">{t('deals.noDeals', { tab: dealsTab })}</p>
          {dealsTab === "active" && <p className="text-xs text-slate-300 mt-1">{t('deals.acceptToCreate')}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {(dealsTab === "active" ? activeDeals : doneDeals).map(d => <DealCard key={d.id} deal={d} t={t} dealCfg={dealCfg} />)}
        </div>
      )}
    </div>
  );

  const AccountTab = (
    <div className="flex flex-col items-center justify-center px-6 pt-16 pb-12 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <CircleUserRound size={28} className="text-slate-400" />
      </div>
      <h2 className="text-lg font-bold text-slate-900 mb-1">{t('account.title')}</h2>
      <p className="text-sm text-slate-500">{tc('comingSoon')}</p>
    </div>
  );

  // ── Bottom nav items (no account — that's in the hamburger) ────

  const bottomNav: { key: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: "home",     label: tn('seller.home'),     icon: Home },
    { key: "offers",   label: tn('seller.offers'),   icon: Tag },
    { key: "requests", label: tn('seller.requests'), icon: Bell,      badge: unreadCount },
    { key: "deals",    label: tn('seller.deals'),    icon: Handshake },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Sticky Header (same as landowner) ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <button onClick={() => setDrawerOpen(true)} className="p-2 -ml-2 rounded-xl hover:bg-slate-100 active:scale-95 transition-all">
            <Menu size={22} className="text-slate-700" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-compass-600 rounded-lg flex items-center justify-center">
              <Compass size={18} className="text-white" />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">BrineX</span>
          </div>
          {/* Badge button shortcut */}
          <button onClick={() => setTab("requests")} className="relative p-2 rounded-xl hover:bg-slate-100">
            <Bell size={20} className="text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* ── Page subtitle strip ── */}
      <div className="bg-white border-b border-slate-100 px-4 py-2.5 max-w-lg mx-auto">
        <p className="text-xs text-slate-400">{t('portalSubtitle', { name: DISTRIBUTOR_NAME })}</p>
      </div>

      {/* ── Tab Content ── */}
      <main className="pb-24 max-w-lg mx-auto">
        {tab === "home"     && HomeTab}
        {tab === "offers"   && OffersTab}
        {tab === "requests" && RequestsTab}
        {tab === "deals"    && DealsTab}
        {tab === "account"  && AccountTab}
      </main>

      {/* ── Bottom Nav (same style as landowner) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200" style={{ paddingBottom: "env(safe-area-inset-bottom,0px)" }}>
        <div className="flex items-stretch justify-around max-w-md mx-auto h-16">
          {bottomNav.map(({ key, label, icon: Icon, badge }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex flex-col items-center justify-center flex-1 gap-0.5 transition-all duration-200 active:scale-95 relative ${active ? "text-compass-600" : "text-slate-400 hover:text-slate-600"}`}
              >
                {badge && badge > 0 ? (
                  <span className="absolute top-2 right-[calc(50%-16px)] w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center z-10">{badge}</span>
                ) : null}
                <span className={`block w-5 h-0.5 rounded-full mb-1 transition-all duration-300 ${active ? "bg-compass-600 scale-x-100" : "bg-transparent scale-x-0"}`} />
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span className={`text-[10px] leading-tight transition-all duration-200 ${active ? "font-semibold" : "font-medium"}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Left Slide Drawer (same style as landowner's TopNavBar drawer) ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">

            {/* Drawer header */}
            <div className="flex items-center justify-between p-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-compass-600 rounded-xl flex items-center justify-center">
                  <Compass size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{tn('compass.brineXCompass')}</p>
                  <p className="text-[11px] text-slate-500">{tn('compass.distributorPortal')}</p>
                </div>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Nav items */}
            <div className="flex-1 overflow-y-auto py-3 px-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">{tn('compass.navigation')}</p>
              <nav className="space-y-1">
                {drawerItems.map(({ id, label, icon: Icon, badge }) => {
                  const active = tab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => { setTab(id); setDrawerOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${active ? "bg-compass-50 text-compass-700 shadow-sm" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors relative ${active ? "bg-compass-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                        <Icon size={18} />
                        {badge && badge > 0 ? (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">{badge}</span>
                        ) : null}
                      </div>
                      <span>{label}</span>
                      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-compass-600" />}
                    </button>
                  );
                })}
              </nav>

              <div className="my-4 border-t border-slate-100" />
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">{tn('compass.more')}</p>
              <nav className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 active:scale-[0.98] transition-all">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-red-50 text-red-500"><LogOut size={18} /></div>
                  <span>{tc('signOut')}</span>
                </button>
              </nav>
            </div>

            <div className="p-4 pt-3 border-t border-slate-100 space-y-3">
              <div className="flex justify-center">
                <LanguageSwitcher />
              </div>
              <p className="text-[11px] text-slate-400 text-center">{tn('compass.footerVersion')}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Replace offer confirmation ── */}
      {showReplaceConfirm && (
        <ConfirmDialog
          title={t('confirm.replaceOffer')}
          message={t('confirm.replaceOfferMsg')}
          confirmLabel={t('confirm.yesReplace')}
          cancelLabel={tc('cancel')}
          confirmColor="bg-compass-600"
          onConfirm={() => {
            setOffers(prev => prev.map(o => o.status === "PUBLISH" ? { ...o, status: "CLOSED" } : o));
            setEditingOffer(false);
            setShowReplaceConfirm(false);
          }}
          onCancel={() => setShowReplaceConfirm(false)}
        />
      )}

      {/* ── Generic confirmation dialog ── */}
      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          cancelLabel={tc('cancel')}
          confirmColor={confirm.confirmColor}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
