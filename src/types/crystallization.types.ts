/**
 * Crystallization API Type Definitions
 */

/**
 * Predicted Monthly Production Request
 */
export interface PredictedMonthlyProductionRequest {
  startMonth: string; // Format: "YYYY-MM"
  endMonth: string; // Format: "YYYY-MM"
}

/**
 * Actual Monthly Production Request
 */
export interface ActualMonthlyProductionRequest {
  startMonth: string; // Format: "YYYY-MM"
  endMonth: string; // Format: "YYYY-MM"
}

/**
 * Predicted Monthly Production Data from API
 */
export interface PredictedMonthlyProductionData {
  _id: string;
  month: string; // Format: "YYYY-MM"
  monthNumber: number;
  productionForecast: number;
  lowerBound: number;
  upperBound: number;
  season: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Chart Data Point for Monthly Production
 */
export interface PredictedMonthlyProduction {
  month: string;
  production: number | null;
  predicted: number | null;
  type: "historical" | "predicted" | "gap";
}

/**
 * Predicted Monthly Production Response
 */
export interface PredictedMonthlyProductionResponse {
  success: boolean;
  message: string;
  data: PredictedMonthlyProductionData[];
}

/**
 * Daily Measurement Request
 */
export interface DailyMeasurementRequest {
  waterTemperature: number;
  lagoon: number;
  orBrineLevel: number;
  orBoundLevel: number;
  irBrineLevel: number;
  irBoundLevel: number;
  eastChannel: number;
  westChannel: number;
}

/**
 * Daily Measurement Response (for POST)
 */
export interface DailyMeasurementResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Daily Measurement GET Request
 */
export interface DailyMeasurementGetRequest {
  startDate: string; // Format: "YYYY-MM-DD"
  endDate: string; // Format: "YYYY-MM-DD"
}

/**
 * Daily Measurement Parameters from API
 */
export interface DailyMeasurementParameters {
  water_temperature: number;
  lagoon: number;
  OR_brine_level: number;
  OR_bund_level: number;
  IR_brine_level: number;
  IR_bound_level: number;
  East_channel: number;
  West_channel: number;
}

/**
 * Weather Data from API
 */
export interface WeatherData {
  temperature_mean: number;
  temperature_min: number;
  temperature_max: number;
  rain_sum: number;
  wind_speed_max: number;
  wind_gusts_max: number;
  relative_humidity_mean: number;
}

/**
 * Daily Measurement Data Item from API
 */
export interface DailyMeasurementDataItem {
  _id: string;
  date: string;
  dayNumber: number;
  parameters: DailyMeasurementParameters;
  weather: WeatherData;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

/**
 * Daily Measurement GET Response
 */
export interface DailyMeasurementGetResponse {
  success: boolean;
  message: string;
  data: DailyMeasurementDataItem[];
}

/**
 * Predicted Daily Measurement GET Request
 */
export interface PredictedDailyMeasurementGetRequest {
  startDate: string; // Format: "YYYY-MM-DD"
  endDate: string; // Format: "YYYY-MM-DD"
}

/**
 * Predicted Daily Measurement GET Response
 */
export interface PredictedDailyMeasurementGetResponse {
  success: boolean;
  message: string;
  data: DailyMeasurementDataItem[];
}

/**
 * Chart Data Point for Daily Environmental Data
 */
export interface DailyEnvironmentalChartData {
  date: string;
  period: string;
  water_temperature: number | null;
  lagoon: number | null;
  OR_brine_level: number | null;
  OR_bund_level: number | null;
  IR_brine_level: number | null;
  IR_bound_level: number | null;
  East_channel: number | null;
  West_channel: number | null;
  rainfall: number | null;
  temperature: number | null;
  humidity: number | null;
  type: "historical" | "predicted";
}

/**
 * Weather Forecast Types
 */
export interface WeatherForecastItem {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WeatherForecastTemp {
  day: number;
  min: number;
  max: number;
  night: number;
  eve: number;
  morn: number;
}

export interface WeatherForecastFeelsLike {
  day: number;
  night: number;
  eve: number;
  morn: number;
}

export interface WeatherForecastDay {
  dt: number;
  sunrise: number;
  sunset: number;
  temp: WeatherForecastTemp;
  feels_like: WeatherForecastFeelsLike;
  pressure: number;
  humidity: number;
  weather: WeatherForecastItem[];
  speed: number;
  deg: number;
  gust: number;
  clouds: number;
  pop: number;
  rain?: number;
}

export interface WeatherForecastCity {
  id: number;
  name: string;
  coord: {
    lon: number;
    lat: number;
  };
  country: string;
  population: number;
  timezone: number;
}

export interface WeatherForecastResponse {
  success: boolean;
  message: string;
  data: {
    city: WeatherForecastCity;
    cod: string;
    message: number;
    cnt: number;
    list: WeatherForecastDay[];
  };
}

export interface CrystallizationPredictionRequest {
  start_date: string; // Format: "YYYY-MM-DD"
  forecast_days: number;
  num_salt_beds: number;
  latitude: number;
  longitude: number;
}

export interface CalendarDay {
  date: Date;
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  weatherData?: WeatherForecastDay;
  OR_brine_level?: number;
  OR_bund_level?: number;
  IR_brine_level?: number;
  IR_bound_level?: number;
  lagoon?: number;
}

export interface GetCrystallizationModelPerformanceRequest {
  limit?: number;
}

export interface GetCrystallizationModelPerformanceResponse {
  success: boolean;
  message: string;
  data: PerformanceObject[];
}

export interface PerformanceObject {
  _id: string;
  model_type: string;
  forecast_generated: string;
  performance_metrics: PerformanceMetricObject;
  confidence: ConfidenceObject;
  createdAt: string;
  updatedAt: string;
}

export interface ConfidenceObject {
  overallScore: number;
  overallRating: string;
  yieldRatio: number;
  yieldStatus: string;
  decliningTrend: boolean;
  improvingTrend: boolean;
  formulaR2: number;
  holdoutMae: number;
  nHistoryMonths: number;
  formulaFitScore: number;
  holdoutScore: number;
  dataVolumeScore: number;
  yieldScore: number;
  bedCountTier: string;
  bedCountNote: string;
  date: string;
}

export interface PerformanceMetricObject {
  test_mae: number;
  test_rmse: number;
  test_r2_score: number;
  test_accuracy: number;
  validation_r2_score: number;
  validation_accuracy: number;
}
