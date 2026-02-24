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
   * Create checkout session
   */
  async checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
    return this.post<CheckoutResponse, CheckoutRequest>(
      API_CONFIG.ENDPOINTS.PAYMENTS.CHECKOUT,
      request
    );
  }

  /**
   * Get payment history
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
