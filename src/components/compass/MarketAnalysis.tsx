"use client";

import React, { useEffect, useState } from "react";
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
  Loader2,
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
import { DistributorOfferObject } from "@/types/distributor-offers.types";
import { distributorOffersController } from "@/services/distributor-ffers.controller";
import { dealController } from "@/services/deal.controller";
import { useToast } from "@/hooks/use-toast";
import { DealObject } from "@/types/deals.types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// ─── Status config ────────────────────────────────────────────────

const STATUS_CFG: Record<
  DealStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  DRAFT: {
    label: "Pending",
    color: "bg-slate-100 text-slate-500",
    icon: <Clock size={11} />,
  },
  PENDING: {
    label: "Pending",
    color: "bg-amber-100 text-amber-700",
    icon: <Clock size={11} />,
  },
  ACCEPTED: {
    label: "Accepted",
    color: "bg-emerald-100 text-emerald-700",
    icon: <CheckCircle2 size={11} />,
  },
  CLOSED: {
    label: "Completed",
    color: "bg-blue-100 text-blue-700",
    icon: <CheckCircle2 size={11} />,
  },
  CANCELED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-500",
    icon: <XCircle size={11} />,
  },
};

const DistributorCard: React.FC<{
  distributor: DistributorOfferObject;
  rank: number;
  onSelect: () => void;
}> = ({ distributor, rank, onSelect }) => {
  const isRecommended = rank === 1;
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border-2 p-4 transition-all active:scale-[0.99] hover:shadow-md ${isRecommended
        ? "border-compass-300 bg-compass-50"
        : "border-slate-100 bg-white"
        }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900">
            {distributor.distributor.distributorDetails.companyName ||
              `Distributor ${distributor.userId.slice(0, 6)}`}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={11} className="text-slate-400" />
            <span className="text-xs text-slate-400">
              {distributor.distributor.distributorDetails.address ||
                "Location not specified"}
            </span>
          </div>
        </div>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${isRecommended
            ? "bg-compass-600 text-white"
            : "bg-slate-100 text-slate-500"
            }`}
        >
          #{rank}
        </div>
      </div>

      {/* Offer details */}
      <div className="flex items-center gap-3 mt-3">
        <div className="flex-1 bg-white rounded-xl border border-slate-100 px-3 py-2">
          <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">
            Offers
          </p>
          <p className="text-base font-extrabold text-slate-900">
            Rs. {distributor.pricePerKilo}
          </p>
          <p className="text-[9px] text-slate-400">per bag</p>
        </div>
        <div className="flex-1 bg-white rounded-xl border border-slate-100 px-3 py-2">
          <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">
            Needs
          </p>
          <p className="text-base font-extrabold text-slate-900">
            {distributor.targetQuantity}
          </p>
          <p className="text-[9px] text-slate-400">bags</p>
        </div>
        <div className="flex items-center gap-1 text-compass-600 flex-shrink-0">
          <span className="text-xs font-bold">Offer</span>
          <ChevronRight size={14} />
        </div>
      </div>
    </button>
  );
};

// ─── Request sheet ────────────────────────────────────────────────

const RequestSheet: React.FC<{
  distributor: DistributorOfferObject;
  onClose: () => void;
  onSend: (bags: number, price: number) => void;
  isSending?: boolean;
}> = ({ distributor, onClose, onSend, isSending = false }) => {
  const [bags, setBags] = useState(distributor.targetQuantity);
  const [price, setPrice] = useState(distributor.pricePerKilo);
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
              <p className="text-xs text-slate-400 mb-0.5">Make a request to</p>
              <h3 className="text-lg font-bold text-slate-900">
                {distributor.distributor.distributorDetails.companyName}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={11} className="text-slate-400" />
                <span className="text-xs text-slate-400">
                  {distributor.distributor.distributorDetails.address}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100"
            >
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          {/* Their offer */}
          <div className="bg-compass-50 border border-compass-100 rounded-2xl p-3 mb-5">
            <p className="text-xs font-bold text-compass-700 mb-2">
              Their offer to you
            </p>
            <div className="flex gap-3">
              <div className="flex-1 bg-white rounded-xl px-3 py-2 border border-compass-100">
                <p className="text-[9px] text-slate-400 uppercase tracking-wide">
                  Price / bag
                </p>
                <p className="text-base font-extrabold text-compass-700">
                  Rs. {distributor.pricePerKilo}
                </p>
              </div>
              <div className="flex-1 bg-white rounded-xl px-3 py-2 border border-compass-100">
                <p className="text-[9px] text-slate-400 uppercase tracking-wide">
                  Bags needed
                </p>
                <p className="text-base font-extrabold text-compass-700">
                  {distributor.targetQuantity}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {distributor.collectedQuantity}
            </p>
          </div>

          {/* Your request */}
          <p className="text-sm font-bold text-slate-900 mb-3">
            Your counter-request
          </p>
          <div className="space-y-3 mb-5">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                Bags you can offer
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
          </div>

          {/* Total preview */}
          <div className="bg-slate-50 rounded-2xl px-4 py-3 mb-5 flex items-center justify-between">
            <p className="text-sm text-slate-500">Total deal value</p>
            <p className="text-lg font-extrabold text-slate-900">
              Rs. {totalValue.toLocaleString()}
            </p>
          </div>

          <button
            onClick={() => onSend(bags, price)}
            disabled={!bags || !price || isSending}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold shadow-lg transition-all ${isSending
              ? "bg-slate-400 text-white cursor-not-allowed"
              : "bg-compass-600 text-white shadow-compass-600/25 active:scale-[0.98]"
              }`}
          >
            {isSending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating Deal...
              </>
            ) : (
              <>
                <Send size={16} />
                Send Request
              </>
            )}
          </button>
          <p className="text-xs text-slate-400 text-center mt-2">
            The distributor will review and accept or decline your request
          </p>
        </div>
      </div>
    </>
  );
};

