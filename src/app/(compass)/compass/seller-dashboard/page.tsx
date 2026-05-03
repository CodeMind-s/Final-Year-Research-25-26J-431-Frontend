"use client";

import React, { useState, useMemo, useEffect} from "react";
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
  EyeOff,
  Plus,
  LogOut,
  AlertTriangle,
  Pencil,
  Trash2,
  Building2,
  FileText,
  User,
  Mail,
  Phone,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { distributorOffersController } from "@/services/distributor-ffers.controller";
import { DistributorOfferObject } from "@/types/distributor-offers.types";
import { dealController } from "@/services/deal.controller";
import { DealObject } from "@/types/deals.types";
import { authController } from "@/services/auth.controller";
import { PersonalDetailsResponse } from "@/dtos/auth.dto";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────

type OfferRequirement = "HIGH" | "MEDIUM" | "LOW";
type RequestStatus = "PENDING" | "ACCEPTED" | "CANCELED" | "DRAFT";
type DealStatus = "PENDING" | "ACCEPTED" | "CLOSED" | "CANCELED";
type Tab = "home" | "offers" | "requests" | "deals" | "account";

// ─── Config ───────────────────────────────────────────────────────

const DISTRIBUTOR_NAME = "Lanka Salt Limited";

const REQ_CFG: Record<
  RequestStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Waiting",
    color: "bg-amber-100 text-amber-700",
    icon: <Clock size={11} />,
  },
  ACCEPTED: {
    label: "Accepted",
    color: "bg-emerald-100 text-emerald-700",
    icon: <CheckCircle2 size={11} />,
  },
  DRAFT: {
    label: "Pending",
    color: "bg-slate-100 text-slate-500",
    icon: <Clock size={11} />,
  },
  CANCELED: {
    label: "Declined",
    color: "bg-red-100 text-red-500",
    icon: <XCircle size={11} />,
  },
};

const DEAL_CFG: Record<DealStatus, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-amber-100 text-amber-700" },
  ACCEPTED: { label: "Active", color: "bg-emerald-100 text-emerald-700" },
  CLOSED: { label: "Closed", color: "bg-blue-100 text-blue-700" },
  CANCELED: { label: "Cancelled", color: "bg-red-100 text-red-500" },
};

const REQ_BADGE: Record<OfferRequirement, { label: string; color: string }> = {
  HIGH: { label: "Urgent", color: "bg-red-100 text-red-600" },
  MEDIUM: { label: "Normal", color: "bg-amber-100 text-amber-700" },
  LOW: { label: "Relaxed", color: "bg-slate-100 text-slate-500" },
};

// ─── Helpers ──────────────────────────────────────────────────────

function timeAgo(ts: number, t: ReturnType<typeof useTranslations>) {
  const d = Date.now() - ts;
  if (d < 3600000) return `${Math.floor(d / 60000)} min ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)} hr ago`;
  return `${Math.floor(d / 86400000)} day${Math.floor(d / 86400000) > 1 ? "s" : ""} ago`;
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
}> = ({
  title,
  message,
  confirmLabel,
  confirmColor = "bg-emerald-600",
  onConfirm,
  onCancel,
}) => (
  <>
    <div className="fixed inset-0 bg-black/40 z-50" onClick={onCancel} />
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl px-5 pt-5 pb-10 pointer-events-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-amber-500" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900">{title}</p>
            <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-2xl text-sm font-bold bg-slate-100 text-slate-600 active:scale-95 transition-all"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3.5 rounded-2xl text-sm font-bold text-white active:scale-95 transition-all ${confirmColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  </>
);

// ─── Publish Offer Form ───────────────────────────────────────────

