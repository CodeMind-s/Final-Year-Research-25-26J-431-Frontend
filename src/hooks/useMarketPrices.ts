import { useState, useEffect } from "react";
import { harvestPlanController } from "@/services/plan.controller";
import { PRICE_DATA, DEMAND_DATA } from "@/sample-data/compass/mockMarketData";

interface ChartDataPoint {
  month: string;
  price?: number;
  demand?: number;
  isForecast: boolean;
}

interface MarketPricesData {
  currentPrice: number;
  peakPrice: number;
  peakPriceMonth: string;
  isLoading: boolean;
  error: string | null;
}

const formatMonthDisplay = (monthStr: string): string => {
  const [year, month] = monthStr.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return monthNames[parseInt(month) - 1];
};

export const useMarketPrices = (): MarketPricesData => {
  const [priceChartData, setPriceChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChartData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const today = new Date();
      
      // Calculate 6 months back from current month
      const sixMonthsAgo = new Date(today);
      sixMonthsAgo.setMonth(today.getMonth() - 6);
      const startMonth = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}`;
      
      // Current month
      const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      
      // Fetch historical data and forecast in parallel
      const [historicalResponse, forecastResponse] = await Promise.all([
        harvestPlanController.getDemandPrice({
          startMonth,
          endMonth: currentMonth,
        }),
        harvestPlanController.getDemandPriceForecast({
          forecast_date: today.toISOString().split('T')[0],
        }),
      ]);

      // Process historical data
      const historicalData = Array.isArray(historicalResponse) 
        ? historicalResponse 
        : historicalResponse.data || [];
      
      const chartData: ChartDataPoint[] = historicalData.map(item => ({
        month: formatMonthDisplay(item.month),
        price: Math.round(item.pricePerBag),
        isForecast: false,
      }));

      // Process forecast data (take first 2 months)
      const forecastData = forecastResponse.forecasts.slice(0, 2);
      
      forecastData.forEach(forecast => {
        chartData.push({
          month: formatMonthDisplay(forecast.month),
          price: Math.round(forecast.price.predicted_lkr_per_bag),
          isForecast: true,
        });
      });

      setPriceChartData(chartData);
    } catch (error) {
      console.error("Failed to fetch market prices:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch prices");
      // Fallback to mock data on error
      setPriceChartData(PRICE_DATA);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  // Calculate current and peak prices
  const historicalPrices = priceChartData.filter(d => !d.isForecast && d.price);
  const currentPrice = historicalPrices.length > 0 ? historicalPrices[historicalPrices.length - 1].price || 1850 : 1850;
  
  const forecastPrices = priceChartData.filter(d => d.isForecast && d.price);
  const peakForecast = forecastPrices.reduce((max, curr) => 
    (curr.price && curr.price > (max.price || 0)) ? curr : max, 
    forecastPrices[0] || { price: 0, month: '' }
  );
  const peakPrice = peakForecast.price || 2150;
  const peakPriceMonth = peakForecast.month || '';

  return {
    currentPrice,
    peakPrice,
    peakPriceMonth,
    isLoading,
    error,
  };
};
