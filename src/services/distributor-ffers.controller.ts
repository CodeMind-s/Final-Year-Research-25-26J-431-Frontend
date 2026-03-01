/**
 * Plan controller for handling harvest plan related API requests
 * This controller provides methods to create new harvest plans and retrieve existing plans for the authenticated user.
 * It interacts with the backend API endpoints related to harvest planning and abstracts away the API call details from the frontend components.
 * Handles all harvest plan-related API requests
 */

import { CreateDistributorOfferRequest, CreateDistributorOfferResponse, GetDistributorOffersRequest, GetDistributorOffersResponse } from "@/types/distributor-offers.types";
import { BaseController } from "./base-controller";

/**
 * Harvest Plan controller class
 */
class DistributorOffersController extends BaseController {
  constructor() {
    super("/distributor-offers");
  }

  /**
   * Create harvest plan
   * @param request - Harvest plan data
   * @returns Response with success status and created distributor offer data
   */
  async createDistributorOffer(
    request: CreateDistributorOfferRequest,
  ): Promise<CreateDistributorOfferResponse> {
    return this.post<CreateDistributorOfferResponse, CreateDistributorOfferRequest>("", request);
  }

  /**
   * Get harvest plans for the authenticated user with optional filters
   * @param request - Filters for retrieving harvest plans (date range, status, pagination)
   * @returns Response with success status and list of harvest plans
   * @param request - Start and end date for filtering plans, status filter, pagination options
   * @returns Response with success status and list of harvest plans
   */
  async getDistributorOffers(
    request: GetDistributorOffersRequest,
  ): Promise<GetDistributorOffersResponse> {
    const params = new URLSearchParams();
    if (request.page) params.append('page', request.page.toString());
    if (request.limit) params.append('limit', request.limit.toString());
    if (request.requirement) params.append('requirement', request.requirement);
    if (request.status) params.append('status', request.status);
    
    const queryString = params.toString();
    const endpoint = queryString ? `?${queryString}` : '';
    
    return this.get<GetDistributorOffersResponse>(endpoint);
  }
}

/**
 * Singleton instance
 */
export const distributorOffersController = new DistributorOffersController();
