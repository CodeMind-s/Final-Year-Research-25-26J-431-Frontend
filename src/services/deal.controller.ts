/**
 * Deal API Controller
 * Handles all deal-related API requests between landowners and distributors.
 * This controller provides methods to create, retrieve, update, and delete deals,
 * as well as fetch deals specific to landowners or distributors.
 */

import { BaseController } from "./base-controller";
import {
  CreateDealRequest,
  CreateDealResponse,
  DeleteDealResponse,
  GetDistributorDealsRequest,
  GetDistributorDealsResponse,
  GetLandownerDealsRequest,
  GetLandownerDealsResponse,
  UpdateDealsRequest,
  UpdateDealsResponse,
} from "@/types/deals.types";

/**
 * Deal controller class
 */
class DealController extends BaseController {
  constructor() {
    super("/deals");
  }

  /**
   * Create a new deal for a specific distributor offer
   * @param request - Deal creation data
   * @param offerId - ID of the distributor offer to create a deal for
   * @returns Response with success status and created deal data
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

  /**
   * Get deals for the authenticated landowner with optional filters
   * @param request - Filters for retrieving deals (status, pagination)
   * @returns Response with success status and list of landowner's deals
   */
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

  /**
   * Get deals for the authenticated distributor with optional filters
   * @param request - Filters for retrieving deals (status, pagination)
   * @returns Response with success status and list of distributor's deals
   */
  async getDistributorDeals(
    request: GetDistributorDealsRequest,
  ): Promise<GetDistributorDealsResponse> {
    const params = new URLSearchParams();
    if (request.page) params.append("page", request.page.toString());
    if (request.limit) params.append("limit", request.limit.toString());
    if (request.status) params.append("status", request.status);

    const queryString = params.toString();
    const endpoint = queryString ? `/distributor/my-deals?${queryString}` : "/distributor/my-deals";

    return this.get<GetDistributorDealsResponse>(endpoint);
  }

  /**
   * Update an existing deal
   * @param request - Updated deal data
   * @param dealId - ID of the deal to update
   * @returns Response with success status and updated deal data
   */
  async updateDeals(
    request: UpdateDealsRequest, dealId: string
  ): Promise<UpdateDealsResponse> {
    return this.patch<UpdateDealsResponse>(`/${dealId}`, request);
  }

  /**
   * Delete a deal by ID
   * @param dealId - ID of the deal to delete
   * @returns Response with success status and deletion confirmation
   */
  async deleteDeal(dealId: string): Promise<DeleteDealResponse> {
    return this.delete<DeleteDealResponse>(`/${dealId}`);
  }

}

/**
 * Singleton instance
 */
export const dealController = new DealController();