// ─── Deal card ────────────────────────────────────────────────────

const DealCard: React.FC<{
  deal: DealObject;
  onDelete: () => void;
  onClose: () => void;
  onCancel: () => void;
}> = ({ deal, onDelete, onClose, onCancel }) => {
  const sc = STATUS_CFG[deal.status];
  const totalValue = deal.quantity * deal.pricePerKilo;

  // Safely extract distributor info with fallbacks
  const distributorInfo = deal.offer?.distributor || deal.distributor;
  const companyName =
    distributorInfo?.distributorDetails?.companyName ||
    "Unknown Distributor";
  const address =
    distributorInfo?.distributorDetails?.address ||
    "Unknown Location";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-slate-900">
            {companyName}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={10} className="text-slate-400" />
            <span className="text-xs text-slate-400">
              {address}
            </span>
          </div>
        </div>
        <span
          className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${sc.color}`}
        >
          {sc.icon} {sc.label}
        </span>
      </div>

      {/* Numbers */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: "Bags", value: deal.quantity.toString() },
          {
            label: "Price / bag",
            value: `Rs. ${deal.pricePerKilo.toLocaleString()}`,
          },
          { label: "Total", value: `Rs. ${totalValue.toLocaleString()}` },
        ].map((row) => (
          <div
            key={row.label}
            className="bg-slate-50 rounded-xl px-2 py-2 text-center"
          >
            <p className="text-[9px] text-slate-400 uppercase tracking-wide">
              {row.label}
            </p>
            <p className="text-xs font-bold text-slate-900 mt-0.5">
              {row.value}
            </p>
          </div>
        ))}
      </div>

      {/* Actions — demo buttons to simulate distributor response */}
      {deal.status === "DRAFT" && (
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 border border-gray-200 active:scale-95 transition-all"
          >
            Cancel
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex-1 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-50 border border-red-100 active:scale-95 transition-all">
                Delete
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this deal.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Delete Deal
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      {deal.status === "ACCEPTED" && (
        <div className="pt-2 border-t border-slate-100">
          <div className=" rounded-xl px-3 py-2 mb-2 text-center">
            <p className="text-xs font-bold text-emerald-700">
              Deal accepted! Ready to complete.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 active:scale-95 transition-all"
          >
            Mark as Completed
          </button>
        </div>
      )}
      {deal.status === "CLOSED" && (
        <div className="pt-2 border-t border-slate-100">
          <div className="bg-blue-50 rounded-xl px-3 py-2 text-center">
            <p className="text-xs font-bold text-blue-700">
              ✅ Transaction complete
            </p>
          </div>
        </div>
      )}
      {deal.status === "CANCELED" && (
        <div className="pt-2 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl px-3 py-2 text-center">
            <p className="text-xs text-slate-400">This deal was cancelled</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main MarketAnalysis component ───────────────────────────────

export const MarketAnalysis: React.FC = () => {
  const { toast } = useToast();
  const [selectedDist, setSelectedDist] =
    useState<DistributorOfferObject | null>(null);
  const [deals, setDeals] = useState<DealObject[]>([]);
  const [dealsTab, setDealsTab] = useState<"active" | "done">("active");
  const [distributorOffers, setDistributorOffers] = useState<
    DistributorOfferObject[]
  >([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [isLoadingDeals, setIsLoadingDeals] = useState(true);
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const fetchDistributorOffers = async () => {
    setIsLoadingOffers(true);
    try {
      const response = await distributorOffersController.getDistributorOffers({
        page: 1,
        limit: 10,
        requirement: "HIGH",
        status: "PUBLISH",
      });

      // API returns array directly, not wrapped in {success, data} object
      if (Array.isArray(response)) {
        setDistributorOffers(response as any);
      } else if ((response as any).success && (response as any).data) {
        setDistributorOffers((response as any).data);
      }
    } catch (error) {
      console.error("Failed to fetch distributor offers:", error);
    } finally {
      setIsLoadingOffers(false);
    }
  };

  const fetchLandownerDeals = async () => {
    setIsLoadingDeals(true);
    try {
      console.log("Fetching landowner deals...");
      const response = await dealController.getLandownerDeals({
        page: 1,
        limit: 20,
      });

      console.log("Deals API full response:", response);
      console.log("Response type:", typeof response);
      console.log("Is Array:", Array.isArray(response));
      console.log("Response.success:", (response as any).success);
      console.log("Response.data:", (response as any).data);

      // Check if response is wrapped or direct array
      let dealsData = null;
      if (Array.isArray(response)) {
        console.log("Response is direct array");
        dealsData = response;
      } else if (response.success && response.data) {
        console.log("Response is wrapped object");
        dealsData = response.data;
      }

      if (dealsData && dealsData.length > 0) {
        console.log("Processing", dealsData.length, "deals");
        // Use API DealObject directly
        const mappedDeals: DealObject[] = dealsData.map((deal: any) => {
          console.log("=== Mapping deal ===");
          console.log("Full deal object:", deal);
          console.log("deal.distributor:", deal.distributor);
          console.log(
            "deal.distributor?.distributorDetails:",
            deal.distributor?.distributorDetails,
          );

          // API returns: DRAFT, CANCELED, ACCEPTED, CLOSED, PENDING
          const status: DealStatus = deal.status as DealStatus;

          // Distributor info is directly on deal.distributor
          const distributorInfo = deal.distributor;
          let companyName = "Unknown Distributor";
          let address = "Unknown Location";

          // Try different possible paths
          if (distributorInfo?.distributorDetails?.companyName) {
            companyName = distributorInfo.distributorDetails.companyName;
            address =
              distributorInfo.distributorDetails.address || "Unknown Location";
            console.log("✓ Found company name:", companyName);
          } else if (deal.offer?.distributor?.distributorDetails?.companyName) {
            // Fallback: check inside offer as well
            companyName = deal.offer.distributor.distributorDetails.companyName;
            address =
              deal.offer.distributor.distributorDetails.address ||
              "Unknown Location";
            console.log(
              "✓ Found company name via offer.distributor:",
              companyName,
            );
          } else {
            console.log("✗ Could not find company name, using fallback");
          }

          return deal;
        });

        console.log("Mapped deals:", mappedDeals);
        setDeals(mappedDeals);
      } else {
        console.log("No deals data found");
        setDeals([]);
      }
    } catch (error) {
      console.error("Failed to fetch landowner deals:", error);
      console.error("Error details:", error);
    } finally {
      setIsLoadingDeals(false);
    }
  };

  useEffect(() => {
    fetchDistributorOffers();
    fetchLandownerDeals();
  }, []);

  const handleSendRequest = async (bags: number, price: number) => {
    if (!selectedDist) return;

    setIsSendingRequest(true);
    try {
      const data = {
        quantity: bags,
      };
      const response = await dealController.createDeal(data, selectedDist._id);

      if (response.success) {
        toast({
          title: "Deal Created Successfully",
          description: `Your offer for ${bags} bags has been sent to the distributor.`,
        });

        // Refetch deals to show the newly created deal
        fetchLandownerDeals();

        setSelectedDist(null);
      } else {
        throw new Error(response.message || "Failed to create deal");
      }
    } catch (error) {
      console.error("Failed to create deal:", error);
      toast({
        title: "Failed to Create Deal",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingRequest(false);
    }
  };

  const updateDealStatus = async (id: string, status: "ACCEPTED" | "CLOSED" | "CANCELED") => {
    try {
      const response = await dealController.updateDeals({ status }, id);
      if (!response.success) {
        throw new Error(response.message || "Failed to update deal");
      }
      toast({
        title: "Deal Updated",
        description: `Deal has been marked as ${status.toLowerCase()}.`,
      });

      fetchLandownerDeals();
    } catch (error) {
      console.error(`Failed to update deal ${id} to status ${status}:`, error);
      toast({
        title: "Failed to Update Deal",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDeal = async (id: string) => {
    try {
      const response = await dealController.deleteDeal(id);
      if (!response.success) {
        throw new Error(response.message || "Failed to delete deal");
      }
      toast({
        title: "Deal Deleted",
        description: `Deal has been deleted successfully.`,
      });
      fetchLandownerDeals();
    } catch (error) {
      console.error(`Failed to delete deal ${id}:`, error);
      toast({
        title: "Failed to Delete Deal",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const activeDeals = deals.filter(
    (d) =>
      d.status === "PENDING" || d.status === "ACCEPTED" || d.status === "DRAFT",
  );
  const doneDeals = deals.filter(
    (d) => d.status === "CLOSED" || d.status === "CANCELED",
  );

  return (
    <div className="flex flex-col px-4 pt-5 pb-28 max-w-lg mx-auto w-full">
      {/* ── PSS Recommendation ── */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-white shadow-xl shadow-indigo-200 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles size={14} className="text-indigo-200" />
            <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-wider">
              PSS Recommendation
            </p>
          </div>
          <h2 className="text-xl font-extrabold mb-2">Hold for ~4 weeks</h2>
          <p className="text-indigo-100 text-sm leading-relaxed mb-4">
            Prices are trending upward. Waiting until early May could increase
            your profit by ~15%.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Current price", value: "Rs. 1,850/bag" },
              { label: "Expected peak", value: "Rs. 2,150 (May)" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/15 rounded-xl px-3 py-2 backdrop-blur-sm"
              >
                <p className="text-[9px] text-indigo-200 uppercase tracking-wide">
                  {s.label}
                </p>
                <p className="text-sm font-bold text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Salt Distributors ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">
            Salt Distributors
          </h2>
          <span className="text-[10px] font-semibold text-compass-600 uppercase tracking-wide">
            Tap to make an offer
          </span>
        </div>
        {/* Mobile: vertical list | Desktop: 2-col grid */}
        {isLoadingOffers ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-compass-600 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-slate-400">Loading distributors...</p>
          </div>
        ) : distributorOffers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
            <Package size={28} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">
              No distributor offers available at the moment
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0">
            {distributorOffers.map(
              (dist: DistributorOfferObject, i: number) => (
                <DistributorCard
                  key={dist._id}
                  distributor={dist}
                  rank={i + 1}
                  onSelect={() => setSelectedDist(dist)}
                />
              ),
            )}
          </div>
        )}
      </div>

      {/* ── My Deals ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">My Deals</h2>
          <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5">
            {(["active", "done"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setDealsTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${dealsTab === tab
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500"
                  }`}
              >
                {tab === "active"
                  ? `Active (${activeDeals.length})`
                  : `Done (${doneDeals.length})`}
              </button>
            ))}
          </div>
        </div>

        {isLoadingDeals ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-compass-600 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-slate-400">Loading deals...</p>
          </div>
        ) : (dealsTab === "active" ? activeDeals : doneDeals).length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
            <Package size={28} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">
              {dealsTab === "active"
                ? "No active deals yet. Tap a distributor above to send a request."
                : "No completed deals yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(dealsTab === "active" ? activeDeals : doneDeals).map(
              (deal: DealObject) => (
                <DealCard
                  key={deal._id}
                  deal={deal}
                  onDelete={() => handleDeleteDeal(deal._id)}
                  onClose={() => updateDealStatus(deal._id, "CLOSED")}
                  onCancel={() => updateDealStatus(deal._id, "CANCELED")}
                />
              ),
            )}
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
              <p className="text-sm font-bold text-slate-900">Price Trend</p>
              <p className="text-xs text-slate-500">
                Last 6 months + next 6 months (Rs./bag)
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              +12% YoY
            </span>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-3 ml-1">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 bg-emerald-500 rounded" />
              <span className="text-[10px] text-slate-500">Actual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-6 h-0.5 bg-emerald-300 rounded border-dashed"
                style={{ borderTop: "1px dashed #6ee7b7" }}
              />
              <span className="text-[10px] text-slate-500">Forecast</span>
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
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  dy={8}
                />
                <YAxis hide domain={["dataMin - 150", "dataMax + 150"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: number, _: string, entry: any) => [
                    `Rs. ${v.toLocaleString()}${entry?.payload?.isForecast ? " (forecast)" : ""}`,
                    "Price",
                  ]}
                  cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                />
                <ReferenceLine
                  x="Feb"
                  stroke="#6366f1"
                  strokeDasharray="4 3"
                  label={{
                    position: "top",
                    value: "Now",
                    fill: "#6366f1",
                    fontSize: 9,
                    fontWeight: 700,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="url(#priceGrad)"
                  strokeWidth={3}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (cx == null || cy == null) return <></>;
                    return (
                      <circle
                        key={`dot-p-${cx}`}
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill={payload?.isForecast ? "#6ee7b7" : "#10b981"}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    );
                  }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400 text-center mt-1">
            Projected peak:{" "}
            <span className="font-semibold text-slate-700">Rs. 2,150</span> in
            May 2026
          </p>
        </div>

        {/* Market Demand */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp size={16} className="text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">Market Demand</p>
              <p className="text-xs text-slate-500">
                Buyer activity score (0–100)
              </p>
            </div>
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
              High now
            </span>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-3 ml-1">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-3 bg-orange-400 rounded-sm" />
              <span className="text-[10px] text-slate-500">Actual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-3 bg-orange-200 rounded-sm" />
              <span className="text-[10px] text-slate-500">Forecast</span>
            </div>
          </div>

          <div className="h-44 w-full -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMAND_DATA} barSize={16}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  dy={8}
                />
                <YAxis hide domain={[0, 110]} />
                <Tooltip
                  cursor={{ fill: "#fafafa" }}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: number, _: string, entry: any) => [
                    `${v}${entry?.payload?.isForecast ? " (forecast)" : ""}`,
                    "Demand",
                  ]}
                />
                <ReferenceLine
                  x="Feb"
                  stroke="#6366f1"
                  strokeDasharray="4 3"
                  label={{
                    position: "top",
                    value: "Now",
                    fill: "#6366f1",
                    fontSize: 9,
                    fontWeight: 700,
                  }}
                />
                <Bar dataKey="demand" radius={[4, 4, 0, 0]}>
                  {DEMAND_DATA.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isForecast ? "#fdba74" : "#f97316"}
                      fillOpacity={0.9}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400 text-center mt-1">
            Demand expected to peak in{" "}
            <span className="font-semibold text-slate-700">April 2026</span>
          </p>
        </div>
      </div>

      {/* ── Request sheet ── */}
      {selectedDist && (
        <RequestSheet
          distributor={selectedDist}
          onClose={() => setSelectedDist(null)}
          onSend={handleSendRequest}
          isSending={isSendingRequest}
        />
      )}
    </div>
  );
};
