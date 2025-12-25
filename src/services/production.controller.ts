/**
 * Crystallization API Controller
 * Handles all crystallization-related API requests
 */

import { BaseController } from './base-controller';
import {
  ActualMonthlyProductionRequest,
  ActualMonthlyProductionResponse,
} from '@/types/production.types';

/**
 * Crystallization controller class
 */
class ProductionController extends BaseController {
  constructor() {
    super('/saltproductions');
  }

  /**
   * Get actual monthly productions
   * @param request - Start and end month for actual production data
   * @returns Actual monthly production data
   */
  async getActualMonthlyProductions(
    request: ActualMonthlyProductionRequest
  ): Promise<ActualMonthlyProductionResponse> {
    return this.get<ActualMonthlyProductionResponse>(
      `/?startMonth=${request.startMonth}&endMonth=${request.endMonth}`
    );
  }
}

/**
 * Singleton instance
 */
export const productionController = new ProductionController();
