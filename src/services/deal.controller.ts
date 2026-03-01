/**
 * Plan controller for handling harvest plan related API requests
 * This controller provides methods to create new harvest plans and retrieve existing plans for the authenticated user.
 * It interacts with the backend API endpoints related to harvest planning and abstracts away the API call details from the frontend components.
 * Handles all harvest plan-related API requests
 */

import {
  CreateDistributorOfferRequest,
  CreateDistributorOfferResponse,
  GetDistributorOffersRequest,
  GetDistributorOffersResponse,
} from "@/types/distributor-offers.types";
import { BaseController } from "./base-controller";
import {
  CreateDealRequest,
  CreateDealResponse,
  GetLandownerDealsRequest,
  GetLandownerDealsResponse,
  UpdateDealsRequest,
  UpdateDealsResponse,
} from "@/types/deals.types";

/**
 * Harvest Plan controller class
 */
class DealController extends BaseController {
  constructor() {
    super("/deals");
  }

  /**
   * Create harvest plan
   * @param request - Harvest plan data
   * @returns Response with success status and created distributor offer data
   */
  async createDeal(
    request: CreateDealRequest,
    offerId: string,
  ): Promise<CreateDealResponse> {
    return this.post<CreateDealResponse, CreateDealRequest>(
      `/offer/${offerId}`,
      request,
    );
  }

  async getLandownerDeals(
    request: GetLandownerDealsRequest,
  ): Promise<GetLandownerDealsResponse> {
    const params = new URLSearchParams();
    if (request.page) params.append("page", request.page.toString());
    if (request.limit) params.append("limit", request.limit.toString());
    if (request.status) params.append("status", request.status);

    const queryString = params.toString();
    const endpoint = queryString ? `/landowner/my-deals?${queryString}` : "/landowner/my-deals";

    return this.get<GetLandownerDealsResponse>(endpoint);
  }

  async updateDeals(
    request: UpdateDealsRequest, dealId: string
  ): Promise<UpdateDealsResponse> {
    return this.patch<UpdateDealsResponse>(`/${dealId}`, request);
  }
}

/**
 * Singleton instance
 */
export const dealController = new DealController();
