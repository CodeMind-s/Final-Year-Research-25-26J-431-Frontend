/**
 * Crystallization API Type Definitions
 */

/**
 * Predicted Monthly Production Request
 */
export interface PredictedMonthlyProductionRequest {
  startMonth: string; // Format: "YYYY-MM"
  endMonth: string;   // Format: "YYYY-MM"
}

/**
 * Actual Monthly Production Request
 */
export interface ActualMonthlyProductionRequest {
  startMonth: string; // Format: "YYYY-MM"
  endMonth: string;   // Format: "YYYY-MM"
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
  date: string; // Format: "YYYY-MM-DD"
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
 * Daily Measurement Response
 */
export interface DailyMeasurementResponse {
  success: boolean;
  message: string;
  data?: any;
}
