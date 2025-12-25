/**
 * Crystallization API Controller
 * Handles all crystallization-related API requests
 */

import { BaseController } from './base-controller';
import {
  DailyMeasurementRequest,
  DailyMeasurementResponse,
  PredictedMonthlyProductionRequest,
  PredictedMonthlyProductionResponse,
} from '@/types/crystallization.types';

/**
 * Crystallization controller class
 */
class CrystallizationController extends BaseController {
  constructor() {
    super('/crystallization');
  }

  /**
   * Get predicted monthly productions
   * @param request - Start and end month for predictions
   * @returns Predicted monthly production data
   */
  async getPredictedMonthlyProductions(
    request: PredictedMonthlyProductionRequest
  ): Promise<PredictedMonthlyProductionResponse> {
    return this.get<PredictedMonthlyProductionResponse>(
      `/predicted-monthly-productions?startMonth=${request.startMonth}&endMonth=${request.endMonth}`
    );
  }

  /**
   * Create daily measurement
   * @param request - Daily measurement data
   * @returns Response with success status
   */
  async createDailyMeasurement(
    request: DailyMeasurementRequest
  ): Promise<DailyMeasurementResponse> {
    return this.post<DailyMeasurementResponse, DailyMeasurementRequest>(
      '/daily-measurement',
      request
    );
  }
}

/**
 * Singleton instance
 */
export const crystallizationController = new CrystallizationController();
