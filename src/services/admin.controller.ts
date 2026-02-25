/**
 * Admin Controller
 * Handles all admin dashboard API calls
 */

import { BaseController } from './base-controller';
import { httpClient } from '@/lib/http-client';
import { API_CONFIG } from '@/lib/api.config';
import {
  AdminUser,
  CreateUserRequest,
  UpdateUserRequest,
  UsersListResponse,
  Plan,
  CreatePlanRequest,
  UpdatePlanRequest,
  AuditLog,
  AuditLogsResponse,
  AuditLogsFilter,
  AdminSubscription,
  SubscriptionsResponse,
} from '@/dtos/admin.dto';
import { Payment } from '@/dtos/payment.dto';

/**
 * Convert a gRPC Timestamp ({ seconds, nanos }) or ISO string to an ISO string.
 */
function toISOString(value: any): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    // gRPC Timestamp: { seconds: Long | number | string, nanos: number }
    // Long object shape: { low: number, high: number, unsigned: boolean }
    let secs = value.seconds;
    if (secs && typeof secs === 'object' && 'low' in secs) {
      secs = secs.low;
    }
    const ms = Number(secs) * 1000;
    if (!isNaN(ms) && ms > 0) {
      return new Date(ms).toISOString();
    }
  }
  return undefined;
}

class AdminController extends BaseController {
  constructor() {
    super('');
  }

  // ─── User Management ───

