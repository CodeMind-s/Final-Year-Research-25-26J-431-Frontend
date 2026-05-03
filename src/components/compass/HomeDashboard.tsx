"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import {
  Sun,
  Cloud,
  CloudRain,
  Calendar,
  TrendingUp,
  ArrowRight,
  MapPin,
  AlertCircle,
  Loader,
  Target,
} from "lucide-react";
import { SalternMap } from "@/components/compass/SalternMap";
import { HarvestReadinessCards } from "@/components/compass/HarvestReadinessCards";
import { MOCK_POND_GRID } from "@/sample-data/compass/mockSalternData";
import { useAuth } from "@/hooks/useAuth";
import { useWeatherForecast } from "@/hooks/useWeatherForecast";
import { useMarketPrices } from "@/hooks/useMarketPrices";
import { getTimeBasedGreeting, getTimePeriod } from "@/lib/greeting.utils";
import { mapWeatherToReadiness, kelvinToCelsius } from "@/lib/weather-readiness.mapper";
import { getWeatherTheme, getWeatherAccentColor } from "@/lib/weather-theme.mapper";

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
  const t = useTranslations('compass');
  const { logout, user } = useAuth();
  const { weatherData, todayWeather, isLoading: weatherLoading } = useWeatherForecast();
  const { currentPrice, peakPrice, peakPriceMonth, isLoading: pricesLoading } = useMarketPrices();
  const [harvestReadiness, setHarvestReadiness] = useState(() => 
    mapWeatherToReadiness(null) // Initialize with default
  );
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());
  const timePeriod = getTimePeriod();

  // Determine card colors based on price comparison (only icon, badge, and amount text)
  const isPeakHigher = currentPrice <= peakPrice;
  const currentPriceColors = isPeakHigher 
    ? { text: 'text-orange-800', badge: 'bg-orange-100 text-orange-700', icon: 'text-orange-600' }
    : { text: 'text-green-800', badge: 'bg-green-100 text-green-700', icon: 'text-green-600' };
  const peakPriceColors = isPeakHigher
    ? { text: 'text-green-800', badge: 'bg-green-100 text-green-700', icon: 'text-green-600' }
    : { text: 'text-orange-800', badge: 'bg-orange-100 text-orange-700', icon: 'text-orange-600' };

  // Get temperature and weather condition from today's forecast
  const weatherTemp = todayWeather ? kelvinToCelsius(todayWeather.temp.day) : 32;
  const weatherCondition = todayWeather?.weather[0]?.main || "Sunny";
  const weatherDescription = todayWeather?.weather[0]?.description || "Clear skies";
  const humidity = todayWeather?.humidity || 65;
  const windSpeed = todayWeather?.speed || 12;

  // Get theme based on weather
  const theme = getWeatherTheme(weatherCondition);
  const accentColor = getWeatherAccentColor(weatherCondition);

  // Update harvest readiness when weather data changes
  useEffect(() => {
    if (todayWeather) {
      setHarvestReadiness(mapWeatherToReadiness(todayWeather));
    }
  }, [todayWeather]);

  // Update greeting every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col px-4 pt-6 pb-24 space-y-6 max-w-lg mx-auto w-full lg:max-w-4xl">
      {/* 1. Header & Weather */}
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-2xl font-bold ${theme.textPrimary}`}>{t(greeting.key)}</p>
          {/* <h1 className={`text-2xl font-bold ${theme.textPrimary}`}>{user?.name || landownerName || "User"}</h1> */}
          <div className={`flex items-center gap-1 mt-1 ${theme.textTertiary}`}>
            <MapPin size={12} />
            <span className="text-xs">{weatherData?.data?.city?.name || "Puttalam"}, {weatherData?.data?.city?.country || "Sri Lanka"}</span>
          </div>
        </div>
        <div className={`${theme.bgCard} p-3 rounded-2xl shadow-sm border flex flex-col items-center min-w-20`} style={{borderColor: 'rgba(0,0,0,0.1)'}}>
          {weatherLoading ? (
            <Loader size={24} className={`${accentColor} animate-spin mb-1`} />
          ) : (
            <>
              {weatherCondition === "Clear" && <Sun size={24} className={`${accentColor} mb-1`} />}
              {weatherCondition === "Clouds" && <Cloud size={24} className={`${accentColor} mb-1`} />}
              {weatherCondition === "Rain" && <CloudRain size={24} className={`${accentColor} mb-1`} />}
              {!["Clear", "Clouds", "Rain"].includes(weatherCondition) && <Sun size={24} className={`${accentColor} mb-1`} />}
            </>
          )}
          <span className={`text-lg font-bold ${theme.textPrimary}`}>{weatherTemp}°</span>
          <span className={`text-[10px] ${theme.textTertiary} font-medium uppercase`}>{weatherCondition}</span>
          <span className={`text-[8px] ${theme.textTertiary} font-medium mt-0.5 text-center`}>{weatherDescription}</span>
        </div>
      </div>

      {/* 2. Active Plan Widget (or create CTA) */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className={`text-sm font-bold ${theme.textPrimary}`}>{t('home.yourHarvestPlan')}</h2>
          <button
            onClick={onNavigateToPlanner}
            className={`text-xs font-semibold ${theme.linkColor} flex items-center gap-1 hover:underline`}
          >
            {t('home.goToPlanner')} <ArrowRight size={12} />
          </button>
        </div>
        
        {savedPlan ? (
          <div 
            onClick={onNavigateToPlanner}
            className={`${theme.planCardBg} rounded-2xl p-4 shadow-sm relative overflow-hidden group cursor-pointer active:scale-[0.99] transition-all`}
            style={{borderColor: 'rgba(0,0,0,0.1)'}}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${theme.bgAccent} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-100 transition-all`} />
            <div className="relative z-10 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${theme.bgAccent} flex items-center justify-center ${accentColor} ring-4 ring-opacity-5`}>
                <Calendar size={20} />
              </div>
              <div className="flex-1">
                <p className={`text-xs font-semibold ${theme.linkColor} uppercase tracking-wide`}>{t('home.activeSeason')}</p>
                <h3 className={`text-base font-bold ${theme.planCardText}`}>
                  {t('home.dayPlan', { duration: savedPlan.duration })}
                </h3>
                <p className={`text-xs ${theme.textTertiary} mt-0.5`}>
                  {t('home.started', { date: new Date(savedPlan.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }), beds: savedPlan.bedCount })}
                </p>
              </div>
              <div className={`w-8 h-8 rounded-full ${theme.bgAccent} flex items-center justify-center ${theme.textTertiary} group-hover:bg-compass-600 group-hover:text-white transition-all`}>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        ) : (
          <div 
            onClick={onNavigateToPlanner}
            className={`${theme.bgAccent} rounded-2xl p-5 border border-dashed text-center cursor-pointer hover:opacity-80 transition-all active:scale-[0.99]`}
            style={{borderColor: 'rgba(0,0,0,0.15)'}}
          >
            <div className={`w-10 h-10 ${theme.bgCard} rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm`}>
              <Calendar size={18} className={theme.textTertiary} />
            </div>
            <p className={`text-sm font-semibold ${theme.textPrimary}`}>{t('home.noActivePlan')}</p>
            <p className={`text-xs ${theme.textTertiary} mt-0.5`}>{t('home.startPlanning')}</p>
          </div>
        )}
      </div>
      {/* 3. Readiness Status (Dynamic based on weather) */}
      <div className="w-full">
         <div className="flex items-center justify-between mb-3 px-1">
          <h2 className={`text-sm font-bold ${theme.textPrimary}`}>{t('home.harvestReadiness')}</h2>
        </div>
        {weatherLoading ? (
          <div className={`${theme.bgAccent} rounded-2xl p-8 flex items-center justify-center`}>
            <Loader size={24} className={`${accentColor} animate-spin`} />
          </div>
        ) : (
          <HarvestReadinessCards readiness={harvestReadiness} />
        )}
      </div>
      {/* 4. Market Widget */}
      <div className="w-full">
         <div className="flex items-center justify-between mb-3 px-1">
          <h2 className={`text-sm font-bold ${theme.textPrimary}`}>{t('home.marketPulse')}</h2>
           <button
            onClick={onNavigateToMarket}
            className={`text-xs font-semibold text-blue-700 flex items-center gap-1 hover:underline`}
          >
            {t('home.analysis')} <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className={`${theme.marketCardBg} p-4 rounded-2xl shadow-sm flex flex-col justify-between h-28 cursor-pointer transition-colors border border-white/60`} onClick={onNavigateToMarket}>
             <div className="flex items-start justify-between">
                <div className={`p-1.5 bg-white/50 rounded-lg ${currentPriceColors.icon}`}>
                   <TrendingUp size={16} />
                </div>
                <span className={`text-[10px] font-bold ${currentPriceColors.badge} px-1.5 py-0.5 rounded`}>{t('home.now')}</span>
             </div>
             <div>
                <p className={`text-[10px] uppercase font-bold tracking-wide opacity-70`}>{t('home.currentPrice')}</p>
                <p className={`text-lg font-bold ${currentPriceColors.text}`}>Rs. {currentPrice?.toLocaleString()}</p>
             </div>
          </div>
          <div className={`${theme.marketCardBg} p-4 rounded-2xl shadow-sm flex flex-col justify-between h-28 cursor-pointer transition-colors border border-white/60`} onClick={onNavigateToMarket}>
             <div className="flex items-start justify-between">
                <div className={`p-1.5 bg-white/50 rounded-lg ${peakPriceColors.icon}`}>
                   <Target size={16} />
                </div>
                <span className={`text-[10px] font-bold ${peakPriceColors.badge} px-1.5 py-0.5 rounded`}>Peak</span>
             </div>
             <div>
                <p className={`text-[10px] ${theme.textTertiary} uppercase font-bold tracking-wide opacity-70`}>{t('home.expectedPeak')}</p>
                <p className={`text-lg font-bold ${peakPriceColors.text}`}>Rs. {peakPrice?.toLocaleString()}{peakPriceMonth ? ` (${peakPriceMonth})` : ''}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
