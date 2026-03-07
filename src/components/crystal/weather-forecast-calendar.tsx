"use client";

import { useState } from "react";
import { Card } from "@/components/crystal/ui/card";
import { CalendarDay, WeatherForecastDay } from "@/types/crystallization.types";
import {
  Cloud,
  CloudRain,
  CloudDrizzle,
  Sun,
  CloudSnow,
  CloudFog,
  CloudLightning,
  Cloudy,
  Droplets,
  Waves,
  Activity,
} from "lucide-react";
import { useTranslations } from "next-intl";

// Weather icon mapping
const getWeatherIcon = (iconCode: string) => {
  const code = iconCode.replace(/[dn]$/, ""); // Remove day/night suffix

  switch (code) {
    case "01": // clear sky
      return <Sun className="h-5 w-5 sm:h-4 sm:w-4 text-yellow-500 shrink-0" />;
    case "02": // few clouds
      return <Cloudy className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400 shrink-0" />;
    case "03": // scattered clouds
      return <Cloud className="h-5 w-5 sm:h-4 sm:w-4 text-gray-500 shrink-0" />;
    case "04": // broken clouds
      return <Cloud className="h-5 w-5 sm:h-4 sm:w-4 text-gray-600 shrink-0" />;
    case "09": // shower rain
      return <CloudDrizzle className="h-5 w-5 sm:h-4 sm:w-4 text-blue-400 shrink-0" />;
    case "10": // rain
      return <CloudRain className="h-5 w-5 sm:h-4 sm:w-4 text-blue-500 shrink-0" />;
    case "11": // thunderstorm
      return <CloudLightning className="h-5 w-5 sm:h-4 sm:w-4 text-purple-500 shrink-0" />;
    case "13": // snow
      return <CloudSnow className="h-5 w-5 sm:h-4 sm:w-4 text-blue-200 shrink-0" />;
    case "50": // mist/fog/haze
      return <CloudFog className="h-5 w-5 sm:h-4 sm:w-4 text-gray-300 shrink-0" />;
    default: // fallback for any unknown weather
      return <Cloud className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400 shrink-0" />;
  }
};

// Convert Kelvin to Celsius
const kelvinToCelsius = (kelvin: number): number => {
  return Math.round(kelvin - 273.15);
};

// Get background color based on weather condition
const getWeatherBackground = (iconCode: string): string => {
  const code = iconCode.replace(/[dn]$/, ""); // Remove day/night suffix

  switch (code) {
    case "01": // clear sky - sunny yellow
    case "02": // few clouds
      return "bg-yellow-500/10 border-yellow-500/50";
    case "03": // scattered clouds
    case "04": // broken clouds - cloudy gray
    case "50": // mist
      return "bg-gray-400/10 border-gray-400/50";
    case "09": // shower rain
    case "10": // rain - rainy blue
    case "11": // thunderstorm
      return "bg-blue-500/10 border-blue-500/50";
    case "13": // snow
      return "bg-blue-200/10 border-blue-200/50";
    default:
      return "bg-background";
  }
};

