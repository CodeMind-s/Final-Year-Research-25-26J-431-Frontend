'use client';

import { useEffect, useState } from 'react';
import { crystallizationController } from '@/services/crystallization.controller';
import { WeatherForecastResponse, WeatherForecastDay } from '@/types/crystallization.types';
import { ApiError } from '@/lib/api-error';

interface UseWeatherForecastReturn {
  weatherData: WeatherForecastResponse | null;
  todayWeather: WeatherForecastDay | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage weather forecast data
 * Fetches 16-day weather forecast from the API
 */
export function useWeatherForecast(): UseWeatherForecastReturn {
  const [weatherData, setWeatherData] = useState<WeatherForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherForecast = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await crystallizationController.getWeatherForecast();
      setWeatherData(data);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(String(err));
      setError(apiError.message);
      console.error('Failed to fetch weather forecast:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherForecast();
  }, []);

  // Get today's weather (first item in the list)
  const todayWeather = weatherData?.data?.list?.[0] || null;

  const refetch = async () => {
    await fetchWeatherForecast();
  };

  return {
    weatherData,
    todayWeather,
    isLoading,
    error,
    refetch,
  };
}
