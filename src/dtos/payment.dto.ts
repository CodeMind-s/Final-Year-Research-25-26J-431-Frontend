/**
 * Payment DTOs
 * Data Transfer Objects for payment-related requests and responses
 */

/**
 * Checkout request DTO
 */
export interface CheckoutRequest {
  planKey: string;
  billingCycle: 'monthly' | 'annual';
}

/**
 * Checkout response DTO (from POST /payments/checkout)
 */
export interface CheckoutResponse {
  success: boolean;
  merchant_id: string;
  order_id: string;
  hash: string;
  amount: number;
  currency: string;
  items: string;
  notify_url: string;
  return_url: string;
  cancel_url: string;
}

/**
 * User info for PayHere payment form (not from backend — supplied by frontend)
 */
export interface PayhereUserInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

/**
 * Payment record (from GET /payments)
 */
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  planKey: string;
  billingCycle: 'monthly' | 'annual';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Payment history response wrapper
 */
export interface PaymentHistoryResponse {
  payments: Payment[];
}
