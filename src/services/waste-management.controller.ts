/**
 * Waste Management API Controller
 * Handles all waste management and valorization API requests
 */

import { BaseController } from './base-controller';
import {
  WastePredictionsRequest,
  WastePredictionsResponse,
  QuickPredictionFormData,
  QuickPredictionRequest,
  QuickPredictionJobResponse,
  RecentPredictionsResponse,
  RecentPrediction,
  RawJobResponse,
  RawResultData,
  WastePredictionData,
} from '@/types/waste-management.types';
import { httpClient } from '@/lib/http-client';

/**
 * Waste Management controller class
 */
class WasteManagementController extends BaseController {
  constructor() {
    super('/salt-society/waste-management');
  }

  /**
   * Get waste predictions with environmental data
   * @param request - Optional date range and averages flag
   * @returns Waste predictions with historical and forecasted data
   */
  async getWastePredictions(
    request?: WastePredictionsRequest
  ): Promise<WastePredictionsResponse> {
    const params = new URLSearchParams();
    
    if (request?.startDate) {
      params.append('startDate', request.startDate);
    }
    
    if (request?.endDate) {
      params.append('endDate', request.endDate);
    }
    
    if (request?.includeAverages !== undefined) {
      params.append('includeAverages', String(request.includeAverages));
    }
    
    const queryString = params.toString();
    const url = queryString ? `/predictions?${queryString}` : '/predictions';
    
    return this.get<WastePredictionsResponse>(url);
  }

  /**
   * Submit quick waste prediction job (async with Event Hub)
   * @param formData - User input parameters for instant prediction
   * @param predictionDate - Date for prediction (YYYY-MM-DD format)
   * @returns Job submission response with jobId
   */
  async submitQuickPrediction(
    formData: QuickPredictionFormData,
    predictionDate: string
  ): Promise<QuickPredictionJobResponse> {
    // Build the payload according to backend requirements
    const payload: QuickPredictionRequest = {
      jobType: "WASTE_PREDICTION",
      predictionDate,
      requestData: {
        production_volume: formData.production_volume,
        rain_sum: formData.rain_sum,
        temperature_mean: formData.temperature_mean,
        humidity_mean: formData.humidity_mean,
        wind_speed_mean: formData.wind_speed_mean,
        month: formData.month,
      }
    };

    // Call the waste-valorization-jobs endpoint directly (not through base path)
    return httpClient.post<QuickPredictionJobResponse, QuickPredictionRequest>(
      '/waste-valorization-jobs',
      payload
    );
  }

  /**
   * Check status of quick prediction job
   * @param jobId - Job ID from submission
   * @returns Job status and prediction when complete
   */
  async getQuickPredictionStatus(
    jobId: string
  ): Promise<QuickPredictionJobResponse> {
    return this.get<QuickPredictionJobResponse>(`/quick-prediction/${jobId}`);
  }

  /**
   * Get recent waste prediction jobs (most recent 5)
   * @returns List of recent predictions with metadata
   */
  async getRecentPredictions(): Promise<RecentPredictionsResponse> {
    // httpClient extracts response.data.data and returns just the array
    const jobsArray = await httpClient.get<RawJobResponse[]>('/waste-valorization-jobs?jobType=WASTE_PREDICTION&page=1&limit=5');
    
    // Transform the array of jobs
    const predictions: RecentPrediction[] = (Array.isArray(jobsArray) ? jobsArray : []).map(job => this.transformJobResponse(job));
    
    return {
      predictions,
      total: predictions.length
    };
  }

  /**
   * Transform raw job response from backend to application format
   * @param job - Raw job response from backend
   * @returns Transformed recent prediction object
   * @private
   */
  private transformJobResponse(job: RawJobResponse): RecentPrediction {
    // Parse request data
    const requestData = JSON.parse(job.requestData);
    
    // Parse result data if available
    let prediction: WastePredictionData | undefined;
    if (job.resultData && job.status === "COMPLETED") {
      try {
        const resultData: RawResultData = JSON.parse(job.resultData);
        
        // Transform to our WastePredictionData format
        prediction = {
          date: job.predictionDate,
          predicted_waste: resultData.total_waste_kg || resultData.Total_Waste_kg || 0,
          production_volume: requestData.production_volume,
          rain_sum: requestData.rain_sum,
          temperature_mean: requestData.temperature_mean,
          humidity_mean: requestData.humidity_mean,
          wind_speed_mean: requestData.wind_speed_mean,
          type: "predicted",
          
          // Solid waste breakdown
          solid_waste_gypsum: resultData.solid_waste_gypsum_kg,
          solid_waste_limestone: resultData.solid_waste_limestone_kg,
          solid_waste_industrial_salt: resultData.solid_waste_industrial_salt_kg,
          total_solid_waste: 
            resultData.solid_waste_gypsum_kg + 
            resultData.solid_waste_limestone_kg + 
            resultData.solid_waste_industrial_salt_kg,
          
          // Liquid waste breakdown
          liquid_waste_bittern: resultData.liquid_waste_bittern_liters,
          potential_epsom_salt: resultData.potential_epsom_salt_kg,
          potential_potash: resultData.potential_potash_kg,
          potential_magnesium_oil: resultData.potential_magnesium_oil_liters,
          total_liquid_waste: resultData.liquid_waste_bittern_liters,
          
          period: new Date(job.predictionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        } as WastePredictionData & { period: string };
      } catch (error) {
        console.error("Error parsing result data:", error);
      }
    }
    
    // Map status to lowercase
    const statusMap: Record<string, "processing" | "completed" | "failed"> = {
      "COMPLETED": "completed",
      "PROCESSING": "processing",
      "FAILED": "failed"
    };
    
    const result = {
      jobId: job._id,
      predictionDate: job.predictionDate,
      createdAt: job.createdAt,
      status: statusMap[job.status] || "processing",
      prediction,
      requestData
    };
    
    return result;
  }
}

/**
 * Singleton instance
 */
export const wasteManagementController = new WasteManagementController();
