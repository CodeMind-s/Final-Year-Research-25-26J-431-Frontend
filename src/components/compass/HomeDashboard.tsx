"use client";

import React from "react";
import {
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Calendar,
  TrendingUp,
  ArrowRight,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { SalternMap } from "@/components/compass/SalternMap";
import { HarvestReadinessCards } from "@/components/compass/HarvestReadinessCards";
import { MOCK_POND_GRID, MOCK_HARVEST_READINESS } from "@/sample-data/compass/mockSalternData";

interface HomeDashboardProps {
  landownerName: string;
  savedPlan: {
    bedCount: number;
    duration: number;
    date: string;
  } | null;
  onNavigateToPlanner: () => void;
  onNavigateToMarket: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  landownerName,
  savedPlan,
  onNavigateToPlanner,
  onNavigateToMarket,
}) => {
  // Mock weather - this would come from an API normally
  const weather = {
    temp: 32,
    condition: "Sunny",
    wind: 12, // km/h
    humidity: 65, // %
  };

  return (
    <div className="flex flex-col px-4 pt-6 pb-24 space-y-6 max-w-lg mx-auto w-full lg:max-w-4xl">
      {/* 1. Header & Weather */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500">Good morning,</p>
          <h1 className="text-2xl font-bold text-slate-900">{landownerName}</h1>
          <div className="flex items-center gap-1 mt-1 text-slate-400">
            <MapPin size={12} />
            <span className="text-xs">Puttalam, Sri Lanka</span>
          </div>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center min-w-[5rem]">
          <Sun size={24} className="text-amber-500 mb-1" />
          <span className="text-lg font-bold text-slate-900">{weather.temp}°</span>
          <span className="text-[10px] text-slate-400 font-medium uppercase">{weather.condition}</span>
        </div>
      </div>

      {/* 2. Active Plan Widget (or create CTA) */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-slate-900">Your Harvest Plan</h2>
          <button 
            onClick={onNavigateToPlanner}
            className="text-xs font-semibold text-compass-600 flex items-center gap-1 hover:underline"
          >
            Go to Planner <ArrowRight size={12} />
          </button>
        </div>
        
        {savedPlan ? (
          <div 
            onClick={onNavigateToPlanner}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm relative overflow-hidden group cursor-pointer active:scale-[0.99] transition-all"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-compass-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-compass-100 transition-colors" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-compass-50 flex items-center justify-center text-compass-600 ring-4 ring-compass-50">
                <Calendar size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-compass-600 uppercase tracking-wide">Active Season</p>
                <h3 className="text-base font-bold text-slate-900">
                  {savedPlan.duration} Day Plan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Started {new Date(savedPlan.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })} • {savedPlan.bedCount} beds
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-compass-600 group-hover:text-white transition-all">
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        ) : (
          <div 
            onClick={onNavigateToPlanner}
            className="bg-slate-50 rounded-2xl p-5 border border-dashed border-slate-300 text-center cursor-pointer hover:bg-slate-100 hover:border-slate-400 transition-all active:scale-[0.99]"
          >
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
              <Calendar size={18} className="text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-900">No active plan</p>
            <p className="text-xs text-slate-500 mt-0.5">Start planning your next harvest season</p>
          </div>
        )}
      </div>
 {/* 3. Readiness Status (Existing Visual) */}
      <div className="w-full">
         <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-slate-900">Harvest Readiness</h2>
        </div>
        <HarvestReadinessCards readiness={MOCK_HARVEST_READINESS} />
      </div>
      {/* 4. Market Widget */}
      <div className="w-full">
         <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-slate-900">Market Pulse</h2>
           <button 
            onClick={onNavigateToMarket}
            className="text-xs font-semibold text-indigo-600 flex items-center gap-1 hover:underline"
          >
            Analysis <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-28 cursor-pointer hover:border-emerald-200 transition-colors" onClick={onNavigateToMarket}>
             <div className="flex items-start justify-between">
                <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                   <TrendingUp size={16} />
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+5%</span>
             </div>
             <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Current Price</p>
                <p className="text-lg font-bold text-slate-900">Rs. 1,850</p>
             </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-28 cursor-pointer hover:border-orange-200 transition-colors" onClick={onNavigateToMarket}>
             <div className="flex items-start justify-between">
                <div className="p-1.5 bg-orange-50 rounded-lg text-orange-600">
                   <AlertCircle size={16} />
                </div>
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">High</span>
             </div>
             <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Buyer Demand</p>
                <p className="text-lg font-bold text-slate-900">Strong</p>
             </div>
          </div>
        </div>
      </div>

      {/* 5. Saltern Map (Existing Visual) */}
      <div className="w-full">
         <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-slate-900">My Saltern</h2>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
             <SalternMap
                ponds={MOCK_POND_GRID}
                currentOwnerId="" // Visual only
             />
        </div>
      </div>

     

    </div>
  );
};