  /**
   * Get paginated user list.
   * Backend returns: { success, data: UserWithDetails[], pagination }
   * where each UserWithDetails = { user: User, landOwnerDetails, ... }
   * Uses raw axios to preserve pagination (httpClient.extractData strips it).
   * Flattens the nested user objects for easier frontend consumption.
   */
  async getUsers(page = 1, limit = 10): Promise<UsersListResponse> {
    const response = await httpClient.getInstance().get(
      API_CONFIG.ENDPOINTS.ADMIN.USERS_LIST,
      { params: { page, limit } },
    );
    const raw = response.data;

    // Flatten nested { user: {...}, landOwnerDetails, ... } into flat AdminUser objects
    const flattenedUsers = (raw.data || []).map((item: any) => {
      const user = item.user || item;
      return {
        id: user.id || user._id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        isOnboarded: user.isOnboarded,
        plan: user.plan,
        isSubscribed: user.isSubscribed,
        isVerified: user.isVerified,
        isTrialActive: user.isTrialActive,
        trialStartDate: user.trialStartDate,
        trialEndDate: user.trialEndDate,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    });

    return {
      ...raw,
      data: flattenedUsers,
    };
  }

  /**
   * Backend returns: { status, message, data: User, ...details }
   */
  async getUserById(id: string): Promise<AdminUser> {
    const res: any = await this.get(
      `${API_CONFIG.ENDPOINTS.ADMIN.USER_BY_ID}/${id}`,
    );
    return res?.data || res;
  }

  async createUser(data: CreateUserRequest): Promise<any> {
    return this.post(API_CONFIG.ENDPOINTS.ADMIN.USER_CREATE, data);
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<any> {
    return this.put(
      `${API_CONFIG.ENDPOINTS.ADMIN.USER_BY_ID}/${id}`,
      data,
    );
  }

  async deleteUser(email: string): Promise<void> {
    return this.delete<void>(
      `${API_CONFIG.ENDPOINTS.ADMIN.USER_DELETE}/${email}`,
    );
  }

  async verifyUser(id: string): Promise<any> {
    return this.put(
      `${API_CONFIG.ENDPOINTS.ADMIN.USER_VERIFY}/${id}/verify`,
    );
  }

  // ─── Plan Management ───

  /**
   * Backend returns: { success, plans: Plan[] }
   * extractData won't unwrap because there's no `data` key.
   * Proto fields use snake_case (price_monthly_lkr) which gRPC converts to
   * camelCase (priceMonthlyLkr). We normalize to our DTO field names.
   */
  async getPlans(): Promise<Plan[]> {
    const res: any = await this.get(API_CONFIG.ENDPOINTS.PLANS.LIST);
    const raw = res?.plans || res || [];
    if (!Array.isArray(raw)) return [];
    return raw.map((p: any) => ({
      id: p.id,
      key: p.key,
      name: p.name,
      level: p.level,
      priceMonthlyLKR: p.priceMonthlyLkr ?? p.priceMonthlyLKR ?? p.price_monthly_lkr ?? 0,
      priceAnnualLKR: p.priceAnnualLkr ?? p.priceAnnualLKR ?? p.price_annual_lkr ?? 0,
      featureKeys: p.featureKeys ?? p.feature_keys ?? [],
      duration: p.duration,
      isActive: p.isActive ?? p.is_active ?? true,
    }));
  }

  /**
   * Backend returns: { success, plan: Plan }
   */
  async getPlan(key: string): Promise<Plan> {
    const res: any = await this.get(`${API_CONFIG.ENDPOINTS.PLANS.BY_KEY}/${key}`);
    return res?.plan || res;
  }

  /**
   * Backend returns: { success, message, plan: Plan }
   */
  async createPlan(data: CreatePlanRequest): Promise<Plan> {
    const payload = {
      key: data.key,
      name: data.name,
      level: data.level,
      priceMonthlyLKR: data.priceMonthlyLKR,
      priceAnnualLKR: data.priceAnnualLKR,
      featureKeys: data.featureKeys,
      duration: data.duration,
    };
    const res: any = await this.post(API_CONFIG.ENDPOINTS.PLANS.CREATE, payload);
    return res?.plan || res;
  }

  /**
   * Backend returns: { success, message, plan: Plan }
   */
  async updatePlan(key: string, data: UpdatePlanRequest): Promise<Plan> {
    const res: any = await this.patch(
      `${API_CONFIG.ENDPOINTS.PLANS.UPDATE}/${key}`,
      data,
    );
    return res?.plan || res;
  }

  async deletePlan(key: string): Promise<void> {
    return this.delete<void>(
      `${API_CONFIG.ENDPOINTS.PLANS.DELETE}/${key}`,
    );
  }

  // ─── Audit Logs ───

  /**
   * Backend returns: { success, message, logs: Log[], total }
   * extractData won't unwrap because there's no `data` key.
   * We extract `logs` and `total` manually.
   */
  async getAuditLogs(filter: AuditLogsFilter = {}): Promise<AuditLogsResponse> {
    const res: any = await this.get(
      API_CONFIG.ENDPOINTS.AUDIT_LOGS.LIST,
      { params: filter },
    );
    return {
      logs: res?.logs || [],
      total: res?.total || 0,
    };
  }

  async getAuditLogsByUser(
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<AuditLogsResponse> {
    const res: any = await this.get(
      `${API_CONFIG.ENDPOINTS.AUDIT_LOGS.BY_USER}/${userId}`,
      { params: { limit, offset } },
    );
    return {
      logs: res?.logs || [],
      total: res?.total || 0,
    };
  }

  async getAuditLogById(logId: string): Promise<AuditLog> {
    const res: any = await this.get(
      `${API_CONFIG.ENDPOINTS.AUDIT_LOGS.BY_ID}/${logId}`,
    );
    return res?.log || res;
  }

  // ─── Payments ───

  /**
   * Backend returns: { success, payments: Payment[], total, page, limit }
   * Uses /payments/all (admin endpoint) to fetch ALL users' payments.
   */
  async getPayments(page = 1, limit = 10): Promise<{ payments: Payment[]; total: number }> {
    const res: any = await this.get(
      API_CONFIG.ENDPOINTS.PAYMENTS.ALL,
      { params: { page, limit } },
    );
    const rawPayments = res?.payments || [];
    return {
      payments: rawPayments.map((p: any) => ({
        id: p.id,
        orderId: p.orderId ?? p.order_id ?? '',
        amount: p.amount ?? 0,
        currency: p.currency ?? 'LKR',
        status: p.status ?? 'pending',
        planKey: p.planKey ?? p.plan_key ?? '',
        billingCycle: p.billingCycle ?? p.billing_cycle ?? '',
        userId: p.userId ?? p.user_id ?? '',
        createdAt: toISOString(p.createdAt || p.created_at),
        updatedAt: toISOString(p.updatedAt || p.updated_at),
      })),
      total: res?.total || 0,
    };
  }

  // ─── Subscriptions ───

  /**
   * Backend returns: { success, subscriptions: Subscription[], total, page, limit }
   * Uses /auth/subscriptions (admin endpoint).
   */
  async getSubscriptions(page = 1, limit = 10): Promise<SubscriptionsResponse> {
    const res: any = await this.get(
      API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.ALL,
      { params: { page, limit } },
    );
    const rawSubs = res?.subscriptions || [];
    return {
      success: true,
      subscriptions: rawSubs.map((s: any) => ({
        id: s.id,
        userId: s.userId ?? s.user_id ?? '',
        planId: s.planId ?? s.plan_id ?? '',
        planKey: s.planKey ?? s.plan_key ?? '',
        status: s.status ?? '',
        startDate: toISOString(s.startDate || s.start_date),
        endDate: toISOString(s.endDate || s.end_date),
        isTrial: s.isTrial ?? s.is_trial ?? false,
        paymentMethod: s.paymentMethod ?? s.payment_method ?? '',
      })),
      total: res?.total || 0,
      page: res?.page || page,
      limit: res?.limit || limit,
    };
  }
}

export const adminController = new AdminController();
