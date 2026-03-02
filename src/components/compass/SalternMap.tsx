"use client";

import React, { useState } from "react";
import { useTranslations } from 'next-intl';
import { MapPin, CheckCircle2, Sprout, CloudRain, Circle } from "lucide-react";
import type { Pond, PondStatus } from "@/sample-data/compass/mockSalternData";

interface SalternMapProps {
  ponds: Pond[];
  currentOwnerId: string;
  onPondSelect?: (pond: Pond) => void;
}

export const SalternMap: React.FC<SalternMapProps> = ({
  ponds,
  currentOwnerId,
  onPondSelect,
}) => {
  const t = useTranslations('compass');
  const [selectedPondId, setSelectedPondId] = useState<string | null>(null);

  const STATUS_CONFIG: Record<
    PondStatus,
    { label: string; message: string; dotColor: string }
  > = {
    ready: {
      label: t('saltern.readyToHarvest'),
      message: t('saltern.readyMessage'),
      dotColor: "bg-green-500",
    },
    growing: {
      label: t('saltern.growing'),
      message: t('saltern.growingMessage'),
      dotColor: "bg-amber-500",
    },
    flooded: {
      label: t('saltern.flooded'),
      message: t('saltern.floodedMessage'),
      dotColor: "bg-red-500",
    },
    idle: {
      label: t('saltern.idle'),
      message: t('saltern.idleMessage'),
      dotColor: "bg-slate-400",
    },
  };

  const maxCols = Math.max(...ponds.map((p) => p.col)) + 1;

  const handlePondClick = (pond: Pond) => {
    if (pond.ownerId !== currentOwnerId) return; // only owned ponds are interactive
    setSelectedPondId(selectedPondId === pond.id ? null : pond.id);
    onPondSelect?.(pond);
  };

  const selectedPond = ponds.find((p) => p.id === selectedPondId);

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <MapPin size={18} className="text-compass-600" />
        <h2 className="text-base font-bold text-slate-900">{t('saltern.mySalternLand')}</h2>
      </div>

      {/* Pond Grid */}
      <div
        className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm"
      >
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${maxCols}, 1fr)` }}
        >
          {ponds.map((pond) => {
            const isOwned = pond.ownerId === currentOwnerId;
            const isSelected = pond.id === selectedPondId;
            const status = STATUS_CONFIG[pond.status];

            return (
              <button
                key={pond.id}
                onClick={() => handlePondClick(pond)}
                disabled={!isOwned}
                className={`
                  relative aspect-square rounded-xl flex flex-col items-center justify-center
                  text-xs font-semibold transition-all duration-200
                  ${isOwned
                    ? isSelected
                      ? "bg-compass-600 text-white ring-2 ring-compass-400 ring-offset-2 scale-105 shadow-lg"
                      : "bg-compass-100 text-compass-800 hover:bg-compass-200 active:scale-95 cursor-pointer shadow-sm border border-compass-200"
                    : "bg-slate-100 text-slate-400 cursor-default border border-slate-200/60"
                  }
                `}
              >
                {/* Pond label */}
                <span className={`text-sm font-bold ${isSelected ? "text-white" : ""}`}>
                  {pond.label}
                </span>

                {/* Status dot for owned ponds */}
                {isOwned && (
                  <span
                    className={`
                      absolute top-1.5 right-1.5 w-2 h-2 rounded-full
                      ${isSelected ? "bg-white" : status.dotColor}
                    `}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Pond Info */}
        {selectedPond && selectedPond.ownerId === currentOwnerId && (
          <div className="mt-3 p-3 bg-compass-50 rounded-xl border border-compass-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[selectedPond.status].dotColor}`} />
              <span className="text-sm font-bold text-slate-900">
                {t('saltern.pond', { label: selectedPond.label })}
              </span>
              <span className="text-xs text-slate-500">&bull;</span>
              <span className="text-xs font-medium text-slate-600">
                {STATUS_CONFIG[selectedPond.status].label}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {STATUS_CONFIG[selectedPond.status].message}
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-compass-100 border border-compass-200" />
            <span className="text-[10px] text-slate-500 font-medium">{t('saltern.yourPonds')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200" />
            <span className="text-[10px] text-slate-500 font-medium">{t('saltern.other')}</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] text-slate-400">{t('saltern.ready')}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[10px] text-slate-400">{t('saltern.growing')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
