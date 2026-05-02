"use client";

import React from "react";
import { useTranslations } from 'next-intl';
import { Waves, CloudRain, Thermometer } from "lucide-react";
import type { HarvestReadiness } from "@/sample-data/compass/mockSalternData";

interface HarvestReadinessCardsProps {
  readiness: HarvestReadiness[];
}

export const HarvestReadinessCards: React.FC<HarvestReadinessCardsProps> = ({
  readiness,
}) => {
  const t = useTranslations('compass');

  const CARD_CONFIG: Record<
    HarvestReadiness["type"],
    {
      icon: React.ElementType;
      label: string;
      messages: Record<HarvestReadiness["level"], string>;
      colors: Record<HarvestReadiness["level"], { bg: string; iconBg: string; dot: string; text: string }>;
    }
  > = {
    salinity: {
      icon: Waves,
      label: t('readiness.salinity'),
      messages: {
        good: t('readiness.salinityGood'),
        moderate: t('readiness.salinityModerate'),
        concern: t('readiness.salinityConcern'),
      },
      colors: {
        good: { bg: "bg-green-50", iconBg: "bg-green-100 text-green-600", dot: "bg-green-500", text: "text-green-800" },
        moderate: { bg: "bg-yellow-50", iconBg: "bg-yellow-100 text-yellow-600", dot: "bg-yellow-500", text: "text-yellow-800" },
        concern: { bg: "bg-red-50", iconBg: "bg-red-100 text-red-600", dot: "bg-red-500", text: "text-red-800" },
      },
    },
    rainfall: {
      icon: CloudRain,
      label: t('readiness.rainfall'),
      messages: {
        good: t('readiness.rainfallGood'),
        moderate: t('readiness.rainfallModerate'),
        concern: t('readiness.rainfallConcern'),
      },
      colors: {
        good: { bg: "bg-slate-50", iconBg: "bg-slate-100 text-slate-600", dot: "bg-slate-500", text: "text-slate-800" },
        moderate: { bg: "bg-cyan-50", iconBg: "bg-cyan-100 text-cyan-600", dot: "bg-cyan-500", text: "text-cyan-800" },
        concern: { bg: "bg-blue-50", iconBg: "bg-blue-100 text-blue-600", dot: "bg-blue-500", text: "text-blue-800" },
      },
    },
    temperature: {
      icon: Thermometer,
      label: t('readiness.temperatureLabel'),
      messages: {
        good: t('readiness.tempGood'),
        moderate: t('readiness.tempModerate'),
        concern: t('readiness.tempConcern'),
      },
      colors: {
        good: { bg: "bg-yellow-50", iconBg: "bg-yellow-100 text-yellow-600", dot: "bg-yellow-500", text: "text-yellow-800" },
        moderate: { bg: "bg-orange-50", iconBg: "bg-orange-100 text-orange-600", dot: "bg-orange-500", text: "text-orange-800" },
        concern: { bg: "bg-red-50", iconBg: "bg-red-100 text-red-600", dot: "bg-red-500", text: "text-red-800" },
      },
    },
  };

  const getLevelLabel = (type: HarvestReadiness["type"], level: HarvestReadiness["level"]) => {
    // Use unique status label keys to avoid conflicts with message keys
    if (type === "salinity") {
      switch (level) {
        case "good": return t('readiness.salinityOptimal');
        case "moderate": return t('readiness.salinityDeclining');
        case "concern": return t('readiness.salinityCritical');
      }
    }
    
    if (type === "rainfall") {
      switch (level) {
        case "good": return t('readiness.rainfallSafe');
        case "moderate": return t('readiness.rainfallRisky');
        case "concern": return t('readiness.rainfallDangerous');
      }
    }
    
    if (type === "temperature") {
      switch (level) {
        case "good": return t('readiness.temperaturePerfect');
        case "moderate": return t('readiness.temperatureRising');
        case "concern": return t('readiness.temperatureCritical');
      }
    }
    
    // Fallback
    switch (level) {
      case "good": return t('readiness.ideal');
      case "moderate": return t('readiness.moderate');
      case "concern": return t('readiness.caution');
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">
          {t('readiness.harvestReadiness')}
        </h2>
        <span className="text-[11px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
          {t('readiness.outlook45Day')}
        </span>
      </div>

      {/* Cards — horizontal scroll on mobile, grid on desktop */}
      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-3">
        {readiness.map((item) => {
          const config = CARD_CONFIG[item.type];
          const Icon = config.icon;
          const level = item.level;
          const colors = config.colors[level];
          const message = config.messages[level];

          return (
            <div
              key={item.id}
              className={`
                w-full
                ${colors.bg} rounded-2xl p-4 border border-white/60 shadow-sm
                transition-all hover:shadow-md
                flex flex-col h-full
              `}
            >
              {/* Top row: Icon on left, Status label on right */}
              <div className="flex items-center justify-between gap-2 mb-3 flex-nowrap">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.iconBg}`}>
                  <Icon size={20} />
                </div>
                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap shrink-0">
                  {getLevelLabel(item.type, level)}
                </span>
              </div>

              {/* Middle: Label */}
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                {config.label}
              </p>

              {/* Bottom: Message pushed to bottom */}
              <p className={`text-sm font-semibold leading-snug ${colors.text} mt-auto`}>
                {message}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
