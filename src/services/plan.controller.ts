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
  UpdateHarvestPlanRequest,
  GetDemandPriceRequest,
  GetDemandPriceResponse,
  DemandPriceForecastRequest,
  DemandPriceForecastResponse,
} from "@/types/harvest-plan.types";
import { BaseController } from "./base-controller";
import { DeleteDealResponse } from "@/types/deals.types";

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
    const params = new URLSearchParams();
    if (request.page) params.append("page", request.page.toString());
    if (request.limit) params.append("limit", request.limit.toString());
    if (request.startDate) params.append("startDate", request.startDate);
    if (request.endDate) params.append("endDate", request.endDate);
    if (request.status) params.append("status", request.status);

    const queryString = params.toString();
    const endpoint = queryString ? `/my-plans?${queryString}` : "/my-plans";

    return this.get<GetMyHarvestPlansResponse>(endpoint);
  }
  
  async deleteHarvestPlans(
    planId: string,
  ): Promise<DeleteDealResponse> {
    return this.delete<DeleteDealResponse>(`/${planId}`);
  }

  async getHarvestPlanById(planId: string): Promise<HarvestPlanResponse> {
    return this.get<HarvestPlanResponse>(`/${planId}`);
  }

  async updateHarvestPlan(planId: string, request: UpdateHarvestPlanRequest): Promise<HarvestPlanResponse> {
    return this.patch<HarvestPlanResponse, UpdateHarvestPlanRequest>(`/${planId}`, request);
  }

  /**
   * Get historical demand and price data
   * @param request - Start and end month in YYYY-MM format
   * @returns Response with demand and price data for the specified period
   */
  async getDemandPrice(
    request: GetDemandPriceRequest,
  ): Promise<GetDemandPriceResponse> {
    const params = new URLSearchParams();
    params.append("startMonth", request.startMonth);
    params.append("endMonth", request.endMonth);
    
    return this.get<GetDemandPriceResponse>(`/demand-price?${params.toString()}`);
  }

  /**
   * Get demand and price forecast
   * @param request - Forecast date
   * @returns Response with forecasted demand and price data
   */
  async getDemandPriceForecast(
    request: DemandPriceForecastRequest,
  ): Promise<DemandPriceForecastResponse> {
    return this.post<DemandPriceForecastResponse, DemandPriceForecastRequest>(
      "/demand-price-forecast",
      request,
    );
  }
}

/**
 * Singleton instance
 */
export const harvestPlanController = new HarvestPlanController();
