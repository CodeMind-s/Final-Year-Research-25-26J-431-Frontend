/**
 * Payment Controller
 * Handles all payment-related API calls
 */

import { BaseController } from './base-controller';
import { API_CONFIG } from '@/lib/api.config';
import { CheckoutRequest, CheckoutResponse, Payment, PaymentHistoryResponse } from '@/dtos/payment.dto';

/**
 * Payment controller class
 */
class PaymentController extends BaseController {
  constructor() {
    super('');
  }

  /**
   * Create checkout session for payment processing
   * @param request - Checkout request data including plan and billing cycle
   * @returns Checkout response with payment session details
   */
  async checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
    return this.post<CheckoutResponse, CheckoutRequest>(
      API_CONFIG.ENDPOINTS.PAYMENTS.CHECKOUT,
      request
    );
  }

  /**
   * Get payment history for the authenticated user
   * @returns Array of payment records
   */
  async getPayments(): Promise<Payment[]> {
    const response = await this.get<PaymentHistoryResponse>(
      API_CONFIG.ENDPOINTS.PAYMENTS.HISTORY
    );
    return response.payments;
  }
}

/**
 * Singleton instance
 */
export const paymentController = new PaymentController();
