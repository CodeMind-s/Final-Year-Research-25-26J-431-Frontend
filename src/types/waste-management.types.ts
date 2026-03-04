/**
 * Waste Management Type Definitions
 * Types for waste valorization and management APIs
 */

/**
 * Waste prediction data point with detailed breakdown
 */
export interface WastePredictionData {
  date: string;
  predicted_waste: number;
  production_volume: number;
  production_capacity?: number;
  rain_sum: number;
  temperature_mean: number;
  humidity_mean: number;
  wind_speed_mean: number;
  type: "historical" | "predicted";
  
  // Solid waste breakdown
  solid_waste_gypsum?: number;
  solid_waste_limestone?: number;
  solid_waste_industrial_salt?: number;
  total_solid_waste?: number;
  
  // Liquid waste breakdown
  liquid_waste_bittern?: number;
  potential_epsom_salt?: number;
  potential_potash?: number;
  potential_magnesium_oil?: number;
  total_liquid_waste?: number;
}

/**
 * Average metrics for waste management
 */
export interface WasteAverageMetrics {
  production_volume: number;
  production_capacity?: number;
  rain_sum: number;
  temperature_mean: number;
  humidity_mean: number;
  wind_speed_mean: number;
  predicted_waste: number;
  
  // Average solid waste
  solid_waste_gypsum?: number;
  solid_waste_limestone?: number;
  solid_waste_industrial_salt?: number;
  total_solid_waste?: number;
  
  // Average liquid waste
  liquid_waste_bittern?: number;
  potential_epsom_salt?: number;
  potential_potash?: number;
  potential_magnesium_oil?: number;
  total_liquid_waste?: number;
}

/**
 * Request parameters for waste predictions
 */
export interface WastePredictionsRequest {
  startDate?: string;
  endDate?: string;
  includeAverages?: boolean;
}

/**
 * Quick prediction input parameters
 */
export interface QuickPredictionRequest {
  production_volume: number;
  rain_sum: number;
  temperature_mean: number;
  humidity_mean: number;
  wind_speed_mean: number;
  date?: string;
}

/**
 * Quick prediction job submission response
 */
export interface QuickPredictionJobResponse {
  jobId: string;
  status: "processing" | "completed" | "failed";
  message: string;
  estimatedWaitTime?: number;
  progress?: number;
  prediction?: WastePredictionData;
}

/**
 * Quick prediction response (already unwrapped by httpClient)
 */
export interface QuickPredictionResponse {
  prediction: WastePredictionData;
}

/**
 * Response structure for waste predictions (already unwrapped by httpClient)
 */
export interface WastePredictionsResponse {
  predictions: WastePredictionData[];
  averages: WasteAverageMetrics;
}
