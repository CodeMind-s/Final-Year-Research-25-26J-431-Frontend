"use client";

import { useRef, useEffect } from "react";
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

  // 45-day and 16-day cutoffs from today
  const maxPredictionDate = new Date();
  maxPredictionDate.setDate(maxPredictionDate.getDate() + 45);
  const maxPredictionStr = maxPredictionDate.toISOString().split("T")[0];

  const weatherCutoffDate = new Date();
  weatherCutoffDate.setDate(weatherCutoffDate.getDate() + 16);
  const weatherCutoffStr = weatherCutoffDate.toISOString().split("T")[0];

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayCellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoadingDailyData && calendarDays.length > 0) {
      setTimeout(() => {
        if (scrollContainerRef.current && todayCellRef.current) {
          const container = scrollContainerRef.current;
          const todayEl = todayCellRef.current;
          container.scrollTop = todayEl.offsetTop - container.offsetTop - 16;
        }
      }, 100);
    }
  }, [isLoadingDailyData, calendarDays.length]);

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
          <span className="text-yellow-600 font-medium">16-day weather forecast</span> · <span className="text-primary font-medium">45-day parameter predictions</span>
        </p>
      </div>

      <div ref={scrollContainerRef} className="max-h-[500px] sm:max-h-[600px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                const isPast = day.dateStr < today;
                const isBeyond45 = day.dateStr > maxPredictionStr;
                const hasWeather = !!day.weatherData;
                const isParameterOnly = !hasWeather && day.dateStr >= today && day.dateStr <= maxPredictionStr;
                const weatherBg = hasWeather
                  ? getWeatherBackground(day.weatherData!.weather[0]?.icon || "01d")
                  : "bg-background";

                return (
                  <div
                    ref={isToday ? todayCellRef : undefined}
                    key={`${day.dateStr}-${index}`}
                    className={`
                      relative p-2 sm:p-2 rounded-lg border transition-all min-h-24 sm:min-h-36 flex flex-col items-center justify-center sm:items-start sm:justify-start
                      ${!day.isCurrentMonth ? "opacity-40" : ""}
                      ${isToday ? "border-primary border-2" : "border-border"}
                      ${isToday ? "bg-primary/10" : isBeyond45 ? "bg-muted/30" : weatherBg}
                      ${isPast ? "opacity-60" : ""}
                      ${isBeyond45 ? "opacity-40" : ""}
                      ${isParameterOnly ? "border-dashed" : ""}
                    `}
                  >
                    {/* Date Number */}
                    <div className="text-xs sm:text-base font-bold text-foreground mb-1 sm:mb-1 w-full text-center sm:text-left">
                      {day.dayNumber}
                    </div>

                    {/* Weather Information */}
                    {day.weatherData && (
                      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-0.5 sm:gap-1 mb-0 sm:mb-1.5">
                        {getWeatherIcon(day.weatherData.weather[0]?.icon || "01d")}
                        <span className="text-xs sm:text-sm font-medium text-foreground">
                          {kelvinToCelsius(day.weatherData.temp.day)}°
                        </span>
                      </div>
                    )}

                    {/* No weather indicator for parameter-only days */}
                    {isParameterOnly && (
                      <div className="hidden sm:flex items-center gap-0.5 mb-1">
                        <Cloud className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                        <span className="text-[8px] text-muted-foreground/40">no forecast</span>
                      </div>
                    )}

                    {/* Parameters - Hidden on mobile, visible on tablet+ */}
                    <div className="hidden sm:grid w-full flex-1 grid-cols-2 gap-1 mt-auto">
                      {day.OR_brine_level !== undefined && (
                        <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] bg-blue-100/50 rounded px-1 py-0.5">
                          <Droplets className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600 shrink-0" />
                          <span className="font-medium text-foreground truncate">OR {day.OR_brine_level.toFixed(1)}</span>
                        </div>
                      )}
                      {day.OR_bund_level !== undefined && (
                        <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] bg-purple-100/50 rounded px-1 py-0.5">
                          <Waves className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-purple-600 shrink-0" />
                          <span className="font-medium text-foreground truncate">OR {day.OR_bund_level.toFixed(1)}m</span>
                        </div>
                      )}
                      {day.IR_brine_level !== undefined && (
                        <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] bg-cyan-100/50 rounded px-1 py-0.5">
                          <Droplets className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-cyan-600 shrink-0" />
                          <span className="font-medium text-foreground truncate">IR {day.IR_brine_level.toFixed(1)}</span>
                        </div>
                      )}
                      {day.IR_bound_level !== undefined && (
                        <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] bg-teal-100/50 rounded px-1 py-0.5">
                          <Waves className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-teal-600 shrink-0" />
                          <span className="font-medium text-foreground truncate">IR {day.IR_bound_level.toFixed(1)}m</span>
                        </div>
                      )}
                      {day.lagoon !== undefined && (
                        <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] bg-emerald-100/50 rounded px-1 py-0.5">
                          <Activity className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-600 shrink-0" />
                          <span className="font-medium text-foreground truncate">LGN {day.lagoon.toFixed(1)}m</span>
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
            <h3 className="text-xs sm:text-sm font-semibold text-foreground">{nextMonthName}</h3>
          </div>

          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-2 sm:gap-2 mb-1.5 sm:mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-[10px] sm:text-xs font-medium text-muted-foreground text-center py-0.5 sm:py-1">
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
                const isPast = day.dateStr < today;
                const isBeyond45 = day.dateStr > maxPredictionStr;
                const hasWeather = !!day.weatherData;
                const isParameterOnly = !hasWeather && day.dateStr >= today && day.dateStr <= maxPredictionStr;
                const weatherBg = hasWeather
                  ? getWeatherBackground(day.weatherData!.weather[0]?.icon || "01d")
                  : "bg-background";

                return (
                  <div
                    ref={isToday ? todayCellRef : undefined}
                    key={`${day.dateStr}-${index}`}
                    className={`
                      relative p-2 sm:p-2 rounded-lg border transition-all min-h-24 sm:min-h-36 flex flex-col items-center justify-center sm:items-start sm:justify-start
                      ${isToday ? "border-primary border-2" : "border-border"}
                      ${isToday ? "bg-primary/10" : isBeyond45 ? "bg-muted/30" : weatherBg}
                      ${isPast ? "opacity-60" : ""}
                      ${isBeyond45 ? "opacity-40" : ""}
                      ${isParameterOnly ? "border-dashed" : ""}
                    `}
                  >
                    <div className="text-xs sm:text-base font-bold text-foreground mb-1 sm:mb-1 w-full text-center sm:text-left">
                      {day.dayNumber}
                    </div>

                    {/* Weather Information */}
                    {hasWeather && (
                      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-0.5 sm:gap-1 mb-0 sm:mb-1.5">
                        {getWeatherIcon(day.weatherData!.weather[0]?.icon || "01d")}
                        <span className="text-xs sm:text-sm font-medium text-foreground">
                          {kelvinToCelsius(day.weatherData!.temp.day)}°
                        </span>
                      </div>
                    )}

                    {/* No weather indicator for parameter-only days */}
                    {isParameterOnly && (
                      <div className="hidden sm:flex items-center gap-0.5 mb-1">
                        <Cloud className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                        <span className="text-[8px] text-muted-foreground/40">no forecast</span>
                      </div>
                    )}

                    {/* Parameters - Hidden on mobile, visible on tablet+ */}
                    <div className="hidden sm:grid w-full flex-1 grid-cols-2 gap-1 mt-auto">
                      {day.OR_brine_level !== undefined && (
                        <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] bg-blue-100/50 rounded px-1 py-0.5">
                          <Droplets className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600 shrink-0" />
                          <span className="font-medium text-foreground truncate">OR {day.OR_brine_level.toFixed(1)}</span>
                        </div>
                      )}
                      {day.OR_bund_level !== undefined && (
                        <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] bg-purple-100/50 rounded px-1 py-0.5">
                          <Waves className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-purple-600 shrink-0" />
                          <span className="font-medium text-foreground truncate">OR {day.OR_bund_level.toFixed(1)}m</span>
                        </div>
                      )}
                      {day.IR_brine_level !== undefined && (
                        <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] bg-cyan-100/50 rounded px-1 py-0.5">
                          <Droplets className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-cyan-600 shrink-0" />
                          <span className="font-medium text-foreground truncate">IR {day.IR_brine_level.toFixed(1)}</span>
                        </div>
                      )}
                      {day.IR_bound_level !== undefined && (
                        <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] bg-teal-100/50 rounded px-1 py-0.5">
                          <Waves className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-teal-600 shrink-0" />
                          <span className="font-medium text-foreground truncate">IR {day.IR_bound_level.toFixed(1)}m</span>
                        </div>
                      )}
                      {day.lagoon !== undefined && (
                        <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] bg-emerald-100/50 rounded px-1 py-0.5">
                          <Activity className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-600 shrink-0" />
                          <span className="font-medium text-foreground truncate">LGN {day.lagoon.toFixed(1)}m</span>
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
          <span className="text-muted-foreground">Weather (16d)</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded border border-dashed border-border shrink-0"></div>
          <span className="text-muted-foreground">Params only (45d)</span>
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