const PublishOfferForm: React.FC<{
  offerId?: string;
  initialPrice?: number;
  initialBags?: number;
  initialReq?: OfferRequirement;
  onPublish: (price: number, bags: number, req: OfferRequirement) => Promise<void>;
  onCancel?: () => void;
  isEdit?: boolean;
  t: ReturnType<typeof useTranslations>;
  tc: ReturnType<typeof useTranslations>;
}> = ({
  offerId,
  initialPrice = 1950,
  initialBags = 200,
  initialReq = "MEDIUM",
  onPublish,
  onCancel,
  isEdit,
  t,
  tc,
}) => {
  const [price, setPrice] = useState(initialPrice);
  const [bags, setBags] = useState(initialBags);
  const [req, setReq] = useState<OfferRequirement>(initialReq);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    // Validation
    if (price < 500) {
      setError("Price must be at least Rs. 500 per bag");
      return;
    }
    if (bags < 10) {
      setError("Minimum quantity is 10 bags");
      return;
    }
    if (bags > 10000) {
      setError("Maximum quantity is 10,000 bags");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await onPublish(price, bags, req);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save offer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .number-input::-webkit-outer-spin-button,
        .number-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .number-input {
          -moz-appearance: textfield;
        }
      `}</style>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
        <p className="text-base font-bold text-slate-900">
          {isEdit ? ` ${t('offer.editOffer')}` : `📢 ${t('offer.publishNew')}`}
        </p>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            {tc('cancel')}
          </button>
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
              onClick={() => setPrice((p) => Math.max(500, p - 50))}
              className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-2xl flex items-center justify-center shadow-sm active:scale-95"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <div className="relative">
                <span className="text-xl font-extrabold text-slate-900 absolute left-0 top-1/2 -translate-y-1/2">
                  Rs.
                </span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setPrice(Math.max(0, val));
                  }}
                  className="number-input w-full text-4xl font-extrabold text-slate-900 bg-transparent text-center border-none outline-none focus:ring-2 focus:ring-compass-200 rounded-lg px-2 py-1"
                />
              </div>
              <span className="block text-xs text-slate-400 mt-0.5 font-medium">
                {t('offer.perBag')}
              </span>
            </div>
            <button
              onClick={() => setPrice((p) => p + 50)}
              className="w-12 h-12 rounded-xl bg-compass-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-compass-600/20 active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        {/* Bags input */}
        <div className="bg-slate-50 rounded-2xl p-4">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
            {t('offer.bagsNeedToBuy')}
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setBags((b) => Math.max(10, b - 10))}
              className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-2xl flex items-center justify-center shadow-sm active:scale-95"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <input
                type="number"
                value={bags}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setBags(Math.max(0, val));
                }}
                className="number-input w-full text-4xl font-extrabold text-slate-900 bg-transparent text-center border-none outline-none focus:ring-2 focus:ring-compass-200 rounded-lg px-2 py-1"
              />
              <span className="block text-xs text-slate-400 mt-0.5 font-medium">
                {t('offer.bagsLabel')}
              </span>
            </div>
            <button
              onClick={() => setBags((b) => b + 10)}
              className="w-12 h-12 rounded-xl bg-compass-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-compass-600/20 active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        {/* Urgency */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
            {t('offer.howUrgent')}
          </label>
          <div className="flex gap-2">
            {(["HIGH", "MEDIUM", "LOW"] as OfferRequirement[]).map((r) => (
              <button
                key={r}
                onClick={() => setReq(r)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${req === r ? "border-compass-500 bg-compass-50 text-compass-700" : "border-slate-100 bg-white text-slate-400"}`}
              >
                {r === "HIGH"
                  ? `🔴 ${t('offer.urgent')}`
                  : r === "MEDIUM"
                    ? `🟡 ${t('offer.normal')}`
                    : `🟢 ${t('offer.relaxed')}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="bg-compass-50 rounded-2xl px-4 py-3 mb-5 flex justify-between items-center border border-compass-100">
        <div>
          <p className="text-xs text-compass-700 font-medium">
            {t('offer.totalSpend')}
          </p>
          <p className="text-xs text-compass-500 mt-0.5">
            {t('offer.ifAllFilled')}
          </p>
        </div>
        <p className="text-xl font-extrabold text-compass-800">
          Rs. {(price * bags).toLocaleString()}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-compass-600 text-white text-base font-bold shadow-lg shadow-compass-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {isEdit ? t('offer.updateOffer') : t('offer.publishToAll')}
          </>
        ) : (
          <>
            <Send size={18} />
            {isEdit ? "Update Offer" : "Save as Draft"}
          </>
        )}
      </button>
      <p className="text-xs text-slate-400 text-center mt-2">
        {isEdit
          ? "Changes will be saved to your offer"
          : "You can publish your offer after creating it"}
      </p>
      </div>
    </>
  );
};

// ─── Active Offer Card ────────────────────────────────────────────

const ActiveOfferCard: React.FC<{
  offer: DistributorOfferObject;
  hasRequests: boolean;
  onClose: () => void;
  onEdit: () => void;
  onPublish: () => void;
  t: ReturnType<typeof useTranslations>;
}> = ({ offer, hasRequests, onClose, onEdit, onPublish, t }) => {
  const pct =
    offer.targetQuantity > 0
      ? Math.min(100, (offer.collectedQuantity / offer.targetQuantity) * 100)
      : 0;
  const remaining = Math.max(0, offer.targetQuantity - offer.collectedQuantity);
  const rb = REQ_BADGE[offer.requirement];
  const canModify = offer.collectedQuantity === 0;

  return (
    <div className="bg-compass-600 rounded-3xl p-5 text-white shadow-xl shadow-compass-600/30 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 rounded-xl px-3 py-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-white">
                {offer.status === "DRAFT" ? "Draft Offer" : "Active Offer"}
              </p>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rb.color}`}
            >
              {rb.label}
            </span>
          </div>
          {canModify && (
            <div className="flex gap-1.5">
              {/* Edit button */}
              <button
                onClick={onEdit}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
                title="Edit offer"
              >
                <Pencil size={14} />
              </button>
              {/* Delete button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
                title="Delete offer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-6 mb-5">
          <div>
            <p className="text-3xl font-extrabold">
              Rs. {offer?.pricePerKilo?.toLocaleString()}
            </p>
            <p className="text-xs text-white/60 mt-0.5">{t('offer.youPayPerBag')}</p>
          </div>
          <div className="w-px bg-white/20" />
          <div>
            <p className="text-3xl font-extrabold">{offer.targetQuantity}</p>
            <p className="text-xs text-white/60 mt-0.5">{t('offer.bagsNeeded')}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white/15 rounded-2xl p-4 mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/70 font-medium">
              {t('offer.bagsFilled')}
            </span>
            <span className="font-bold">{pct.toFixed(0)}%</span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/60">
            <span>{offer.collectedQuantity} bags secured</span>
            <span>{remaining} bags still needed</span>
          </div>
        </div>

        {/* Publish button for DRAFT offers */}
        {offer.status === "DRAFT" && (
          <button
            onClick={onPublish}
            className="w-full py-3.5 rounded-2xl bg-white text-compass-600 text-sm font-bold shadow-lg hover:bg-white/95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Send size={16} />
            Publish Offer
          </button>
        )}

        {/* Info note */}
        {!canModify && (
          <p className="text-[10px] text-white/50 text-center mt-3">
            Cannot modify — some bags are already secured
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Request Card ─────────────────────────────────────────────────

const RequestCard: React.FC<{
  req: DealObject;
  onAccept: () => void;
  onDecline: () => void;
  t: ReturnType<typeof useTranslations>;
}> = ({ req, onAccept, onDecline, t }) => {
  const sc = REQ_CFG[req.status as RequestStatus];

  // Safeguard in case status is not mapped
  if (!sc) {
    return null;
  }

  const total = req.quantity * req.pricePerKilo;
  const landownerName =
    req.landowner?.user?.email?.split("@")[0] || `Landowner${req.landowner?.user?.id?.slice(-6)}`;
  const landownerLocation =
    req.landowner?.landOwnerDetails?.address || "Unknown Location";
  const createdAtTimestamp = new Date(req.createdAt).getTime();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-base font-bold text-slate-900">{landownerName}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={11} className="text-slate-400" />
            <span className="text-xs text-slate-400">{landownerLocation}</span>
          </div>
        </div>
        <div className="text-right">
          <span
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${sc.color}`}
          >
            {sc.icon} {sc.label}
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {timeAgo(createdAtTimestamp, t)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "Bags offered", value: `${req.quantity} bags` },
          {
            label: "Price / bag",
            value: `Rs. ${req.pricePerKilo.toLocaleString()}`,
          },
          { label: "Total value", value: `Rs. ${total.toLocaleString()}` },
        ].map((r) => (
          <div
            key={r.label}
            className="bg-slate-50 rounded-xl px-2 py-2.5 text-center"
          >
            <p className="text-[9px] text-slate-400 uppercase tracking-wide">
              {r.label}
            </p>
            <p className="text-xs font-bold text-slate-900 mt-0.5">{r.value}</p>
          </div>
        ))}
      </div>

      {(req.status === "PENDING" || req.status === "DRAFT") && (
        <div className="flex gap-2">
          <button
            onClick={onDecline}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-red-500 bg-red-50 border border-red-100 active:scale-95 transition-all"
          >
            ✕ {t('requests.decline')}
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            ✓ {t('requests.acceptDeal')}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Deal Card ────────────────────────────────────────────────────

const DealCard: React.FC<{ 
  deal: DealObject;
  t: ReturnType<typeof useTranslations>;
}> = ({ deal, t }) => {
  const sc = DEAL_CFG[deal.status as DealStatus];
  const landownerName =
    deal.landowner?.user?.email?.split("@")[0] || "Unknown Landowner";
  const createdAtTimestamp = new Date(deal.createdAt).getTime();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-base font-bold text-slate-900">{landownerName}</p>
          <p className="text-xs text-slate-400">
            {timeAgo(createdAtTimestamp, t)}
          </p>
        </div>
        <span
          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${sc.color}`}
        >
          {sc.label}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Bags", value: `${deal.quantity}` },
          {
            label: "Price / bag",
            value: `Rs. ${deal.pricePerKilo.toLocaleString()}`,
          },
          {
            label: "Total",
            value: `Rs. ${(deal.quantity * deal.pricePerKilo).toLocaleString()}`,
          },
        ].map((r) => (
          <div
            key={r.label}
            className="bg-slate-50 rounded-xl px-2 py-2.5 text-center"
          >
            <p className="text-[9px] text-slate-400 uppercase tracking-wide">
              {r.label}
            </p>
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
  const [offers, setOffers] = useState<DistributorOfferObject[]>([]);
  const [requests, setRequests] = useState<DealObject[]>([]);
  const [deals, setDeals] = useState<DealObject[]>([]);
  const [dealsTab, setDealsTab] = useState<"active" | "done">("active");
  const [reqFilter, setReqFilter] = useState<RequestStatus | "ALL">("ALL");
  const [editingOffer, setEditingOffer] = useState(false);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const [, setIsLoadingOffers] = useState(false);
  const [, setIsLoadingDeals] = useState(false);
  const [profileData, setProfileData] = useState<PersonalDetailsResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchDistributorOffers = async () => {
    setIsLoadingOffers(true);
    try {
      const response = await distributorOffersController.getMyDistributorOffers(
        {
          page: 1,
          limit: 50, // Increased limit to include past offers
        },
      );

      if (Array.isArray(response)) {
        setOffers(response as unknown as DistributorOfferObject[]);
      } else if (response.success && Array.isArray(response.data)) {
        setOffers(response.data);
      } else {
        setOffers([]);
      }
    } catch (error) {
      console.error("Failed to fetch distributor offers:", error);
    } finally {
      setIsLoadingOffers(false);
    }
  };

  const fetchDistributorDeals = async () => {
    setIsLoadingDeals(true);
    try {
      const response = await dealController.getDistributorDeals({
        page: 1,
        limit: 20,
      });

      // Check if response is wrapped or direct array
      let dealsData: DealObject[] = [];
      if (Array.isArray(response)) {
        dealsData = response;
      } else if (response.success && response.data) {
        dealsData = response.data;
      }

      // Filter deals based on status:
      // - Requests: DRAFT, PENDING, ACCEPTED, or CANCELED (all request-related statuses)
      // - Deals: ACCEPTED, CLOSED, or CANCELED (finalized deals)
      const requestsData = dealsData.filter(
        (deal) =>
          deal.status === "DRAFT" ||
          deal.status === "PENDING" ||
          deal.status === "ACCEPTED" ||
          deal.status === "CANCELED",
      );
      const dealsDataFiltered = dealsData.filter(
        (deal) =>
          deal.status === "ACCEPTED" ||
          deal.status === "CLOSED" ||
          deal.status === "CANCELED",
      );

      setRequests(requestsData);
      setDeals(dealsDataFiltered);
    } catch (error) {
      console.error("Failed to fetch landowner deals:", error);
      console.error("Error details:", error);
    } finally {
      setIsLoadingDeals(false);
    }
  };

  useEffect(() => {
    fetchDistributorOffers();
    fetchDistributorDeals();
  }, []);

  const fetchProfileData = async () => {
    try {
      setProfileLoading(true);
      const data = await authController.getPersonalDetails();
      setProfileData(data);
    } catch (err) {
      console.error('Failed to fetch profile data:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Fetch profile when account tab is opened
  useEffect(() => {
    if (tab === 'account' && !profileData) {
      fetchProfileData();
    }
  }, [tab]);

  // Confirmation dialog state
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    confirmColor?: string;
    onConfirm: () => void;
  } | null>(null);

  const activeOffer = useMemo(
    () => {
      // First try to find a PUBLISH offer (active), then DRAFT
      const publishedOffer = offers.find((o) => o.status === "PUBLISH");
      if (publishedOffer) return publishedOffer;
      return offers.find((o) => o.status === "DRAFT") ?? null;
    },
    [offers],
  );
  const pendingRequests = useMemo(
    () =>
      requests.filter((r) => r.status === "PENDING" || r.status === "DRAFT"),
    [requests],
  );
  const unreadCount = pendingRequests.length;

  const activeDeals = deals.filter((d) => d.status === "ACCEPTED");
  const doneDeals = deals.filter(
    (d) => d.status === "CLOSED" || d.status === "CANCELED",
  );
  const filteredRequests =
    reqFilter === "ALL"
      ? requests
      : reqFilter === "PENDING"
        ? requests.filter((r) => r.status === "PENDING" || r.status === "DRAFT")
        : requests.filter((r) => r.status === reqFilter);

  // ── Actions ────────────────────────────────────────────────────

  const handleLogout = () => {
    authController.logout();
    window.location.href = "/compass";
  };

  const handlePublish = async (
    price: number,
    bags: number,
    req: OfferRequirement,
  ) => {
    try {
      if (editingOffer && activeOffer) {
        // Update existing offer
        await distributorOffersController.updateDistributorOffer(
          activeOffer._id,
          {
            pricePerKilo: price,
            targetQuantity: bags,
            totalInvestment: price * bags,
            requirement: req,
          },
        );
      } else {
        // Create new offer with DRAFT status
        await distributorOffersController.createDistributorOffer({
          pricePerKilo: price,
          targetQuantity: bags,
          totalInvestment: price * bags,
          requirement: req,
        });
      }
      await fetchDistributorOffers();
      setEditingOffer(false);
    } catch (error) {
      console.error("Failed to save distributor offer:", error);
      throw error;
    }
  };

  const handleEdit = () => {
    setEditingOffer(true);
  };

  const handlePublishOffer = async () => {
    if (!activeOffer) return;
    
    try {
      await distributorOffersController.updateDistributorOffer(
        activeOffer._id,
        { status: "PUBLISH" },
      );
      await fetchDistributorOffers();
    } catch (error) {
      console.error("Failed to publish offer:", error);
      alert("Failed to publish the offer. Please try again.");
    }
  };

  const handleCloseOffer = () => {
    if (!activeOffer) return;

    setConfirm({
      title: "Close this offer?",
      message:
        "This offer will be closed and moved to your history. You can create a new offer afterwards.",
      confirmLabel: "Yes, Close",
      confirmColor: "bg-red-500",
      onConfirm: async () => {
        try {
          await distributorOffersController.updateDistributorOffer(
            activeOffer._id,
            { status: "CLOSED" },
          );
          await fetchDistributorOffers();
          setConfirm(null);
        } catch (error) {
          console.error("Failed to close offer:", error);
          alert("Failed to close the offer. Please try again.");
        }
      },
    });
  };

  const handleAccept = (reqId: string) => {
    const r = requests.find((x) => x._id === reqId);
    if (!r) return;
    const landownerName =
      r.landowner?.user?.email?.split("@")[0] || "Landowner";
    setConfirm({
      title: "Accept this deal?",
      message: `You are agreeing to buy ${r.quantity} bags from ${landownerName} at Rs. ${r.pricePerKilo.toLocaleString()} each.`,
      confirmLabel: "✓ Yes, Accept",
      confirmColor: "bg-emerald-600",
      onConfirm: async () => {
        try {
          await dealController.updateDeals({ status: "ACCEPTED" }, reqId);

          // Refetch data to get updated statuses from backend
          await fetchDistributorDeals();
          await fetchDistributorOffers();

          setConfirm(null);
        } catch (error) {
          console.error("Failed to accept deal:", error);
          alert("Failed to accept the deal. Please try again.");
        }
      },
    });
  };

  const handleDecline = (reqId: string) => {
    const r = requests.find((x) => x._id === reqId);
    if (!r) return;
    const landownerName =
      r.landowner?.user?.email?.split("@")[0] || "Landowner";
    setConfirm({
      title: "Decline this request?",
      message: `${landownerName}'s offer of ${r.quantity} bags will be declined. They will be notified.`,
      confirmLabel: "Decline",
      confirmColor: "bg-red-500",
      onConfirm: async () => {
        try {
          await dealController.updateDeals({ status: "CANCELED" }, reqId);

          // Refetch data to get updated statuses from backend
          await fetchDistributorDeals();

          setConfirm(null);
        } catch (error) {
          console.error("Failed to decline deal:", error);
          alert("Failed to decline the deal. Please try again.");
        }
      },
    });
  };

  // ── Side Drawer ────────────────────────────────────────────────

  type DrawerTab = Tab;
  const drawerItems: {
    id: DrawerTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "offers", label: "My Offers", icon: Tag },
    { id: "requests", label: "Requests", icon: Bell, badge: unreadCount },
    { id: "deals", label: "My Deals", icon: Handshake },
    { id: "account", label: "My Account", icon: CircleUserRound },
  ];

  // ── Tab pages ──────────────────────────────────────────────────

  const HomeTab = (
    <div className="px-4 pt-5 pb-6 space-y-5">
      {/* Summary chips */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-compass-600 rounded-2xl p-4 text-white relative overflow-hidden">
          <p className="text-xs text-white/60 font-medium">{t('activeDeals')}</p>
          <p className="text-3xl font-extrabold mt-1">{activeDeals.length}</p>
          <p className="text-[10px] text-white/50 mt-0.5">{t('dealsInProgress')}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-400 font-medium">{t('pendingRequests')}</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">
            {unreadCount}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {t('waitingForReply')}
          </p>
        </div>
      </div>

      {/* Active offer or publish CTA */}
      {activeOffer && !editingOffer ? (
        <ActiveOfferCard
          offer={activeOffer}
          hasRequests={requests.some(
            (r) =>
              r.offerId === activeOffer._id &&
              (r.status === "PENDING" || r.status === "DRAFT"),
          )}
          onClose={handleCloseOffer}
          onEdit={handleEdit}
          onPublish={handlePublishOffer}
          t={t}
        />
      ) : (
        <PublishOfferForm
          offerId={activeOffer?._id}
          initialPrice={activeOffer?.pricePerKilo}
          initialBags={activeOffer?.targetQuantity}
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
          <button
            onClick={() => setTab("requests")}
            className="text-sm font-semibold text-compass-600 flex items-center gap-0.5"
          >
            {t('requests.seeAll')} <ChevronRight size={14} />
          </button>
        </div>
        {pendingRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
            <Bell size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-400">
              {t('requests.noNewRequests')}
            </p>
            <p className="text-xs text-slate-300 mt-1">
              {t('requests.landowersCanSend')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.slice(0, 2).map((r) => (
              <RequestCard
                key={r._id}
                req={r}
                onAccept={() => handleAccept(r._id)}
                onDecline={() => handleDecline(r._id)}
                t={t}
              />
            ))}
            {pendingRequests.length > 2 && (
              <button
                onClick={() => setTab("requests")}
                className="w-full text-sm font-semibold text-compass-600 py-2"
              >
                +{pendingRequests.length - 2} more waiting for reply →
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
            hasRequests={requests.some(
              (r) =>
                r.offerId === activeOffer._id &&
                (r.status === "PENDING" || r.status === "DRAFT"),
            )}
            onClose={handleCloseOffer}
            onEdit={handleEdit}
            onPublish={handlePublishOffer}
            t={t}
          />
          <button
            onClick={() => setShowReplaceConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm font-semibold text-slate-400 hover:bg-slate-50 transition-all"
          >
            <Plus size={16} /> {t('offer.replaceWithNew')}
          </button>
        </>
      ) : (
        <PublishOfferForm
          offerId={activeOffer?._id}
          initialPrice={activeOffer?.pricePerKilo}
          initialBags={activeOffer?.targetQuantity}
          initialReq={activeOffer?.requirement}
          isEdit={editingOffer}
          onPublish={handlePublish}
          onCancel={editingOffer ? () => setEditingOffer(false) : undefined}
          t={t}
          tc={tc}
        />
      )}

      {/* Recent offers (readonly) */}
      <div>
        <p className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wide">
          {t('offer.pastOffers')}
        </p>
        {offers.filter((o) => o._id !== activeOffer?._id).length > 0 ? (
          <div className="space-y-2">
            {offers
              .filter((o) => o._id !== activeOffer?._id)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((o) => (
                <div
                  key={o._id}
                  className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex items-center justify-between opacity-75"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Rs. {o.pricePerKilo.toLocaleString()} / bag
                    </p>
                    <p className="text-xs text-slate-400">
                      {o.targetQuantity} bags · {o.collectedQuantity} bags collected ·{" "}
                      {timeAgo(new Date(o.createdAt).getTime(), t)}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-200 text-slate-600">
                    {o.status === "CLOSED" ? "Closed" : o.status === "PUBLISH" ? "Published" : "Archived"}
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-center">
            <p className="text-sm text-slate-400">No past offers yet</p>
            <p className="text-xs text-slate-300 mt-1">
              Your closed offers will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const RequestsTab = (
    <div className="px-4 pt-5 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">{t('requests.title')}</h2>
        {unreadCount > 0 && (
          <span className="text-xs font-bold bg-red-500 text-white px-2.5 py-1 rounded-full">
            {unreadCount} new
          </span>
        )}
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {(["ALL", "PENDING", "ACCEPTED", "CANCELED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setReqFilter(f)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${reqFilter === f ? "bg-compass-600 text-white" : "bg-white border border-slate-200 text-slate-500"}`}
          >
            {f === "ALL"
              ? `All (${requests.length})`
              : f === "PENDING"
                ? `Waiting (${requests.filter((r) => r.status === "PENDING" || r.status === "DRAFT").length})`
                : f === "ACCEPTED"
                  ? `Accepted (${requests.filter((r) => r.status === "ACCEPTED").length})`
                  : `Declined (${requests.filter((r) => r.status === "CANCELED").length})`}
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center mt-4">
          <Bell size={28} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-400">
            {t('requests.noRequests')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((r) => (
            <RequestCard
              key={r._id}
              req={r}
              onAccept={() => handleAccept(r._id)}
              onDecline={() => handleDecline(r._id)}
              t={t}
            />
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
          {(["active", "done"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setDealsTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${dealsTab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            >
              {t === "active"
                ? `Active (${activeDeals.length})`
                : `Done (${doneDeals.length})`}
            </button>
          ))}
        </div>
      </div>

      {(dealsTab === "active" ? activeDeals : doneDeals).length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
          <Package size={28} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-400">
            No {dealsTab} deals yet
          </p>
          {dealsTab === "active" && (
            <p className="text-xs text-slate-300 mt-1">
              {t('deals.acceptToCreate')}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {(dealsTab === "active" ? activeDeals : doneDeals).map((d) => (
            <DealCard key={d._id} deal={d} t={t} />
          ))}
        </div>
      )}
    </div>
  );

  const AccountTab = profileLoading ? (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-center px-6 pt-16 pb-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-red-600" />
          <p className="text-sm text-slate-500">{tc('loading')}</p>
        </div>
      </div>
    </div>
  ) : !profileData ? (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col items-center justify-center px-6 pt-16 pb-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <CircleUserRound size={28} className="text-slate-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">{t('account.title')}</h2>
        <p className="text-sm text-slate-500 mb-4">{t('account.failedToLoad')}</p>
        <button
          onClick={fetchProfileData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold active:scale-95 transition-all"
        >
          {tc('retry')}
        </button>
      </div>
    </div>
  ) : (
    <div className="max-w-2xl mx-auto px-4 pt-5 pb-6 space-y-4">
      {/* Profile Header */}
      <div className="bg-linear-to-r from-compass-600 to-compass-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Building2 size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold">{profileData.distributorDetails?.companyName || t('account.distributorProfile')}</h2>
              {profileData.user.isVerified && (
                <CheckCircle size={14} className="text-green-300" />
              )}
            </div>
            <p className="text-white/80 text-xs">{profileData.user.role}</p>
          </div>
        </div>
        {profileData.user.plan && (
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 bg-white/15 backdrop-blur-sm rounded-xl">
              <p className="text-sm font-bold capitalize">{profileData.user.plan} {t('account.planLabel')}</p>
            </div>
            {profileData.user.isSubscribed && (
              <div className="px-3 py-2 bg-green-500/20 border border-green-300/30 rounded-xl">
                <p className="text-xs font-bold text-green-200">{t('account.active')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Account Information Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <User size={16} className="text-compass-600" />
          {t('account.accountInfo')}
        </h3>
        <div className="space-y-3">
          {/* Email */}
          {profileData.user.email && (
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Mail size={16} className="text-slate-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">{t('account.email')}</p>
                <p className="text-sm font-medium text-slate-800 wrap-break-word">
                  {profileData.user.email}
                </p>
              </div>
            </div>
          )}

          {/* Phone */}
          {profileData.user.phone && (
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Phone size={16} className="text-slate-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">{t('account.phone')}</p>
                <p className="text-sm font-medium text-slate-800">
                  {profileData.user.phone}
                </p>
              </div>
            </div>
          )}

          {/* Status Badges */}
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
            <CheckCircle size={16} className="text-slate-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">{t('account.status')}</p>
              <div className="flex flex-wrap gap-2">
                {profileData.user.isOnboarded && (
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">
                    {t('account.onboarded')}
                  </span>
                )}
                {profileData.user.isTrialActive && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                    {t('account.trialActive')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Details Card */}
      {profileData.distributorDetails && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Building2 size={16} className="text-compass-600" />
            {t('account.companyDetails')}
          </h3>
          <div className="space-y-3">
            {/* Company Name */}
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">
                {t('account.companyName')}
              </p>
              <p className="text-sm font-medium text-slate-800">
                {profileData.distributorDetails.companyName}
              </p>
            </div>

            {/* Registration Number */}
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <FileText size={16} className="text-slate-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">
                  {t('account.registrationNumber')}
                </p>
                <p className="text-sm font-medium text-slate-800 break-all">
                  {profileData.distributorDetails.registrationNumber}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <MapPin size={16} className="text-slate-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">
                  {t('account.address')}
                </p>
                <p className="text-sm font-medium text-slate-800 leading-relaxed">
                  {profileData.distributorDetails.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-all active:scale-95"
      >
        <LogOut size={18} />
        {tc('logout')}
      </button>
    </div>
  );

  // ── Bottom nav items (no account — that's in the hamburger) ────

  const bottomNav: {
    key: Tab;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    { key: "home", label: "Home", icon: Home },
    { key: "offers", label: "Offers", icon: Tag },
    { key: "requests", label: "Requests", icon: Bell, badge: unreadCount },
    { key: "deals", label: "Deals", icon: Handshake },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Sticky Header (same as landowner) ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 -ml-2 rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
          >
            <Menu size={22} className="text-slate-700" />
          </button>
          <div className="flex items-center gap-2">
            {/* Center: App logo / title */}
                      <div className="flex items-center gap-2">
                        <Image src={'/assets/images/logo.svg'} alt='brinex logo' width={100} height={50} />
                      </div>
          </div>
          {/* Badge button shortcut */}
          <button
            onClick={() => setTab("requests")}
            className="relative p-2 rounded-xl hover:bg-slate-100"
          >
            <Bell size={20} className="text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Page subtitle strip ── */}
      {/* <div className="bg-white border-b border-slate-100 px-4 py-2.5 max-w-lg mx-auto">
        <p className="text-xs text-slate-400">
          Salt Distributor Portal · {DISTRIBUTOR_NAME}
        </p>
      </div> */}

      {/* ── Tab Content ── */}
      <main className="pb-24 max-w-lg mx-auto">
        {tab === "home" && HomeTab}
        {tab === "offers" && OffersTab}
        {tab === "requests" && RequestsTab}
        {tab === "deals" && DealsTab}
        {tab === "account" && AccountTab}
      </main>

      {/* ── Bottom Nav (same style as landowner) ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200"
        style={{ paddingBottom: "env(safe-area-inset-bottom,0px)" }}
      >
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
                  <span className="absolute top-2 right-[calc(50%-16px)] w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center z-10">
                    {badge}
                  </span>
                ) : null}
                <span
                  className={`block w-5 h-0.5 rounded-full mb-1 transition-all duration-300 ${active ? "bg-compass-600 scale-x-100" : "bg-transparent scale-x-0"}`}
                />
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span
                  className={`text-[10px] leading-tight transition-all duration-200 ${active ? "font-semibold" : "font-medium"}`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Left Slide Drawer (same style as landowner's TopNavBar drawer) ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            {/* Drawer header */}
            <div className="flex items-center justify-between p-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-compass-600 rounded-xl flex items-center justify-center">
                  <Compass size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {tn('compass.brineXCompass')}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {tn('compass.distributorPortal')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Nav items */}
            <div className="flex-1 overflow-y-auto py-3 px-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                {tn('compass.navigation')}
              </p>
              <nav className="space-y-1">
                {drawerItems.map(({ id, label, icon: Icon, badge }) => {
                  const active = tab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setTab(id);
                        setDrawerOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${active ? "bg-compass-50 text-compass-700 shadow-sm" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors relative ${active ? "bg-compass-600 text-white" : "bg-slate-100 text-slate-500"}`}
                      >
                        <Icon size={18} />
                        {badge && badge > 0 ? (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                            {badge}
                          </span>
                        ) : null}
                      </div>
                      <span>{label}</span>
                      {active && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-compass-600" />
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="my-4 border-t border-slate-100" />
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                {tn('compass.more')}
              </p>
              <nav className="space-y-1">
                {[{ label: "Sign Out", danger: true }].map((item) => (
                  <button
                    key={item.label}
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 active:scale-[0.98] transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-red-50 text-red-500">
                      <LogOut size={18} />
                    </div>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-4 pt-3 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 text-center">
                {tn('compass.footerVersion')}
              </p>
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
            setOffers((prev) =>
              prev.map((o) =>
                o.status === "PUBLISH" ? { ...o, status: "CLOSED" } : o,
              ),
            );
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
