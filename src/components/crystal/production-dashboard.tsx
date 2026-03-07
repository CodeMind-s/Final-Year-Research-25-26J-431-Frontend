/**
 * @module ProductionDashboard
 * 
 * Main production prediction dashboard for the Crystal module.
 * Displays environmental predictions, production forecasts, season summary,
 * and weather forecast calendar with comprehensive charts and metrics.
 */

"use client"

import { Card } from "@/components/crystal/ui/card"
import { Badge } from "@/components/crystal/ui/badge"
import { Button } from "@/components/crystal/ui/button"
import { useTranslations } from 'next-intl'
import { TrendingUp, Droplets, Activity, Cloud, AlertCircle } from "lucide-react"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Label } from "recharts"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ForecastReportDialog } from "@/components/crystal/dialogs/forecast-report-dialog"
import { NotifySupervisorsDialog } from "@/components/crystal/dialogs/notify-supervisors-dialog"
import { crystallizationController } from "@/services/crystallization.controller"
import { CalendarDay, PredictedMonthlyProduction, WeatherForecastDay } from "@/types/crystallization.types"
import { productionController } from "@/services/production.controller"
import { WeatherForecastCalendar } from "@/components/crystal/weather-forecast-calendar"

// Transform API data to chart format
const transformDailyEnvironmentalData = (
  historicalData: any[],
  predictedData: any[],
  startDate: string,
  endDate: string
): any[] => {
  const result: any[] = []

  // Create a map for quick lookup
  const historicalMap = new Map()
  const predictedMap = new Map()

  historicalData.forEach(item => {
    if (item && item.date) {
      // Normalize date to YYYY-MM-DD format (handle both ISO strings and date-only strings)
      const dateStr = item.date.split('T')[0]
      historicalMap.set(dateStr, item)
    }
  })

  predictedData.forEach(item => {
    if (item && item.date) {
      // Normalize date to YYYY-MM-DD format (handle both ISO strings and date-only strings)
      const dateStr = item.date.split('T')[0]
      predictedMap.set(dateStr, item)
    }
  })

  // Generate all dates in the range
  const start = new Date(startDate)
  const end = new Date(endDate)
  const currentDate = new Date(start)

  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const isHistorical = currentDate <= new Date()

    const historicalItem = historicalMap.get(dateStr)
    const predictedItem = predictedMap.get(dateStr)
    const item = isHistorical ? historicalItem : predictedItem

    // Format period for display
    const period = currentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

    if (item) {
      // Data exists for this date
      result.push({
        date: dateStr,
        period,
        water_temperature: item.parameters?.water_temperature != null ? parseFloat(item.parameters.water_temperature.toFixed(2)) : null,
        lagoon: item.parameters?.lagoon != null ? parseFloat(item.parameters.lagoon.toFixed(2)) : null,
        OR_brine_level: item.parameters?.OR_brine_level != null ? parseFloat(item.parameters.OR_brine_level.toFixed(2)) : null,
        OR_bund_level: item.parameters?.OR_bund_level != null ? parseFloat(item.parameters.OR_bund_level.toFixed(2)) : null,
        IR_brine_level: item.parameters?.IR_brine_level != null ? parseFloat(item.parameters.IR_brine_level.toFixed(2)) : null,
        IR_bound_level: item.parameters?.IR_bound_level != null ? parseFloat(item.parameters.IR_bound_level.toFixed(2)) : null,
        East_channel: item.parameters?.East_channel != null ? parseFloat(item.parameters.East_channel.toFixed(2)) : null,
        West_channel: item.parameters?.West_channel != null ? parseFloat(item.parameters.West_channel.toFixed(2)) : null,
        // For predicted data, don't populate weather fields - they'll be populated by weather forecast API for first 16 days only
        rainfall: isHistorical && item.weather?.rain_sum != null ? parseFloat(item.weather.rain_sum.toFixed(2)) : null,
        temperature: isHistorical && item.weather?.temperature_mean != null ? parseFloat(item.weather.temperature_mean.toFixed(2)) : null,
        humidity: isHistorical && item.weather?.relative_humidity_mean != null ? parseFloat(item.weather.relative_humidity_mean.toFixed(2)) : null,
        type: isHistorical ? 'historical' : 'predicted'
      })
    } else {
      // No data for this date - use null values
      result.push({
        date: dateStr,
        period,
        water_temperature: null,
        lagoon: null,
        OR_brine_level: null,
        OR_bund_level: null,
        IR_brine_level: null,
        IR_bound_level: null,
        East_channel: null,
        West_channel: null,
        rainfall: null,
        temperature: null,
        humidity: null,
        type: isHistorical ? 'historical' : 'predicted'
      })
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return result
}

export function ProductionDashboard() {
  const t = useTranslations('crystal')
  const router = useRouter()
  const [forecastDialogOpen, setForecastDialogOpen] = useState(false)
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false)
  const [monthlyProductionData, setMonthlyProductionData] = useState<PredictedMonthlyProduction[]>([])
  const [isLoadingMonthlyData, setIsLoadingMonthlyData] = useState(true)
  const [dailyEnvironmentalData, setDailyEnvironmentalData] = useState<any[]>([])
  const [isLoadingDailyData, setIsLoadingDailyData] = useState(true)
  const [hiddenDataKeys, setHiddenDataKeys] = useState<Set<string>>(new Set(['humidity']))
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [isLoadingDailyCalendarData, setIsLoadingDailyCalendarData] = useState(true);
  const [modelPerformance, setModelPerformance] = useState<any>(null);
  const [isLoadingModelPerformance, setIsLoadingModelPerformance] = useState(true);

  // Fetch daily environmental data (historical + predicted)
  useEffect(() => {
    const fetchDailyEnvironmentalData = async () => {
      const today = new Date()
      try {
        setIsLoadingDailyData(true)

        // Calculate date ranges
        const formatDate = (d: Date) => d.toISOString().split('T')[0]

        // Historical: 6 months ago to today
        const historicalStart = new Date(today)
        historicalStart.setMonth(today.getMonth() - 6)
        const historicalStartStr = formatDate(historicalStart)
        const todayStr = formatDate(today)

        // Predicted: today to 2 months from now
        const predictedEnd = new Date(today)
        predictedEnd.setMonth(today.getMonth() + 2)
        const predictedEndStr = formatDate(predictedEnd)

        // For now, use mock data for historical since API doesn't exist yet
        // Only fetch predicted data from API
        let historicalData: any[] = []
        let predictedData: any[] = []

        try {
          // Fetch historical data from API
          const historicalResponse = await crystallizationController.getDailyMeasurements({
            startDate: historicalStartStr,
            endDate: todayStr,
          })
          historicalData = Array.isArray(historicalResponse) ? historicalResponse : ((historicalResponse as any)?.data || [])
        } catch (error) {
          console.error("Failed to fetch historical data:", error)
          // Fallback to mock data if API fails
          historicalData = []
        }

        try {
          // Fetch predicted data from API
          const predictedResponse = await crystallizationController.getPredictedDailyMeasurements({
            startDate: todayStr,
            endDate: predictedEndStr,
          })
          predictedData = Array.isArray(predictedResponse) ? predictedResponse : ((predictedResponse as any)?.data || [])
        } catch (error) {
          console.error("Failed to fetch predicted data:", error)
          predictedData = []
        }

        // Transform the data
        const transformedData = transformDailyEnvironmentalData(
          historicalData,
          predictedData,
          historicalStartStr,
          predictedEndStr
        )
        setDailyEnvironmentalData(transformedData)
      } catch (error) {
        console.error("Failed to fetch daily environmental data:", error)
        // Use mock data as fallback
        const historicalStart = new Date(today)
        historicalStart.setMonth(today.getMonth() - 6)
        const predictedEnd = new Date(today)
        predictedEnd.setMonth(today.getMonth() + 2)


      } finally {
        setIsLoadingDailyData(false)
      }
    }

    fetchDailyEnvironmentalData()
  }, [])

  // Fetch both actual and predicted monthly production data
  useEffect(() => {
    const fetchMonthlyProductions = async () => {
      const date = new Date();
      try {
        setIsLoadingMonthlyData(true)

        const formatDate = (d: Date) => d.toISOString().slice(0, 7)
        const startActual = formatDate(new Date(date.getFullYear(), date.getMonth() - 10, 15))
        const currentMonth = formatDate(date)
        const endPredicted = formatDate(new Date(date.getFullYear(), date.getMonth() + 1, 15))

        const [actualResponse, predictedResponse] = await Promise.all([
          productionController.getActualMonthlyProductions({
            startMonth: startActual,
            endMonth: currentMonth,
          }),
          crystallizationController.getPredictedMonthlyProductions({
            startMonth: currentMonth,
            endMonth: endPredicted,
          }),
        ])

        // The http-client already extracts the data, so responses are arrays directly
        const actualData = Array.isArray(actualResponse) ? actualResponse : (actualResponse?.data || [])
        const predictedData = Array.isArray(predictedResponse) ? predictedResponse : (predictedResponse?.data || [])

        // Transform the data
        const transformedData = transformProductionData(
          actualData,
          predictedData
        )

        // Always set the transformed data (with null check)
        if (transformedData && Array.isArray(transformedData)) {
          setMonthlyProductionData(transformedData)
        } else {
          console.error('Transform returned invalid data:', transformedData)
        }
      } catch (error) {
        console.error("Failed to fetch monthly productions:", error)
        // Use fallback data on error
      } finally {
        setIsLoadingMonthlyData(false)
      }
    }

    fetchMonthlyProductions()
  }, [])

  // Fetch model performance data
  useEffect(() => {
    const fetchModelPerformance = async () => {
      try {
        setIsLoadingModelPerformance(true)
        const response = await crystallizationController.getCrystallizationModelPerformance({
          limit: 1
        })
        setModelPerformance(response)
      } catch (error) {
        console.error("Failed to fetch model performance:", error)
        setModelPerformance(null)
      } finally {
        setIsLoadingModelPerformance(false)
      }
    }

    fetchModelPerformance()
  }, [])

  useEffect(() => {
    const fetchDataForCalendar = async () => {
      try {
        setIsLoadingDailyCalendarData(true);

        // Fetch both weather forecast and predicted daily measurements
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + 60); // 60 days ahead to cover 2 months
        const futureDateStr = futureDate.toISOString().split("T")[0];

        // Fetch weather forecast (with fallback to mock data on error)
        let weatherResponse: any;
        try {
          weatherResponse =
            await crystallizationController.getWeatherForecast();
        } catch (error) {
          console.error("Failed to fetch weather forecast:", error);
          weatherResponse = null;
        }

        // Fetch predicted measurements
        const predictedDataResponse =
          await crystallizationController.getPredictedDailyMeasurements({
            startDate: todayStr,
            endDate: futureDateStr,
          });

        // Extract weather data
        let weatherList: WeatherForecastDay[] = [];
        if (weatherResponse) {
          if (Array.isArray(weatherResponse)) {
            weatherList = weatherResponse;
          } else if (weatherResponse?.data?.list) {
            weatherList = weatherResponse.data.list;
          } else if (weatherResponse?.list) {
            weatherList = weatherResponse.list;
          }
        }

        // Extract predicted data
        const predictedDataList = Array.isArray(predictedDataResponse)
          ? predictedDataResponse
          : predictedDataResponse?.data || [];

        // Helper function to format date consistently (LOCAL date, not UTC)
        const formatDateStr = (date: Date): string => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        // Create maps for both data types
        const weatherMap = new Map<string, WeatherForecastDay>();
        weatherList.forEach((day) => {
          const date = new Date(day.dt * 1000);
          // Use local date to match calendar days
          const dateStr = formatDateStr(date);
          weatherMap.set(dateStr, day);
        });

        const predictedMap = new Map<string, any>();
        predictedDataList.forEach((item: any) => {
          if (item && item.date) {
            const dateStr = item.date.split("T")[0];
            predictedMap.set(dateStr, item);
          }
        });

        // Generate calendar days for current month and next month
        const days: CalendarDay[] = [];

        // Current month
        const currentMonthStart = new Date(
          today.getFullYear(),
          today.getMonth(),
          1,
        );
        const currentMonthEnd = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
        );

        // Next month
        const nextMonthStart = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          1,
        );
        const nextMonthEnd = new Date(
          today.getFullYear(),
          today.getMonth() + 2,
          0,
        );

        // Get day of week for first day of current month (0 = Sunday)
        const firstDayOfWeek = currentMonthStart.getDay();

        // Add empty days for current month alignment
        for (let i = 0; i < firstDayOfWeek; i++) {
          const date = new Date(currentMonthStart);
          date.setDate(date.getDate() - (firstDayOfWeek - i));
          const dateStr = formatDateStr(date);
          const predictedData = predictedMap.get(dateStr);
          const weatherData = weatherMap.get(dateStr);

          days.push({
            date,
            dateStr,
            dayNumber: date.getDate(),
            isCurrentMonth: false,
            weatherData,
            OR_brine_level: predictedData?.parameters?.OR_brine_level,
            OR_bund_level: predictedData?.parameters?.OR_bund_level,
            IR_brine_level: predictedData?.parameters?.IR_brine_level,
            IR_bound_level: predictedData?.parameters?.IR_bound_level,
            lagoon: predictedData?.parameters?.lagoon,
          });
        }

        // Add current month days
        for (let day = 1; day <= currentMonthEnd.getDate(); day++) {
          const date = new Date(today.getFullYear(), today.getMonth(), day);
          const dateStr = formatDateStr(date);
          const predictedData = predictedMap.get(dateStr);
          const weatherData = weatherMap.get(dateStr);

          days.push({
            date,
            dateStr,
            dayNumber: day,
            isCurrentMonth: true,
            weatherData,
            OR_brine_level: predictedData?.parameters?.OR_brine_level,
            OR_bund_level: predictedData?.parameters?.OR_bund_level,
            IR_brine_level: predictedData?.parameters?.IR_brine_level,
            IR_bound_level: predictedData?.parameters?.IR_bound_level,
            lagoon: predictedData?.parameters?.lagoon,
          });
        }

        // Add next month days
        for (let day = 1; day <= nextMonthEnd.getDate(); day++) {
          const date = new Date(today.getFullYear(), today.getMonth() + 1, day);
          const dateStr = formatDateStr(date);
          const predictedData = predictedMap.get(dateStr);
          const weatherData = weatherMap.get(dateStr);

          days.push({
            date,
            dateStr,
            dayNumber: day,
            isCurrentMonth: false,
            weatherData,
            OR_brine_level: predictedData?.parameters?.OR_brine_level,
            OR_bund_level: predictedData?.parameters?.OR_bund_level,
            IR_brine_level: predictedData?.parameters?.IR_brine_level,
            IR_bound_level: predictedData?.parameters?.IR_bound_level,
            lagoon: predictedData?.parameters?.lagoon,
          });
        }

        setCalendarDays(days);

        // Update dailyEnvironmentalData with weather forecast data
        // Weather API returns 16 days - overlay rainfall, temperature, humidity for first 16 days only
        setDailyEnvironmentalData(prevData => {
          // Convert Kelvin to Celsius for temperature
          const kelvinToCelsius = (kelvin: number) => parseFloat((kelvin - 273.15).toFixed(2));
          
          // If no previous data exists, create initial structure
          if (!prevData || prevData.length === 0) {
            return prevData;
          }

          // Calculate dates for comparison (normalize to start of day)
          const todayStart = new Date(today);
          todayStart.setHours(0, 0, 0, 0);
          
          const sixteenDaysFromNow = new Date(todayStart);
          sixteenDaysFromNow.setDate(sixteenDaysFromNow.getDate() + 16);
          
          // Update the existing data
          const updatedData = prevData.map((item) => {
            const itemDate = new Date(item.date);
            itemDate.setHours(0, 0, 0, 0); // Normalize to start of day
            
            // Check if this is predicted data
            if (item.type === 'predicted') {
              // Check if this date is within first 16 days from today
              const isWithin16Days = itemDate >= todayStart && itemDate < sixteenDaysFromNow;
              
              if (isWithin16Days) {
                // For first 16 days, try to use weather data
                const weatherData = weatherMap.get(item.date);
                if (weatherData) {
                  return {
                    ...item,
                    rainfall: weatherData.rain != null ? parseFloat(weatherData.rain.toFixed(2)) : 0,
                    temperature: weatherData.temp?.day != null ? kelvinToCelsius(weatherData.temp.day) : item.temperature,
                    humidity: weatherData.humidity != null ? weatherData.humidity : item.humidity,
                  };
                }
                // If no weather data but within 16 days, keep original values
                return item;
              } else {
                // For dates beyond 16 days, explicitly set weather fields to null
                return {
                  ...item,
                  rainfall: null,
                  temperature: null,
                  humidity: null,
                };
              }
            }
            
            // For historical data, keep as is
            return item;
          });
          
          return updatedData;
        });
      } catch (error) {
        console.error("Failed to fetch calendar data:", error);
      } finally {
        setIsLoadingDailyCalendarData(false);
      }
    };

    fetchDataForCalendar();
  }, []);

  // Helper function to format month from "YYYY-MM" to "MMM YY" (e.g., "2023-10" -> "Oct 23")
  const formatMonth = (monthStr: string): string => {
    const [year, month] = monthStr.split('-')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthIndex = parseInt(month) - 1
    const shortYear = year.slice(2)
    return `${monthNames[monthIndex]} ${shortYear}`
  }

  // Transform API data to chart format
  const transformProductionData = (
    actualData: any[],
    predictedData: any[]
  ): PredictedMonthlyProduction[] => {
    const result: PredictedMonthlyProduction[] = []

    // Validate input data
    if (!actualData || !Array.isArray(actualData)) {
      console.warn('Actual data is not an array:', actualData)
      actualData = []
    }

    if (!predictedData || !Array.isArray(predictedData)) {
      console.warn('Predicted data is not an array:', predictedData)
      predictedData = []
    }

    // Add actual/historical data
    actualData.forEach(item => {
      if (item && item.month && item.production_volume !== undefined) {
        result.push({
          month: formatMonth(item.month),
          production: item.production_volume,
          predicted: null,
          type: "historical"
        })
      }
    })

    // Add gap if there's a time difference between actual and predicted
    if (actualData.length > 0 && predictedData.length > 0) {
      const lastActual = actualData[actualData.length - 1].month
      const firstPredicted = predictedData[0].month

      if (lastActual && firstPredicted) {
        // Check if there's a gap (more than 1 month difference)
        const lastActualDate = new Date(lastActual)
        const firstPredictedDate = new Date(firstPredicted)
        const monthsDiff = (firstPredictedDate.getFullYear() - lastActualDate.getFullYear()) * 12 +
          (firstPredictedDate.getMonth() - lastActualDate.getMonth())

        if (monthsDiff > 1) {
          result.push({
            month: "...",
            production: null,
            predicted: null,
            type: "gap"
          })
        }
      }
    }

    // Add predicted data
    predictedData.forEach(item => {
      if (item && item.month && item.productionForecast !== undefined) {
        result.push({
          month: formatMonth(item.month),
          production: null,
          predicted: Math.round(item.productionForecast),
          type: "predicted"
        })
      }
    })

    return result
  }

  // Calculate dynamic values from real fetched data
  const totalPrediction = monthlyProductionData
    .filter(item => item.type === 'predicted' && item.predicted != null)
    .reduce((sum, month) => sum + (month.predicted || 0), 0)

  // Get average confidence from model performance API (fallback to 0 if not available)
  const avgConfidence = modelPerformance?.[0]?.confidence?.overallScore 
    ? Math.round(modelPerformance[0].confidence.overallScore) 
    : modelPerformance?.[0]?.performance_metrics?.test_accuracy
    ? Math.round(modelPerformance[0].performance_metrics.test_accuracy)
    : 0


  // Handle legend click to toggle line visibility
  const handleLegendClick = (dataKey: string) => {
    setHiddenDataKeys(prev => {
      const newSet = new Set(prev)
      if (newSet.has(dataKey)) {
        newSet.delete(dataKey)
      } else {
        newSet.add(dataKey)
      }
      return newSet
    })
  }

  // Get current environmental conditions (latest data point from historical data)
  const latestEnv = dailyEnvironmentalData.filter(d => d.type === 'historical').slice(-1)[0] || dailyEnvironmentalData[0]

  // Determine current season based on month
  const getCurrentSeason = () => {
    const now = new Date()
    const month = now.getMonth() + 1 // getMonth() returns 0-11, so add 1 for 1-12
    const currentYear = now.getFullYear()
    
    if (month >= 4 && month <= 9) {
      // Yala season (April to September)
      return {
        name: 'Yala',
        year: currentYear.toString(),
        dateRange: `Apr ${currentYear} - Sep ${currentYear}`
      }
    } else {
      // Maha season (October to March)
      const nextYear = currentYear + 1
      let dateRange: string
      
      if (month >= 10) {
        // Oct-Dec: season is Oct YYYY - Mar (YYYY+1)
        dateRange = `Oct ${currentYear} - Mar ${nextYear}`
      } else {
        // Jan-Mar: season is Oct (YYYY-1) - Mar YYYY
        dateRange = `Oct ${currentYear - 1} - Mar ${currentYear}`
      }
      
      return {
        name: 'Maha',
        year: `${currentYear}/${nextYear.toString().slice(-2)}`,
        dateRange
      }
    }
  }

  const currentSeason = getCurrentSeason()

  return (
    <div className="p-3 sm:p-4 md:p-5 lg:p-6 space-y-3 md:space-y-4">
      {/* Compact Header with Season */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">{t('dashboard.title')}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Puttalam Salt Society - Critical Operational Data</p>
        </div>
        
        <div className="text-center sm:text-right">
          <Badge className="bg-primary text-primary-foreground text-sm sm:text-base px-2 sm:px-3 py-1">
            {currentSeason.name} {currentSeason.year}
          </Badge>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{currentSeason.dateRange}</p>
        </div>
      </div>

      {/* Compact Key Metrics */}
      <div className="grid gap-2 sm:gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="p-2 sm:p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{t('dashboard.seasonForecast')}</span>
            <TrendingUp className="h-3 w-3 text-success shrink-0" />
          </div>
          {isLoadingMonthlyData ? (
            <div className="text-base sm:text-xl font-bold text-muted-foreground">--</div>
          ) : (
            <div className="text-base sm:text-xl font-bold text-foreground">
              {totalPrediction > 0 ? totalPrediction.toLocaleString() : '--'}
            </div>
          )}
          <p className="text-[10px] sm:text-xs text-muted-foreground">tons</p>
        </Card>

        <Card className="p-2 sm:p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{t('dashboard.orBrineLevel')}</span>
            <Droplets className="h-3 w-3 text-primary shrink-0" />
          </div>
          <div className="text-base sm:text-xl font-bold text-foreground">{latestEnv?.OR_brine_level?.toFixed(1) || '--'}</div>
          <p className="text-[10px] sm:text-xs text-success">°Bé</p>
        </Card>

        <Card className="p-2 sm:p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{t('dashboard.temperature')}</span>
            <Activity className="h-3 w-3 text-destructive shrink-0" />
          </div>
          <div className="text-base sm:text-xl font-bold text-foreground">{latestEnv?.temperature?.toFixed(1) || '--'}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">°C</p>
        </Card>

        <Card className="p-2 sm:p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{t('dashboard.humidity')}</span>
            <Cloud className="h-3 w-3 text-success shrink-0" />
          </div>
          <div className="text-base sm:text-xl font-bold text-foreground">{latestEnv?.humidity?.toFixed(0) || '--'}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">%</p>
        </Card>
      </div>

      
      {/* Weather Forecast Calendar - Next 16 Days */}
      <WeatherForecastCalendar calendarDays={calendarDays} isLoadingDailyData={isLoadingDailyCalendarData} />

      {/* MAIN: Daily Environmental Predictions - MOST IMPORTANT */}
      <Card className="p-3 sm:p-4 md:p-5 border-2 border-primary/30 bg-linear-to-br from-primary/5 to-background">
        <div className="mb-2 sm:mb-3">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">{t('dashboard.dailyPredictions')}</h2>
            <Badge className="bg-primary/20 text-primary text-[10px] sm:text-xs">Critical for PSS Maintenance</Badge>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Past 6 months (solid) vs Future 6 months (dashed) - All Environmental Parameters</p>
        </div>
        <div className="h-64 sm:h-72 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dailyEnvironmentalData}>
              <defs>
                <linearGradient id="colorSalinity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(99 102 241)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="rgb(99 102 241)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 229 229)" />
              <XAxis
                dataKey="period"
                stroke="rgb(115 115 115)"
                tick={{ fontSize: 9 }}
                interval={Math.floor(dailyEnvironmentalData.length / 15)}
              />
              <YAxis yAxisId="left" stroke="rgb(99 102 241)" tick={{ fontSize: 10 }} label={{ value: "Environmental Measurements (various units)", angle: -90, position: "insideLeft", style: { fontSize: 10 } }} />
              <YAxis yAxisId="right" orientation="right" stroke="rgb(59 130 246)" tick={{ fontSize: 10 }} label={{ value: "Rainfall (mm)", angle: 90, position: "insideRight", style: { fontSize: 10 } }} />

              {/* Vertical line marking the boundary between historical (left) and predicted (right) */}
              <ReferenceLine
                x={dailyEnvironmentalData.find(d => d.type === 'predicted')?.period || "1 Dec"}
                stroke="rgb(239 68 68)"
                strokeWidth={2}
                strokeDasharray="5 5"
                yAxisId="left"
              >
                <Label
                  value="← HISTORICAL | PREDICTED →"
                  position="top"
                  fill="rgb(239 68 68)"
                  fontSize={12}
                  fontWeight="bold"
                />
              </ReferenceLine>

              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid rgb(229 229 229)",
                  borderRadius: "8px",
                  fontSize: "11px"
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2 border rounded shadow-sm">
                        <p className="font-semibold text-xs mb-1">{data.period}</p>
                        <p className="text-xs text-muted-foreground mb-1">
                          {data.type === 'historical' ? '📊 Historical' : '🔮 Predicted'}
                        </p>
                        {payload.map((entry: any, index: number) => (
                          <p key={index} className="text-xs" style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: "11px",
                  paddingTop: "10px"
                }}
                onClick={(e) => {
                  if (e.dataKey) {
                    handleLegendClick(String(e.dataKey))
                  }
                }}
                iconType="line"
                formatter={(value, entry: any) => {
                  const dataKey = String(entry.dataKey)
                  const isHidden = hiddenDataKeys.has(dataKey)
                  return (
                    <span style={{
                      color: isHidden ? '#aaa' : entry.color,
                      textDecoration: isHidden ? 'line-through' : 'none',
                      cursor: 'pointer',
                      opacity: isHidden ? 0.6 : 1,
                      fontWeight: isHidden ? 'normal' : '500',
                      display: 'inline-block',
                      padding: '2px 4px',
                      transition: 'all 0.2s ease'
                    }}>
                      {value}
                    </span>
                  )
                }}
              />

              {/* Salinity - PRIMARY METRIC - Thick blue line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="salinity"
                stroke="rgb(99 102 241)"
                strokeWidth={4}
                name="Salinity (°Bé)"
                dot={false}
                connectNulls={true}
                hide={hiddenDataKeys.has('salinity')}
              />

              {/* Rainfall - Blue bars (only first 16 days of prediction) */}
              <Bar
                yAxisId="right"
                dataKey="rainfall"
                fill="rgb(59 130 246)"
                name="Rainfall (mm)"
                radius={[2, 2, 0, 0]}
                opacity={0.6}
                hide={hiddenDataKeys.has('rainfall')}
              />

              {/* Temperature - Red line (only first 16 days of prediction) */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                stroke="rgb(239 68 68)"
                strokeWidth={2}
                name="Temperature (°C)"
                dot={false}
                connectNulls={false}
                hide={hiddenDataKeys.has('temperature')}
              />

              {/* Humidity - Green line (only first 16 days of prediction) */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="humidity"
                stroke="rgb(34 197 94)"
                strokeWidth={2}
                name="Humidity (%)"
                dot={false}
                connectNulls={false}
                hide={hiddenDataKeys.has('humidity')}
              />

              {/* Water Temperature - Orange line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="water_temperature"
                stroke="rgb(249 115 22)"
                strokeWidth={2}
                name="Water Temp (°C)"
                dot={false}
                connectNulls={true}
                hide={hiddenDataKeys.has('water_temperature')}
              />

              {/* Lagoon - Cyan line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="lagoon"
                stroke="rgb(6 182 212)"
                strokeWidth={2}
                name="Lagoon (m)"
                dot={false}
                connectNulls={true}
                hide={hiddenDataKeys.has('lagoon')}
              />

              {/* OR Brine Level - Purple line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="OR_brine_level"
                stroke="rgb(168 85 247)"
                strokeWidth={2}
                name="OR Brine (°Bé)"
                dot={false}
                connectNulls={true}
                hide={hiddenDataKeys.has('OR_brine_level')}
              />

              {/* OR Bund Level - Pink line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="OR_bund_level"
                stroke="rgb(236 72 153)"
                strokeWidth={2}
                name="OR Bund (m)"
                dot={false}
                connectNulls={true}
                hide={hiddenDataKeys.has('OR_bund_level')}
              />

              {/* IR Brine Level - Violet line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="IR_brine_level"
                stroke="rgb(139 92 246)"
                strokeWidth={2}
                name="IR Brine (°Bé)"
                dot={false}
                connectNulls={true}
                hide={hiddenDataKeys.has('IR_brine_level')}
              />

              {/* IR Bund Level - Fuchsia line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="IR_bund_level"
                stroke="rgb(217 70 239)"
                strokeWidth={2}
                name="IR Bund (m)"
                dot={false}
                connectNulls={true}
                hide={hiddenDataKeys.has('IR_bund_level')}
              />

              {/* East Channel - Teal line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="East_channel"
                stroke="rgb(20 184 166)"
                strokeWidth={2}
                name="East Channel (m)"
                dot={false}
                connectNulls={true}
                hide={hiddenDataKeys.has('East_channel')}
              />

              {/* West Channel - Emerald line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="West_channel"
                stroke="rgb(16 185 129)"
                strokeWidth={2}
                name="West Channel (m)"
                dot={false}
                connectNulls={true}
                hide={hiddenDataKeys.has('West_channel')}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-2 sm:mt-3 text-[10px] sm:text-xs text-muted-foreground justify-center border-t pt-2 sm:pt-3">
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-muted/30 rounded">
            <div className="h-0.5 w-6 sm:w-10 bg-primary"></div>
            <span className="font-medium">{`← ${t('dashboard.historicalData')}`}</span>
          </div>
          <div className="h-4 sm:h-6 w-px bg-destructive"></div>
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-primary/5 rounded">
            <span className="font-medium">{`${t('dashboard.predictedData')} →`}</span>
            <div className="h-0.5 w-6 sm:w-10 bg-primary"></div>
          </div>
        </div>
      </Card>

      {/* Secondary: Production Forecasts - Seasonal & Monthly */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Seasonal Production (Yala/Maha) */}
        <Card className="p-3 sm:p-4">
          <div className="mb-2 sm:mb-3">
            <h2 className="text-sm sm:text-base font-semibold text-foreground">{t('dashboard.seasonalProduction')}</h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground">6-month seasonal totals (historical & predicted)</p>
          </div>
          <div className="h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={[
                { season: "Yala 2023", production: 6350, type: "historical" },
                { season: "Maha 2023/24", production: 7920, type: "historical" },
                { season: "Yala 2024", production: 6580, type: "historical" },
                { season: "Maha 2024/25", production: 8120, type: "historical" },
                { season: "Yala 2025", production: null, predicted: 6800, type: "predicted" },
                { season: "Maha 2025/26", production: null, predicted: 8360, type: "predicted" },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 229 229)" />
                <XAxis
                  dataKey="season"
                  stroke="rgb(115 115 115)"
                  tick={{ fontSize: 7 }}
                  angle={-35}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="rgb(115 115 115)" tick={{ fontSize: 8 }} label={{ value: "Production (tons)", angle: -90, position: "insideLeft", style: { fontSize: 8 } }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid rgb(229 229 229)",
                    borderRadius: "8px",
                    fontSize: "10px"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "9px" }} />
                <Bar dataKey="production" fill="rgb(99 102 241)" name="Actual (tons)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predicted" fill="rgb(168 85 247)" name="Predicted (tons)" radius={[4, 4, 0, 0]} opacity={0.7} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Monthly Production Breakdown */}
        <Card className="p-3 sm:p-4">
          <div className="mb-2 sm:mb-3">
            <h2 className="text-sm sm:text-base font-semibold text-foreground">{t('dashboard.monthlyBreakdown')}</h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Maha 2024/25 (actual) + Maha 2025/26 (predicted)</p>
          </div>
          <div className="h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyProductionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 229 229)" />
                <XAxis
                  dataKey="month"
                  stroke="rgb(115 115 115)"
                  tick={{ fontSize: 7 }}
                  angle={-45}
                  textAnchor="end"
                  height={50}
                />
                <YAxis stroke="rgb(115 115 115)" tick={{ fontSize: 8 }} label={{ value: "Production (tons)", angle: -90, position: "insideLeft", style: { fontSize: 8 } }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid rgb(229 229 229)",
                    borderRadius: "8px",
                    fontSize: "10px"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "9px" }} />
                <Bar dataKey="production" fill="rgb(99 102 241)" name="Actual (tons)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predicted" fill="rgb(168 85 247)" name="Predicted (tons)" radius={[4, 4, 0, 0]} opacity={0.7} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Operational Summary */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-3">
        {/* Overall Saltern Status */}
        <Card className="p-3 sm:p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2 sm:mb-3">{t('dashboard.salternStatus')}</h3>
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex justify-between items-center p-1.5 sm:p-2 bg-success/10 rounded">
              <span className="text-xs sm:text-sm text-foreground">Avg Brine Density</span>
              <span className="text-xs sm:text-sm font-bold text-success">24.9°Bé</span>
            </div>
            <div className="flex justify-between items-center p-1.5 sm:p-2 bg-muted/50 rounded">
              <span className="text-xs sm:text-sm text-foreground">Total Area</span>
              <span className="text-xs sm:text-sm font-bold text-foreground">13.9 ha</span>
            </div>
            <div className="flex justify-between items-center p-1.5 sm:p-2 bg-muted/50 rounded">
              <span className="text-xs sm:text-sm text-foreground">Active Landowners</span>
              <span className="text-xs sm:text-sm font-bold text-foreground">8</span>
            </div>
            <div className="flex justify-between items-center p-1.5 sm:p-2 bg-primary/10 rounded">
              <span className="text-xs sm:text-sm text-foreground">PSS Workmen</span>
              <span className="text-xs sm:text-sm font-bold text-primary">16</span>
            </div>
          </div>
        </Card>

        {/* Current Season Summary */}
        <Card className="p-3 sm:p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2 sm:mb-3">{t('dashboard.seasonSummary')}</h3>
          <div className="space-y-1.5 sm:space-y-2">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Total Forecast</p>
              {isLoadingMonthlyData ? (
                <p className="text-lg sm:text-2xl font-bold text-muted-foreground">Loading...</p>
              ) : (
                <p className="text-lg sm:text-2xl font-bold text-primary">
                  {totalPrediction > 0 ? totalPrediction.toLocaleString() : '--'} bags
                </p>
              )}
            </div>
            <div className="p-1.5 sm:p-2 bg-success/10 rounded">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Confidence (Model)</p>
              {isLoadingModelPerformance ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="flex-1 bg-background rounded-full h-1.5 sm:h-2">
                    <div className="bg-muted rounded-full h-1.5 sm:h-2 w-1/2 animate-pulse" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-muted-foreground">--</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="flex-1 bg-background rounded-full h-1.5 sm:h-2">
                    <div className="bg-success rounded-full h-1.5 sm:h-2" style={{ width: `${avgConfidence}%` }} />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-success">{avgConfidence}%</span>
                </div>
              )}
            </div>
            <div className="p-1.5 sm:p-2 bg-muted/50 rounded">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Last Updated</p>
              {isLoadingModelPerformance ? (
                <p className="text-base sm:text-lg font-bold text-muted-foreground">--</p>
              ) : modelPerformance?.[0]?.updatedAt || modelPerformance?.[0]?.createdAt ? (
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {new Date(modelPerformance[0].updatedAt || modelPerformance[0].createdAt).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric'
                  })}
                </p>
              ) : (
                <p className="text-base sm:text-lg font-bold text-foreground">--</p>
              )}
            </div>
          </div>
        </Card>

        {/* PSS Recommendations */}
        <Card className="p-3 sm:p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2 sm:mb-3">{t('dashboard.pssActions')}</h3>
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-start gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-success/10 border border-success/20 rounded text-[10px] sm:text-xs">
              <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success mt-0.5 flex shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">Optimal Salinity Trend</p>
                <p className="text-muted-foreground line-clamp-1">Maintain current operations</p>
              </div>
            </div>

            <div className="flex items-start gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-warning/10 border border-warning/20 rounded text-[10px] sm:text-xs">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-warning mt-0.5 flex shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">Rainfall Expected</p>
                <p className="text-muted-foreground line-clamp-1">Monitor daily, adjust workmen</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-3">
            <Button size="sm" onClick={() => router.push('/salt-society/reports')} className="flex-1 text-[10px] sm:text-xs h-7 sm:h-8">
              {t('dashboard.forecastReport')}
            </Button>
          </div>
        </Card>
      </div>

      {/* Dialogs */}
      <ForecastReportDialog open={forecastDialogOpen} onOpenChange={setForecastDialogOpen} />
      <NotifySupervisorsDialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen} />
    </div>
  )
}
