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
 * Quick prediction input parameters (for UI form)
 */
export interface QuickPredictionFormData {
  production_volume: number;
  rain_sum: number;
  temperature_mean: number;
  humidity_mean: number;
  wind_speed_mean: number;
  month: number;
}

/**
 * Quick prediction backend request payload
 */
export interface QuickPredictionRequest {
  jobType: "WASTE_PREDICTION";
  predictionDate: string; // Format: YYYY-MM-DD
  requestData: {
    production_volume: number;
    rain_sum: number;
    temperature_mean: number;
    humidity_mean: number;
    wind_speed_mean: number;
    month: number;
  };
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
 * Recent prediction item with metadata
 */
export interface RecentPrediction {
  jobId: string;
  predictionDate: string;
  createdAt: string;
  status: "processing" | "completed" | "failed";
  prediction?: WastePredictionData;
  requestData: {
    production_volume: number;
    rain_sum: number;
    temperature_mean: number;
    humidity_mean: number;
    wind_speed_mean: number;
    month: number;
  };
}

/**
 * Raw API response for a single job (from backend)
 */
export interface RawJobResponse {
  _id: string;
  userId: string;
  jobType: string;
  status: "COMPLETED" | "PROCESSING" | "FAILED";
  predictionDate: string;
  requestData: string; // JSON string
  resultData: string; // JSON string
  errorMessage: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Raw result data from backend (parsed from resultData JSON string)
 */
export interface RawResultData {
  total_waste_kg: number;
  solid_waste_limestone_kg: number;
  solid_waste_gypsum_kg: number;
  solid_waste_industrial_salt_kg: number;
  liquid_waste_bittern_liters: number;
  potential_epsom_salt_kg: number;
  potential_potash_kg: number;
  potential_magnesium_oil_liters: number;
  model_version?: string;
  confidence?: number | null;
  Total_Waste_kg?: number; // Sometimes capitalized
}

/**
 * Response for recent predictions list
 */
export interface RecentPredictionsResponse {
  predictions: RecentPrediction[];
  total: number;
}

/**
 * Response structure for waste predictions (already unwrapped by httpClient)
 */
export interface WastePredictionsResponse {
  predictions: WastePredictionData[];
  averages: WasteAverageMetrics;
}