export function WeatherForecastCalendar({ calendarDays, isLoadingDailyData }: { calendarDays: CalendarDay[]; isLoadingDailyData: boolean }) {
  const t = useTranslations("crystal");

  const weekDays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  const today = new Date().toISOString().split("T")[0];

  // Get current and next month names
  const currentMonthName = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const nextMonthName = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    1,
  ).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  if (isLoadingDailyData) {
    return (
      <Card className="p-3 sm:p-4">
        <div className="flex items-center justify-center h-64 sm:h-96">
          <div className="text-muted-foreground text-xs sm:text-sm">Loading forecast data...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3 sm:p-4">
      <div className="mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-foreground">
          Weather & Environmental Predictions
        </h2>
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          16-day weather forecast with predicted salinity, brine levels, and
          water levels
        </p>
      </div>

      <div className="max-h-[500px] sm:max-h-[600px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Current Month */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <div className="h-1 w-1 rounded-full bg-primary"></div>
            <h3 className="text-xs sm:text-sm font-semibold text-foreground">
              {currentMonthName}
            </h3>
          </div>

          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-2 sm:gap-2 mb-1.5 sm:mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-[10px] sm:text-xs font-medium text-muted-foreground text-center py-0.5 sm:py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid for current month */}
          <div className="grid grid-cols-7 gap-2 sm:gap-2">
            {calendarDays
              .filter((day) => {
                const currentMonth = new Date().getMonth();
                return (
                  day.date.getMonth() === currentMonth ||
                  (day.date.getMonth() === currentMonth - 1 &&
                    !day.isCurrentMonth)
                );
              })
              .map((day, index) => {
                const isToday = day.dateStr === today;
                const hasData =
                  day.OR_brine_level !== undefined ||
                  day.OR_bund_level !== undefined ||
                  day.IR_brine_level !== undefined ||
                  day.IR_bound_level !== undefined ||
                  day.lagoon !== undefined;
                const isPast = new Date(day.dateStr) < new Date(today);
                const weatherBg = day.weatherData
                  ? getWeatherBackground(
                      day.weatherData.weather[0]?.icon || "01d",
                    )
                  : "bg-background";

                return (
                  <div
                    key={`${day.dateStr}-${index}`}
                    className={`
                      relative p-2 sm:p-2 rounded-lg border transition-all min-h-24 sm:min-h-36 flex flex-col items-center justify-center sm:items-start sm:justify-start
                      ${!day.isCurrentMonth ? "opacity-40" : ""}
                      ${isToday ? "border-primary border-2" : "border-border"}
                      ${isToday ? "bg-primary/10" : weatherBg}
                      ${isPast ? "opacity-60" : ""}
                    `}
                  >
                    {/* Date Number */}
                    <div className="text-xs sm:text-base font-bold text-foreground mb-1 sm:mb-1 w-full text-center sm:text-left">
                      {day.dayNumber}
                    </div>

                    {/* Weather Information */}
                    {day.weatherData && (
                      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-0.5 sm:gap-1 mb-0 sm:mb-1.5">
                        {getWeatherIcon(
                          day.weatherData.weather[0]?.icon || "01d",
                        )}
                        <span className="text-xs sm:text-sm font-medium text-foreground">
                          {kelvinToCelsius(day.weatherData.temp.day)}°
                        </span>
                      </div>
                    )}

                    {/* Parameters - Hidden on mobile, visible on tablet+ */}
                    <div className="hidden sm:grid w-full flex-1 grid-cols-2 gap-1 mt-auto">
                      {/* OR Brine Level (Salinity) */}
                      {day.OR_brine_level !== undefined && (
                        <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] bg-blue-100/50 rounded px-1 py-0.5">
                          <Droplets className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600 shrink-0" />
                          <span className="font-medium text-foreground truncate">
                           OR {day.OR_brine_level.toFixed(1)}
                          </span>
                        </div>
                      )}

                      {/* OR Bund Level */}
                      {day.OR_bund_level !== undefined && (
                        <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] bg-purple-100/50 rounded px-1 py-0.5">
                          <Waves className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-purple-600 shrink-0" />
                          <span className="font-medium text-foreground truncate">
                         OR {day.OR_bund_level.toFixed(1)}m
                          </span>
                        </div>
                      )}

                      {/* IR Brine Level */}
                      {day.IR_brine_level !== undefined && (
                        <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] bg-cyan-100/50 rounded px-1 py-0.5">
                          <Droplets className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-cyan-600 shrink-0" />
                          <span className="font-medium text-foreground truncate">
                           IR {day.IR_brine_level.toFixed(1)}
                          </span>
                        </div>
                      )}

                      {/* IR Bound Level */}
                      {day.IR_bound_level !== undefined && (
                        <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] bg-teal-100/50 rounded px-1 py-0.5">
                          <Waves className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-teal-600 shrink-0" />
                          <span className="font-medium text-foreground truncate">
                            IR {day.IR_bound_level.toFixed(1)}m
                          </span>
                        </div>
                      )}

                      {/* Lagoon Water Level */}
                      {day.lagoon !== undefined && (
                        <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] bg-emerald-100/50 rounded px-1 py-0.5">
                          <Activity className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-600 shrink-0" />
                          <span className="font-medium text-foreground truncate">
                            LGN {day.lagoon.toFixed(1)}m
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Next Month */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <div className="h-1 w-1 rounded-full bg-primary"></div>
            <h3 className="text-xs sm:text-sm font-semibold text-foreground">
              {nextMonthName}
            </h3>
          </div>

          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-2 sm:gap-2 mb-1.5 sm:mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-[10px] sm:text-xs font-medium text-muted-foreground text-center py-0.5 sm:py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid for next month */}
          <div className="grid grid-cols-7 gap-2 sm:gap-2">
            {calendarDays
              .filter((day) => {
                const nextMonth = new Date().getMonth() + 1;
                return day.date.getMonth() === nextMonth;
              })
              .map((day, index) => {
                const isToday = day.dateStr === today;
                const hasData =
                  day.OR_brine_level !== undefined ||
                  day.OR_bund_level !== undefined ||
                  day.IR_brine_level !== undefined ||
                  day.IR_bound_level !== undefined ||
                  day.lagoon !== undefined;
                const isPast = new Date(day.dateStr) < new Date(today);
                const weatherBg = day.weatherData
                  ? getWeatherBackground(
                      day.weatherData.weather[0]?.icon || "01d",
                    )
                  : "bg-background";

                return (
                  <div
                    key={`${day.dateStr}-${index}`}
                    className={`
                      relative p-2 sm:p-2 rounded-lg border transition-all min-h-24 sm:min-h-36 flex flex-col items-center justify-center sm:items-start sm:justify-start
                      ${isToday ? "border-primary border-2" : "border-border"}
                      ${isToday ? "bg-primary/10" : weatherBg}
                      ${isPast ? "opacity-60" : ""}
                    `}
                  >
                    <div className="text-lg sm:text-base font-bold text-foreground mb-1 sm:mb-1 w-full text-center sm:text-left">
                      {day.dayNumber}
                    </div>

                    {/* Weather Information */}
                    {day.weatherData && (
                      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-0.5 sm:gap-1 mb-0 sm:mb-1.5">
                        {getWeatherIcon(
                          day.weatherData.weather[0]?.icon || "01d",
                        )}
                        <span className="text-xs sm:text-sm font-medium text-foreground">
                          {kelvinToCelsius(day.weatherData.temp.day)}°
                        </span>
                      </div>
                    )}

                    {/* Parameters - Hidden on mobile, visible on tablet+ */}
                    <div className="hidden sm:grid w-full flex-1 grid-cols-2 gap-1 mt-auto">
                      {/* OR Brine Level (Salinity) */}
                      {day.OR_brine_level !== undefined && (
                        <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] bg-blue-100/50 rounded px-1 py-0.5">
                          <Droplets className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600 shrink-0" />
                          <span className="font-medium text-foreground truncate">
                            {day.OR_brine_level.toFixed(1)}
                          </span>
                        </div>
                      )}

                      {/* OR Bund Level */}
                      {day.OR_bund_level !== undefined && (
                        <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] bg-purple-100/50 rounded px-1 py-0.5">
                          <Waves className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-purple-600 shrink-0" />
                          <span className="font-medium text-foreground truncate">
                            {day.OR_bund_level.toFixed(1)}m
                          </span>
                        </div>
                      )}

                      {/* IR Brine Level */}
                      {day.IR_brine_level !== undefined && (
                        <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] bg-cyan-100/50 rounded px-1 py-0.5">
                          <Droplets className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-cyan-600 shrink-0" />
                          <span className="font-medium text-foreground truncate">
                            {day.IR_brine_level.toFixed(1)}
                          </span>
                        </div>
                      )}

                      {/* IR Bound Level */}
                      {day.IR_bound_level !== undefined && (
                        <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] bg-teal-100/50 rounded px-1 py-0.5">
                          <Waves className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-teal-600 shrink-0" />
                          <span className="font-medium text-foreground truncate">
                            {day.IR_bound_level.toFixed(1)}m
                          </span>
                        </div>
                      )}

                      {/* Lagoon Water Level */}
                      {day.lagoon !== undefined && (
                        <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] bg-emerald-100/50 rounded px-1 py-0.5">
                          <Activity className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-600 shrink-0" />
                          <span className="font-medium text-foreground truncate">
                            {day.lagoon.toFixed(1)}m
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t text-[10px] sm:text-xs flex-wrap">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded bg-primary/10 border-2 border-primary shrink-0"></div>
          <span className="text-muted-foreground">Today</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded bg-blue-50 border border-border shrink-0"></div>
          <span className="text-muted-foreground">Predictions</span>
        </div>
        <div className="hidden sm:block h-4 w-px bg-border"></div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Sun className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-amber-500 shrink-0" />
          <Cloud className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400 shrink-0" />
          <CloudRain className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500 shrink-0" />
          <span className="text-muted-foreground">Weather</span>
        </div>
        <div className="hidden sm:block h-4 w-px bg-border"></div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Droplets className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600 shrink-0" />
          <span className="text-muted-foreground">OR Brine</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Waves className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-purple-600 shrink-0" />
          <span className="text-muted-foreground">OR Bund</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Droplets className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-cyan-600 shrink-0" />
          <span className="text-muted-foreground">IR Brine</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Waves className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-teal-600 shrink-0" />
          <span className="text-muted-foreground">IR Bund</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Activity className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-600 shrink-0" />
          <span className="text-muted-foreground">Lagoon</span>
        </div>
      </div>
    </Card>
  );
}
