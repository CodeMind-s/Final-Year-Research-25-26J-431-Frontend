/**
 * Valor (Salt Waste Valorization) Types
 */

/**
 * Waste composition prediction request
 * Predict waste composition based on environmental factors
 */
export interface WasteCompositionPredictionRequest {
  month: string; // e.g., "January", "February"
  temperature: number; // in Celsius
  humidity: number; // in percentage
  rainfall?: number; // optional, in mm
  windSpeed?: number; // optional, in km/h
}

/**
 * Waste composition prediction response
 */
export interface WasteCompositionPredictionResponse {
  id: string;
  requestData: WasteCompositionPredictionRequest;
  predictions: {
    magnesiumChloride: number; // kg
    calciumSulfate: number; // kg
    sodiumSulfate: number; // kg
    organicMatter: number; // kg
    totalWaste: number; // kg
  };
  confidenceScore: number; // 0-1
  economicValue: number; // in LKR
  timestamp: string;
}

/**
 * Environmental factors prediction request
 * Predict environmental factors for desired waste composition
 */
export interface EnvironmentalFactorsPredictionRequest {
  month: string;
  targetComposition: {
    magnesiumChloride?: number;
    calciumSulfate?: number;
    sodiumSulfate?: number;
    organicMatter?: number;
  };
}

/**
 * Environmental factors prediction response
 */
export interface EnvironmentalFactorsPredictionResponse {
  id: string;
  requestData: EnvironmentalFactorsPredictionRequest;
  predictions: {
    optimalTemperature: number; // Celsius
    optimalHumidity: number; // percentage
    temperatureRange: [number, number]; // min, max
    humidityRange: [number, number]; // min, max
  };
  feasibility: 'High' | 'Medium' | 'Low';
  confidenceScore: number;
  timestamp: string;
}

/**
 * What-if scenario
 */
export interface WhatIfScenario {
  id: string;
  name: string;
  type: 'composition' | 'environmental';
  data: WasteCompositionPredictionRequest | EnvironmentalFactorsPredictionRequest;
  result: WasteCompositionPredictionResponse | EnvironmentalFactorsPredictionResponse | null;
  createdAt: string;
}

