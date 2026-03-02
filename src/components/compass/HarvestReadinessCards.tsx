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
        good: { bg: "bg-emerald-50", iconBg: "bg-emerald-100 text-emerald-600", dot: "bg-emerald-500", text: "text-emerald-800" },
        moderate: { bg: "bg-amber-50", iconBg: "bg-amber-100 text-amber-600", dot: "bg-amber-500", text: "text-amber-800" },
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
        good: { bg: "bg-sky-50", iconBg: "bg-sky-100 text-sky-600", dot: "bg-emerald-500", text: "text-sky-800" },
        moderate: { bg: "bg-amber-50", iconBg: "bg-amber-100 text-amber-600", dot: "bg-amber-500", text: "text-amber-800" },
        concern: { bg: "bg-red-50", iconBg: "bg-red-100 text-red-600", dot: "bg-red-500", text: "text-red-800" },
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
        good: { bg: "bg-orange-50", iconBg: "bg-orange-100 text-orange-600", dot: "bg-emerald-500", text: "text-orange-800" },
        moderate: { bg: "bg-amber-50", iconBg: "bg-amber-100 text-amber-600", dot: "bg-amber-500", text: "text-amber-800" },
        concern: { bg: "bg-red-50", iconBg: "bg-red-100 text-red-600", dot: "bg-red-500", text: "text-red-800" },
      },
    },
  };

  const getLevelLabel = (level: HarvestReadiness["level"]) => {
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
              `}
            >
              {/* Icon + Status dot */}
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.iconBg}`}>
                  <Icon size={20} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                    {getLevelLabel(level)}
                  </span>
                </div>
              </div>

              {/* Label */}
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                {config.label}
              </p>

              {/* Confidence Message — the star of the card */}
              <p className={`text-sm font-semibold leading-snug ${colors.text}`}>
                {message}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
