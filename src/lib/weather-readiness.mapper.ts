/**
 * Weather to Harvest Readiness Mapper
 * Converts current weather conditions into harvest readiness status
 */

import { WeatherForecastDay } from '@/types/crystallization.types';
import { HarvestReadiness } from '@/sample-data/compass/mockSalternData';

interface WeatherReadinessInput {
  temperature: number; // in Kelvin
  humidity: number; // percentage
  rainProbability: number; // 0-1
  weatherMain: string; // "Rain", "Clear", "Clouds", etc.
  windSpeed: number; // m/s
}

/**
 * Determine salinity readiness based on weather conditions
 * Better conditions (low rain, moderate temp) = good salinity
 */
function determineSalinityLevel(weather: WeatherReadinessInput): 'good' | 'moderate' | 'concern' {
  // Ideal conditions: little to no rain, moderate wind
  if (weather.rainProbability < 0.2 && weather.windSpeed < 8) {
    return 'good';
  }

  // Moderate conditions
  if (weather.rainProbability < 0.6 && weather.windSpeed < 12) {
    return 'moderate';
  }

  // High rainfall or strong winds affect salinity concentration
  return 'concern';
}

/**
 * Determine rainfall readiness
 * Lower rainfall probability = safer for harvest planning
 */
function determineRainfallLevel(weather: WeatherReadinessInput): 'good' | 'moderate' | 'concern' {
  if (weather.rainProbability < 0.2 && weather.weatherMain !== 'Rain') {
    return 'good';
  }

  if (weather.rainProbability < 0.6) {
    return 'moderate';
  }

  return 'concern';
}

/**
 * Determine temperature readiness
 * Ideal temp for salt crystallization: 25-35°C (298-308K)
 */
function determineTemperatureLevel(weather: WeatherReadinessInput): 'good' | 'moderate' | 'concern' {
  const tempCelsius = weather.temperature - 273.15;

  // Ideal range: 25-35°C (good evaporation and crystallization)
  if (tempCelsius >= 25 && tempCelsius <= 35) {
    return 'good';
  }

  // Acceptable range: 20-40°C
  if (tempCelsius >= 20 && tempCelsius <= 40) {
    return 'moderate';
  }

  // Too cold or too hot affects crystallization
  return 'concern';
}

/**
 * Convert weather forecast data to readiness status
 */
export function mapWeatherToReadiness(
  weatherDay: WeatherForecastDay | null
): HarvestReadiness[] {
  // Default readiness if no weather data
  if (!weatherDay) {
    return [
      { id: 'salinity', type: 'salinity', level: 'moderate' },
      { id: 'rainfall', type: 'rainfall', level: 'moderate' },
      { id: 'temperature', type: 'temperature', level: 'moderate' },
    ];
  }

  const weatherInfo: WeatherReadinessInput = {
    temperature: weatherDay.temp.day,
    humidity: weatherDay.humidity,
    rainProbability: weatherDay.pop, // Probability of precipitation
    weatherMain: weatherDay.weather[0]?.main || 'Clear',
    windSpeed: weatherDay.speed,
  };

  return [
    {
      id: 'salinity',
      type: 'salinity',
      level: determineSalinityLevel(weatherInfo),
    },
    {
      id: 'rainfall',
      type: 'rainfall',
      level: determineRainfallLevel(weatherInfo),
    },
    {
      id: 'temperature',
      type: 'temperature',
      level: determineTemperatureLevel(weatherInfo),
    },
  ];
}

/**
 * Get weather icon based on condition and time of day
 */
export function getWeatherIcon(
  weatherMain: string,
  timePeriod: 'day' | 'night'
): string {
  const iconMap: Record<string, Record<string, string>> = {
    Clear: { day: '☀️', night: '🌙' },
    Clouds: { day: '☁️', night: '☁️' },
    Rain: { day: '🌧️', night: '🌧️' },
    Drizzle: { day: '🌦️', night: '🌦️' },
    Thunderstorm: { day: '⛈️', night: '⛈️' },
    Mist: { day: '🌫️', night: '🌫️' },
    Smoke: { day: '💨', night: '💨' },
    Haze: { day: '🌫️', night: '🌫️' },
    Dust: { day: '🌪️', night: '🌪️' },
    Fog: { day: '🌫️', night: '🌫️' },
    Sand: { day: '🌪️', night: '🌪️' },
    Ash: { day: '💨', night: '💨' },
    Squall: { day: '🌪️', night: '🌪️' },
    Tornado: { day: '🌪️', night: '🌪️' },
  };

  return iconMap[weatherMain]?.[timePeriod] || '🌤️';
}

/**
 * Convert temperature from Kelvin to Celsius
 */
export function kelvinToCelsius(kelvin: number): number {
  return Math.round(kelvin - 273.15);
}

/**
 * Convert temperature from Kelvin to Fahrenheit
 */
export function kelvinToFahrenheit(kelvin: number): number {
  return Math.round((kelvin - 273.15) * 9 / 5 + 32);
}
