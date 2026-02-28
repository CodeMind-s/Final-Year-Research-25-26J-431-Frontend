"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Info,
  ArrowRight,
  BarChart3,
  LineChart as LineChartIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
} from "recharts";
import { PRICE_DATA, DEMAND_DATA, INSIGHTS } from "@/sample-data/compass/mockMarketData";

export const MarketAnalysis: React.FC = () => {
  return (
    <div className="flex flex-col items-center px-4 pt-8 pb-24 max-w-md mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mb-4 ring-4 ring-indigo-50/50">
          <TrendingUp size={24} />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Market Insights</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
          Know the best time to sell based on real-time data
        </p>
      </div>

      {/* Recommendation Card */}
      <div className="w-full bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-white shadow-xl shadow-indigo-200 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-indigo-100 text-xs font-semibold uppercase tracking-wider mb-1">
                Our Recommendation
              </p>
              <h2 className="text-2xl font-bold">Hold for ~4 weeks</h2>
            </div>
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Info size={20} className="text-white" />
            </div>
          </div>
          <p className="text-indigo-50 text-sm leading-relaxed mb-4">
            Prices are trending upward. Waiting until early May could increase your
            profit by ~15%.
          </p>
          <button className="w-full bg-white text-indigo-600 font-semibold py-3 rounded-xl text-sm hover:bg-indigo-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            View Detailed Forecast
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Price Trend Chart */}
      <div className="w-full bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <LineChartIcon size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Price Trend</h3>
              <p className="text-xs text-slate-500">6 Month Forecast</p>
            </div>
          </div>
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
            +12% vs last year
          </span>
        </div>

        <div className="h-48 w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={PRICE_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                dy={10}
              />
              <YAxis
                hide
                domain={["dataMin - 100", "dataMax + 100"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
                itemStyle={{ color: "#fff" }}
                cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
              />
              {/* Highlight current month */}
              <ReferenceLine x="Mar" stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'Now', fill: '#94a3b8', fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center">
          Projected peak: <span className="font-semibold text-slate-700">Rs. 2,150</span> in May
        </p>
      </div>

      {/* Demand Trend Chart */}
      <div className="w-full bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Buyer Demand</h3>
              <p className="text-xs text-slate-500">Interest level (0-100)</p>
            </div>
          </div>
          <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
            High Activity
          </span>
        </div>

        <div className="h-40 w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DEMAND_DATA} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                dy={10}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="demand"
                fill="#f97316"
                radius={[4, 4, 0, 0]}
                fillOpacity={0.8}
                activeBar={{ fill: "#ea580c" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
         <p className="text-xs text-slate-500 mt-2 text-center">
          Demand is currently <span className="font-semibold text-slate-700">very strong</span>
        </p>
      </div>

       {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Current Price</p>
             <p className="text-lg font-bold text-slate-900">Rs. 1,850</p>
             <div className="flex items-center gap-1 mt-1 text-emerald-600">
                <TrendingUp size={12} />
                <span className="text-[10px] font-medium">+5% this week</span>
             </div>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Production</p>
             <p className="text-lg font-bold text-slate-900">Low Supply</p>
             <div className="flex items-center gap-1 mt-1 text-rose-500">
                <TrendingDown size={12} />
                <span className="text-[10px] font-medium">-15% vs avg</span>
             </div>
        </div>
      </div>

    </div>
  );
};
