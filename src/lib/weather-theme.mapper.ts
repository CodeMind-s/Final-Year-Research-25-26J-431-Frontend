/**
 * Weather-based color theme mapper
 * Returns color schemes based on current weather condition
 */

export interface WeatherTheme {
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  
  // Background colors
  bgCard: string;
  bgAccent: string;
  
  // Header colors
  headerBg: string;
  headerText: string;
  
  // Button/Link colors
  linkColor: string;
  
  // Market cards
  marketCardBg: string;
  marketCardBorder: string;
  
  // Plan card colors
  planCardBg: string;
  planCardBorder: string;
  planCardText: string;
  
  // Readiness card adjustments
  readinessCardBg: string;
}

/**
 * Get color theme based on weather condition
 */
export function getWeatherTheme(weatherMain: string): WeatherTheme {
  const weatherCondition = weatherMain?.toLowerCase() || 'clear';

  // Sunny/Clear weather - bright, warm tones
  if (weatherCondition === 'clear' || weatherCondition === 'sunny') {
    return {
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-600',
      textTertiary: 'text-slate-500',
      bgCard: 'bg-white',
      bgAccent: 'bg-amber-50',
      headerBg: 'bg-gradient-to-r from-amber-400 to-yellow-500',
      headerText: 'text-white',
      linkColor: 'text-amber-600',
      marketCardBg: 'bg-white',
      marketCardBorder: 'border-amber-200 hover:border-amber-300',
      planCardBg: 'bg-white',
      planCardBorder: 'border-slate-100',
      planCardText: 'text-slate-900',
      readinessCardBg: 'bg-opacity-90',
    };
  }

  // Cloudy/Overcast weather - neutral, muted tones
  if (weatherCondition === 'clouds' || weatherCondition === 'cloudy' || weatherCondition === 'overcast clouds') {
    return {
      textPrimary: 'text-slate-800',
      textSecondary: 'text-slate-600',
      textTertiary: 'text-slate-500',
      bgCard: 'bg-slate-50',
      bgAccent: 'bg-slate-100',
      headerBg: 'bg-gradient-to-r from-slate-500 to-slate-600',
      headerText: 'text-white',
      linkColor: 'text-slate-700',
      marketCardBg: 'bg-slate-50',
      marketCardBorder: 'border-slate-200 hover:border-slate-300',
      planCardBg: 'bg-slate-50',
      planCardBorder: 'border-slate-200',
      planCardText: 'text-slate-900',
      readinessCardBg: 'bg-opacity-85',
    };
  }

  // Rainy weather - cool, blue-tinted tones
  if (weatherCondition === 'rain' || weatherCondition === 'rainy' || weatherCondition === 'light rain' || weatherCondition === 'moderate rain') {
    return {
      textPrimary: 'text-slate-900',
      textSecondary: 'text-blue-700',
      textTertiary: 'text-slate-600',
      bgCard: 'bg-blue-50',
      bgAccent: 'bg-cyan-50',
      headerBg: 'bg-gradient-to-r from-blue-500 to-cyan-600',
      headerText: 'text-white',
      linkColor: 'text-blue-600',
      marketCardBg: 'bg-blue-50',
      marketCardBorder: 'border-blue-200 hover:border-blue-300',
      planCardBg: 'bg-blue-50',
      planCardBorder: 'border-blue-200',
      planCardText: 'text-slate-900',
      readinessCardBg: 'bg-opacity-90',
    };
  }

  // Thunderstorm - dark, dramatic tones
  if (weatherCondition === 'thunderstorm') {
    return {
      textPrimary: 'text-gray-900',
      textSecondary: 'text-purple-700',
      textTertiary: 'text-gray-600',
      bgCard: 'bg-gray-100',
      bgAccent: 'bg-purple-100',
      headerBg: 'bg-gradient-to-r from-purple-700 to-indigo-800',
      headerText: 'text-white',
      linkColor: 'text-purple-700',
      marketCardBg: 'bg-gray-100',
      marketCardBorder: 'border-purple-300 hover:border-purple-400',
      planCardBg: 'bg-gray-100',
      planCardBorder: 'border-gray-300',
      planCardText: 'text-gray-900',
      readinessCardBg: 'bg-opacity-80',
    };
  }

  // Default/Mist/Fog/Haze - soft, muted tones
  return {
    textPrimary: 'text-slate-800',
    textSecondary: 'text-slate-600',
    textTertiary: 'text-slate-500',
    bgCard: 'bg-white',
    bgAccent: 'bg-slate-50',
    headerBg: 'bg-gradient-to-r from-slate-400 to-slate-500',
    headerText: 'text-white',
    linkColor: 'text-slate-600',
    marketCardBg: 'bg-slate-50',
    marketCardBorder: 'border-slate-200 hover:border-slate-300',
    planCardBg: 'bg-white',
    planCardBorder: 'border-slate-100',
    planCardText: 'text-slate-900',
    readinessCardBg: 'bg-opacity-90',
  };
}

/**
 * Get weather-based accent color for icons and highlights
 */
export function getWeatherAccentColor(weatherMain: string): string {
  const weatherCondition = weatherMain?.toLowerCase() || 'clear';

  if (weatherCondition === 'clear' || weatherCondition === 'sunny') {
    return 'text-amber-600';
  }
  if (weatherCondition === 'clouds' || weatherCondition === 'cloudy') {
    return 'text-slate-600';
  }
  if (weatherCondition === 'rain' || weatherCondition === 'rainy' || weatherCondition === 'light rain' || weatherCondition === 'moderate rain') {
    return 'text-blue-600';
  }
  if (weatherCondition === 'thunderstorm') {
    return 'text-purple-700';
  }

  return 'text-slate-600';
}
