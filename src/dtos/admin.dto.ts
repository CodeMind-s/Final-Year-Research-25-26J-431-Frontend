/**
 * Admin DTOs
 * Data Transfer Objects for admin dashboard API calls
 */

import { UserRole } from './auth.dto';

// ─── User Management ───

export interface AdminUser {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  role: UserRole;
  isOnboarded: boolean;
  plan?: string;
  isSubscribed: boolean;
  isVerified: boolean;
  isTrialActive: boolean;
  trialStartDate?: string;
  trialEndDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  isOnboard?: boolean;
  plan?: string;
  isSubscribe?: boolean;
  isVerified?: boolean;
}

export interface UsersListResponse {
  success: boolean;
  data: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Plan Management ───

export interface Plan {
  id?: string;
  key: string;
  name: string;
  level: number;
  priceMonthlyLKR: number;
  priceAnnualLKR: number;
  featureKeys: string[];
  duration: string;
  isActive: boolean;
}

export interface CreatePlanRequest {
  key: string;
  name: string;
  level: number;
  priceMonthlyLKR: number;
  priceAnnualLKR: number;
  featureKeys: string[];
  duration: string;
}

export interface UpdatePlanRequest {
  name?: string;
  level?: number;
  priceMonthlyLKR?: number;
  priceAnnualLKR?: number;
  featureKeys?: string[];
  duration?: string;
  isActive?: boolean;
}

// ─── Audit Logs ───

export interface AuditLog {
  id: string;
  serviceName: string;
  action: string;
  userId?: string;
  resourceId?: string;
  resourceType?: string;
  details?: string;
  status: string;
  ipAddress?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  userAgent?: string;
  createdAt?: string;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
}

export interface AuditLogsFilter {
  limit?: number;
  offset?: number;
  status?: string;
  serviceName?: string;
  method?: string;
}

// ─── Subscriptions ───

export interface AdminSubscription {
  id: string;
  userId: string;
  planId?: string;
  planKey: string;
  status: string;
  startDate?: string;
  endDate?: string;
  isTrial: boolean;
  paymentMethod: string;
}

export interface SubscriptionsResponse {
  success: boolean;
  subscriptions: AdminSubscription[];
  total: number;
  page: number;
  limit: number;
}
