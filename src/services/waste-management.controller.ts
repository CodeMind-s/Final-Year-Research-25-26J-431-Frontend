/**
 * Waste Management API Controller
 * Handles all waste management and valorization API requests
 */

import { BaseController } from './base-controller';
import {
  WastePredictionsRequest,
  WastePredictionsResponse,
  QuickPredictionRequest,
  QuickPredictionJobResponse,
} from '@/types/waste-management.types';

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
   * @param request - User input parameters for instant prediction
   * @returns Job submission response with jobId
   */
  async submitQuickPrediction(
    request: QuickPredictionRequest
  ): Promise<QuickPredictionJobResponse> {
    return this.post<QuickPredictionJobResponse, QuickPredictionRequest>(
      '/quick-prediction',
      request
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
}

/**
 * Singleton instance
 */
export const wasteManagementController = new WasteManagementController();
