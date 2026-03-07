/**
 * Harvest Plan Type Definitions
 * Types for harvest planning, management, and tracking
 */

/**
 * Harvest plan object with production predictions and tracking
 */
export interface HarvestPlan {
  _id: string;
  userId: string;
  saltBeds: number;
  harvestStatus: number | string; // Can be number or "FRESHER" | "MATURE" string
  planPeriod: number;
  startDate: string;
  endDate: string;
  predictedProduction: number;
  actualProduction: number;
  workerCount: number;
  predictedProfit: number;
  actualProfit: number;
  expenses: number;
  earnings: number;
  avgSellingPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface HarvestPlanRequest {
  saltBeds: number;
  harvestStatus: "FRESHER" | "MIDLEVEL";
  planPeriod: number;
  startDate: string;
  predictedProduction: number;
  actualProduction: number;
  workerCount: number;
  predictedProfit: number;
  actualProfit: number;
  expenses: number;
  earnings: number;
  avgSellingPrice: number;
}

export interface HarvestPlanResponse {
  success: boolean;
  message: string;
  data: HarvestPlan;
}

export interface GetMyHarvestPlansRequest {
  startDate?: string;
  endDate?: string;
  status?: "FRESHER" | "MIDLEVEL" | "HARVESTED" | "DISPOSED";
  limit?: number;
  page?: number;
}

export interface GetMyHarvestPlansResponse {
  success: boolean;
  message: string;
  data: HarvestPlan[];
}

export interface UpdateHarvestPlanRequest {
  saltBeds?: number;
  harvestStatus?: "FRESHER" | "MIDLEVEL" | "HARVESTED" | "DISPOSED";
  planPeriod?: number;
  startDate?: string;
  predictedProduction?: number;
  actualProduction?: number;
  workerCount?: number;
  predictedProfit?: number;
  actualProfit?: number;
  expenses?: number;
  earnings?: number;
  avgSellingPrice?: number;
}

export interface UpdateHarvestPlanResponse {
  success: boolean;
  message: string;
  data: HarvestPlan;
}

export interface DeleteHarvestPlanResponse {
  success: boolean;
  message: string;
}

/**
 * Demand and Price data types
 */
export interface DemandPriceDataPoint {
  month: string;
  totalDemand: number;
  pricePerBag: number;
}

export interface GetDemandPriceRequest {
  startMonth: string;
  endMonth: string;
}

export interface GetDemandPriceResponse {
  success: boolean;
  message: string;
  data: DemandPriceDataPoint[];
}

export interface DemandPriceForecastRequest {
  forecast_date: string;
}

export interface ForecastDemand {
  method: string;
  production_source: string;
  yield_ratio_season: string;
  yield_ratio_source: string;
  predicted_bags: number;
  production_forecast_bags: number;
  yield_ratio_used: number;
  yield_ratio_sample_months: number;
}

export interface ForecastPrice {
  model: string;
  predicted_lkr_per_bag: number;
  lower_95: number;
  upper_95: number;
  expected_mape_pct: number;
}

export interface ForecastDataPoint {
  month: string;
  horizon_months: number;
  demand: ForecastDemand;
  price: ForecastPrice;
}

export interface DemandPriceForecastResponse {
  forecasts: ForecastDataPoint[];
  warnings: string[];
  success: boolean;
  message: string;
  model_version: string;
  requested_at: string;
  forecast_date: string;
  last_price_data_date: string;
  data_gap_months: number;
}
