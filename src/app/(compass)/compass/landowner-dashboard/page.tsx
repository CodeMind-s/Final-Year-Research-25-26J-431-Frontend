// import React, { useState, useMemo, useEffect } from 'react';
// import { 
//   Leaf, 
//   TrendingUp, 
//   AlertTriangle,
//   CheckCircle2,
//   Phone,
//   Users,
//   ArrowRight,
//   Menu,
//   X,
//   Package
// } from 'lucide-react';
// import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
// import { Card } from '../components/Card';
// import { Button } from '../components/Button';
// import { Badge } from '../components/Badge';
// import { Slider } from '../components/Slider';
// import { SeasonData, SellerOffer, Deal, DealStatus, NotificationType, LandownerSummary } from '../types';
// import { useApp } from '../context/AppContext';
// import { NegotiationModal } from '../components/NegotiationModal';
// import { NotificationPanel } from '../components/NotificationPanel';
// import { DealsSection } from '../components/DealsSection';
// import { DealsDialog } from '../components/DealsDialog';
// import { InvoiceModal } from '../components/InvoiceModal';
// import { NotificationBell } from '../components/NotificationBell';
// import { PredictionCharts } from '../components/PredictionCharts';
// import { ProfitProjectionCard } from '../components/ProfitProjectionCard';
// import { 
//   mockHarvestPredictions, 
//   mockPricePredictions, 
//   mockDemandPredictions,
//   mockProfitProjections 
// } from '../mockPredictionData';

"use client"
import { DealsDialog } from "@/components/compass/DealsDialog";
import { InvoiceModal } from "@/components/compass/InvoiceModal";
import { NegotiationModal } from "@/components/compass/NegotiationModal";
import { NotificationBell } from "@/components/compass/NotificationBell";
import { NotificationPanel } from "@/components/compass/NotificationPanel";
import { PredictionCharts } from "@/components/compass/PredictionCharts";
import { ProfitProjectionCard } from "@/components/compass/ProfitProjectionCard";
import { Button } from "@/components/compass/Button";
import { Badge } from "@/components/compass/Badge";
import { Slider } from "@/components/compass/Slider";
import { Card } from "@/components/compass/Card";
import { useApp } from "@/context/compass/AppContext";
import { Deal, DealStatus, NotificationType, SeasonData, SellerOffer } from "@/dtos/compass/types";
import { mockDemandPredictions, mockHarvestPredictions, mockPricePredictions, mockProfitProjections } from "@/sample-data/compass/mockPredictionData";
import { ArrowRight, Leaf, Menu, Package, Phone, TrendingUp, Users, X } from "lucide-react";
import { useEffect, useState } from "react";

// Mock Data
const seasonData: SeasonData[] = [
  { day: 'Mon', production: 8, rainfall: false },
  { day: 'Tue', production: 10, rainfall: false },
  { day: 'Wed', production: 12, rainfall: false },
  { day: 'Thu', production: 11, rainfall: true },
  { day: 'Fri', production: 9, rainfall: true },
  { day: 'Sat', production: 7, rainfall: false },
  { day: 'Sun', production: 6, rainfall: false },
];

const PREDICTED_TONS = 50; // Increased to allow more deals
const LANDOWNER_ID = 'landowner_001';
const LANDOWNER_NAME = 'Ravi Kumara';

