/**
 * Plan controller for handling harvest plan related API requests
 * This controller provides methods to create new harvest plans and retrieve existing plans for the authenticated user.
 * It interacts with the backend API endpoints related to harvest planning and abstracts away the API call details from the frontend components.
 * Handles all harvest plan-related API requests
 */

import {
  GetMyHarvestPlansRequest,
  GetMyHarvestPlansResponse,
  HarvestPlanRequest,
  HarvestPlanResponse,
} from "@/types/harvest-plan.types";
import { BaseController } from "./base-controller";

/**
 * Harvest Plan controller class
 */
class HarvestPlanController extends BaseController {
  constructor() {
    super("/harvest-plans");
  }

  /**
   * Create harvest plan
   * @param request - Harvest plan data
   * @returns Response with success status and created harvest plan data
   */
  async createHarvestPlan(
    request: HarvestPlanRequest,
  ): Promise<HarvestPlanResponse> {
    return this.post<HarvestPlanResponse, HarvestPlanRequest>("", request);
  }

  /**
   * Get harvest plans for the authenticated user with optional filters
   * @param request - Filters for retrieving harvest plans (date range, status, pagination)
   * @returns Response with success status and list of harvest plans
   * @param request - Start and end date for filtering plans, status filter, pagination options
   * @returns Response with success status and list of harvest plans
   */
  async getHarvestPlans(
    request: GetMyHarvestPlansRequest,
  ): Promise<GetMyHarvestPlansResponse> {
    return this.get<GetMyHarvestPlansResponse>(
      `/my-plans?page=${request.page}&limit=${request.limit}&startDate=${request.startDate}&endDate=${request.endDate}&status=${request.status}`,
    );
  }
}

/**
 * Singleton instance
 */
export const harvestPlanController = new HarvestPlanController();