export const LandownerDashboard: React.FC = () => {
  const { 
    sellerOffers, 
    createDeal, 
    addNotification, 
    getUserDeals,
    getUserNotifications,
    getUnreadCount 
  } = useApp();

  // UI State
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<SellerOffer | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDeals, setShowDeals] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showAllOffers, setShowAllOffers] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Simulator State
  const [fertCost, setFertCost] = useState(8000);
  const [laborCost, setLaborCost] = useState(15000);
  const [transportCost, setTransportCost] = useState(5000);

  // Get user-specific data
  const myDeals = getUserDeals(LANDOWNER_ID, 'landowner');
  const myNotifications = getUserNotifications(LANDOWNER_ID);
  const unreadCount = getUnreadCount();

  // Calculate available tons (total - sold in deals)
  const soldTons = myDeals
    .filter(d => d.status === DealStatus.ACCEPTED || d.status === DealStatus.COMPLETED)
    .reduce((sum, d) => sum + d.quantity, 0);
  const availableTons = PREDICTED_TONS - soldTons;

  // Initialize mock offers on first load
  useEffect(() => {
    if (sellerOffers.length === 0) {
      const mockOffers: Omit<SellerOffer, 'id' | 'timestamp'>[] = [
        { sellerId: 'seller_001', name: 'Lanka Salt Limited', pricePerTon: 1900, demandTons: 25, reliability: 'High', isRecommended: true },
        { sellerId: 'seller_002', name: 'Puttalam Salt Ltd (Palavi Saltern)', pricePerTon: 1850, demandTons: 30, reliability: 'High', isRecommended: false },
        { sellerId: 'seller_003', name: 'National Salt Limited', pricePerTon: 1800, demandTons: 20, reliability: 'High', isRecommended: false },
        { sellerId: 'seller_004', name: 'Raigam / Raigam (brand)', pricePerTon: 1750, demandTons: 15, reliability: 'Medium', isRecommended: false },
        { sellerId: 'seller_005', name: 'Ceylon Salt (Cargills Lanka)', pricePerTon: 1700, demandTons: 40, reliability: 'High', isRecommended: false },
        { sellerId: 'seller_006', name: 'Keells Super (John Keells)', pricePerTon: 1820, demandTons: 18, reliability: 'High', isRecommended: false },
        { sellerId: 'seller_007', name: 'Cargills (Food City Lanka)', pricePerTon: 1780, demandTons: 22, reliability: 'High', isRecommended: false },
        { sellerId: 'seller_008', name: 'Glomark', pricePerTon: 1650, demandTons: 35, reliability: 'Medium', isRecommended: false },
      ];
      // mockOffers.forEach(offer => publishOffer(offer));
    }
  }, []);

  // Use existing offers or fallback to mock with 8 sellers
  const displayOffers: SellerOffer[] = sellerOffers.length > 0 ? sellerOffers : [
    { id: '1', sellerId: 'seller_001', name: 'Lanka Salt Limited', pricePerTon: 1900, demandTons: 25, reliability: 'High', isRecommended: true, timestamp: Date.now() },
    { id: '2', sellerId: 'seller_002', name: 'Puttalam Salt Ltd (Palavi Saltern)', pricePerTon: 1850, demandTons: 30, reliability: 'High', isRecommended: false, timestamp: Date.now() },
    { id: '3', sellerId: 'seller_003', name: 'National Salt Limited', pricePerTon: 1800, demandTons: 20, reliability: 'High', isRecommended: false, timestamp: Date.now() },
    { id: '4', sellerId: 'seller_004', name: 'Raigam / Raigam (brand)', pricePerTon: 1750, demandTons: 15, reliability: 'Medium', isRecommended: false, timestamp: Date.now() },
    { id: '5', sellerId: 'seller_005', name: 'Ceylon Salt (Cargills Lanka)', pricePerTon: 1700, demandTons: 40, reliability: 'High', isRecommended: false, timestamp: Date.now() },
    { id: '6', sellerId: 'seller_006', name: 'Keells Super (John Keells)', pricePerTon: 1820, demandTons: 18, reliability: 'High', isRecommended: false, timestamp: Date.now() },
    { id: '7', sellerId: 'seller_007', name: 'Cargills (Food City Lanka)', pricePerTon: 1780, demandTons: 22, reliability: 'High', isRecommended: false, timestamp: Date.now() },
    { id: '8', sellerId: 'seller_008', name: 'Glomark', pricePerTon: 1650, demandTons: 35, reliability: 'Medium', isRecommended: false, timestamp: Date.now() },
  ];

  // Calculate profit for each offer
  const totalCost = fertCost + laborCost + transportCost;
  
  const offersWithProfit = displayOffers.map(offer => {
    const sellingTons = Math.min(availableTons, offer.demandTons);
    const revenue = sellingTons * offer.pricePerTon;
    const profit = revenue - totalCost;
    const profitPerTon = sellingTons > 0 ? profit / sellingTons : 0;
    
    return {
      ...offer,
      sellingTons,
      revenue,
      profit,
      profitPerTon,
    };
  });

  // Find best profit offer
  const bestProfitOffer = offersWithProfit.reduce((best, current) => 
    current.profit > best.profit ? current : best
  , offersWithProfit[0]);

  // Selection state
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const selectedOfferData = selectedOfferId 
    ? offersWithProfit.find(o => o.id === selectedOfferId)
    : bestProfitOffer;

  const handleSellNow = () => {
    if (selectedOfferData) {
      setSelectedOffer(selectedOfferData);
      setShowNegotiationModal(true);
    }
  };

  const handleAcceptDeal = (dealData: {
    sellerId: string;
    sellerName: string;
    landownerId: string;
    landownerName: string;
    quantity: number;
    pricePerTon: number;
    totalPrice: number;
  }) => {
    createDeal({
      ...dealData,
      status: DealStatus.ACCEPTED,
      negotiations: [{
        from: 'landowner',
        message: 'Deal accepted',
        timestamp: Date.now()
      }],
    });

    // Notify seller
    addNotification({
      type: NotificationType.DEAL_ACCEPTED,
      title: 'Deal Accepted!',
      message: `${dealData.landownerName} accepted your offer for ${dealData.quantity} tons at LKR ${dealData.pricePerTon}/ton`,
      dealId: '', // Will be set by context
      recipientId: dealData.sellerId,
      read: false,
    });

    setShowNegotiationModal(false);
    setSelectedOffer(null);
  };

  const handleGenerateInvoice = (deal: Deal) => {
    setSelectedDeal(deal);
    setShowInvoice(true);
  };

  return (
    <div className="pb-24 lg:pb-6 bg-slate-50 min-h-screen">
      
      {/* Zone 1: Decision Strip */}
      <div className="sticky top-0 z-20 bg-emerald-600 text-white shadow-lg rounded-b-3xl lg:rounded-none px-6 py-5">
        {/* Landowner Name */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-emerald-500/30">
          <Users size={18} />
          <h2 className="text-base font-bold">{LANDOWNER_NAME}</h2>
        </div>

        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1 opacity-90">
              <span className="text-xs font-semibold uppercase tracking-wider">Recommendation</span>
            </div>
            <h1 className="text-3xl font-bold leading-tight">HARVEST NOW</h1>
            <p className="text-emerald-100 text-sm mt-1">Market price peaked. Rain predicted in 2 days.</p>
          </div>
          <div className="flex gap-2">
            {/* Deals Button */}
            <button
              onClick={() => setShowDeals(true)}
              className="relative bg-white/20 hover:bg-white/30 p-2 rounded-xl backdrop-blur-sm transition-colors group"
              aria-label="My Deals"
            >
              <Package className="w-8 h-8 text-white" />
              {myDeals.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {myDeals.length}
                </span>
              )}
            </button>
            
            {/* Notification Bell */}
            <NotificationBell count={unreadCount} onClick={() => setShowNotifications(true)} />
            
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Leaf className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 flex-1">
            <p className="text-xs text-emerald-100">Available</p>
            <p className="font-bold text-lg">{availableTons.toFixed(1)} tons</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 flex-1">
            <p className="text-xs text-emerald-100">My Deals</p>
            <p className="font-bold text-lg">{myDeals.length} active</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 flex-1">
            <p className="text-xs text-emerald-100">Best Profit</p>
            <p className="font-bold text-lg">LKR {(bestProfitOffer.profit / 1000).toFixed(1)}k</p>
          </div>
        </div>
      </div>

      {/* Desktop Grid Layout */}
      <div className="px-4 mt-6 lg:px-6 lg:max-w-[1600px] lg:mx-auto">
        
        {/* Main Grid - 2 columns on desktop */}
        <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
          
          {/* LEFT COLUMN - Analytics */}
          <div className="space-y-6" id="analytics-section">
        
        {/* Prediction Analytics Section */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4">AI-Powered Harvest Analytics</h2>
          
          {/* Profit Projection Card */}
          <div className="mb-4">
            <ProfitProjectionCard projections={mockProfitProjections} />
          </div>
          
          {/* Prediction Charts */}
          <PredictionCharts 
            harvestData={mockHarvestPredictions}
            priceData={mockPricePredictions}
            demandData={mockDemandPredictions}
          />
        </section>
        
        {/* My Deals Section - Now removed, accessible via dialog */}
        {/* DealsSection removed */}
        </div>

        {/* RIGHT COLUMN - Offers */}
        <div className="space-y-6" id="offers-section">
        
        {/* Unified Offer Comparison */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Compare Offers & Calculate Profit</h2>
          
          {/* Cost Inputs - Compact Grid Layout */}
          <Card className="mb-4 bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-600" />
              Your Production Costs
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Fertilizer</label>
                <input
                  type="number"
                  value={fertCost}
                  onChange={(e) => setFertCost(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={5000}
                  max={20000}
                  step={500}
                />
                <p className="text-xs text-slate-500">LKR {fertCost.toLocaleString()}</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Labor</label>
                <input
                  type="number"
                  value={laborCost}
                  onChange={(e) => setLaborCost(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={10000}
                  max={30000}
                  step={1000}
                />
                <p className="text-xs text-slate-500">LKR {laborCost.toLocaleString()}</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Transport</label>
                <input
                  type="number"
                  value={transportCost}
                  onChange={(e) => setTransportCost(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={2000}
                  max={10000}
                  step={500}
                />
                <p className="text-xs text-slate-500">LKR {transportCost.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-600">Total Costs:</span>
              <span className="text-lg font-bold text-slate-900">LKR {totalCost.toLocaleString()}</span>
            </div>
          </Card>

          {/* Offer Cards Grid */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600">
                Showing {showAllOffers ? offersWithProfit.length : Math.min(3, offersWithProfit.length)} of {offersWithProfit.length} offers • Available: {availableTons} tons
              </p>
              {offersWithProfit.length > 3 && (
                <button 
                  onClick={() => setShowAllOffers(!showAllOffers)}
                  className="text-blue-600 text-sm font-semibold flex items-center hover:underline"
                >
                  {showAllOffers ? 'Show Less' : `View All (${offersWithProfit.length})`} 
                  <ArrowRight size={14} className="ml-1"/>
                </button>
              )}
            </div>

            {(showAllOffers ? offersWithProfit : offersWithProfit.slice(0, 3)).map((offer) => {
              const isBest = offer.id === bestProfitOffer.id;
              const isSelected = offer.id === selectedOfferId || (!selectedOfferId && isBest);
              const profitColor = offer.profit > 0 ? 'text-emerald-700' : 'text-red-600';
              
              return (
                <Card 
                  key={offer.id}
                  className={`cursor-pointer transition-all ${
                    isSelected 
                      ? 'ring-2 ring-blue-500 bg-blue-50/30' 
                      : isBest
                      ? 'ring-2 ring-emerald-500 bg-emerald-50/20'
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedOfferId(offer.id)}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => setSelectedOfferId(offer.id)}
                        className="w-4 h-4 text-blue-600"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div>
                        <h3 className="font-bold text-base text-slate-900">{offer.name}</h3>
                        <p className="text-xs text-slate-500">
                          Wants {offer.demandTons} tons • {offer.reliability} Reliability
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {isBest && (
                        <div className="mb-1">
                        <Badge color="green" size="sm" >
                          ⭐ Best Profit
                        </Badge>
                        </div>
                      )}
                      <p className="text-2xl font-bold text-slate-900">
                        {offer.pricePerTon}
                        <span className="text-sm font-normal text-slate-500"> /ton</span>
                      </p>
                    </div>
                  </div>

                  {/* Profit Breakdown */}
                  <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Selling:</span>
                      <span className="font-semibold text-slate-900">{offer.sellingTons} tons</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Revenue:</span>
                      <span className="font-semibold text-blue-700">
                        LKR {offer.revenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Costs:</span>
                      <span className="font-semibold text-slate-600">
                        - LKR {totalCost.toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-700">Net Profit:</span>
                        <span className={`text-xl font-bold ${profitColor}`}>
                          LKR {offer.profit.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-slate-500">Profit per ton:</span>
                        <span className={`text-sm font-semibold ${profitColor}`}>
                          LKR {offer.profitPerTon.toFixed(0)}/ton
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
        </div>

        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setShowMobileMenu(true)}
        className="fixed bottom-20 right-4 lg:hidden bg-emerald-600 text-white p-4 rounded-full shadow-2xl z-40 hover:bg-emerald-700 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Slide-out Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowMobileMenu(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">Quick Navigation</h3>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => {
                  document.getElementById('offers-section')?.scrollIntoView({ behavior: 'smooth' });
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="font-semibold text-slate-900">Compare Offers</div>
                <div className="text-xs text-slate-500">{offersWithProfit.length} available</div>
              </button>

              <button
                onClick={() => {
                  document.getElementById('deals-section')?.scrollIntoView({ behavior: 'smooth' });
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="font-semibold text-slate-900">My Deals</div>
                <div className="text-xs text-slate-500">{myDeals.length} deals</div>
              </button>

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    handleSellNow();
                    setShowMobileMenu(false);
                  }}
                  className="w-full bg-emerald-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  disabled={availableTons <= 0}
                >
                  <Phone size={18} /> Sell Now
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar - Mobile Only */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-xl z-50 safe-area-pb lg:hidden">
        <div className="flex gap-3 max-w-md mx-auto">
          <Button 
            variant="success" 
            fullWidth 
            className="text-lg"
            onClick={handleSellNow}
            disabled={availableTons <= 0}
          >
            <Phone size={20} /> Sell Now
          </Button>
        </div>
      </div>

      {/* Desktop Action Button */}
      <div className="hidden lg:block fixed bottom-6 right-6 z-50">
        <Button 
          variant="success" 
          className="text-lg px-8 h-14 shadow-2xl"
          onClick={handleSellNow}
          disabled={availableTons <= 0}
        >
          <Phone size={20} /> Sell Now
        </Button>
      </div>

      {/* Modals */}
      {showNegotiationModal && selectedOffer && (
        <NegotiationModal
          offer={selectedOffer}
          landownerName={LANDOWNER_NAME}
          landownerId={LANDOWNER_ID}
          availableTons={availableTons}
          onAccept={handleAcceptDeal}
          onReject={() => setShowNegotiationModal(false)}
          onClose={() => setShowNegotiationModal(false)}
        />
      )}

      {showNotifications && (
        <NotificationPanel
          notifications={myNotifications}
          onClose={() => setShowNotifications(false)}
          onMarkAsRead={(id) => {
            // Handled by context
          }}
          onMarkAllAsRead={() => {
            // Handled by context
          }}
        />
      )}

      {showDeals && (
        <DealsDialog
          deals={myDeals}
          userRole="landowner"
          onClose={() => setShowDeals(false)}
          onGenerateInvoice={handleGenerateInvoice}
        />
      )}


      {showInvoice && selectedDeal && (
        <InvoiceModal
          deal={selectedDeal}
          userRole="landowner"
          onClose={() => setShowInvoice(false)}
        />
      )}

    </div>
  );
};
