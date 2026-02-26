/**
 * Authentication DTOs
 * Data Transfer Objects for authentication-related requests and responses
 */

/**
 * User role enumeration
 */
export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  SALTSOCIETY = 'SALTSOCIETY',
  LANDOWNER = 'LANDOWNER',
  DISTRIBUTOR = 'DISTRIBUTOR',
  LABORATORY = 'LABORATORY',
}

/**
 * User interface
 */
export interface User {
  id: string;
  email?: string;
  phone?: string;
  role: UserRole;
  name?: string;
  avatar?: string;
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

/**
 * Sign in request DTO (OTP-based)
 */
export interface SignInRequest {
  phone?: string;
  email?: string;
  role: UserRole;
}

/**
 * Sign in response DTO
 */
export interface SignInResponse {
  message: string;
}

/**
 * Verify OTP request DTO
 */
export interface VerifyOtpRequest {
  phone?: string;
  email?: string;
  code: string;
}

/**
 * Verify OTP response DTO
 */
export interface VerifyOtpResponse {
  accessToken: string;
  isNewUser: boolean;
  isOnboarded: boolean;
}

/**
 * Personal details response DTO
 */
export interface PersonalDetailsResponse {
  user: User;
  landOwnerDetails?: Record<string, unknown> | null;
  serviceProviderDetails?: Record<string, unknown> | null;
  laboratoryDetails?: Record<string, unknown> | null;
  distributorDetails?: Record<string, unknown> | null;
}

/**
 * Landowner onboarding request DTO
 */
export interface LandOwnerOnboardingRequest {
  nic: string;
  address: string;
  totalBeds: number;
  docUrls: string[];
}

/**
 * Laboratory onboarding request DTO
 */
export interface LaboratoryOnboardingRequest {
  laboratoryName: string;
  registrationNumber: string;
  address: string;
  docUrls: string[];
}

/**
 * Distributor onboarding request DTO
 */
export interface DistributorOnboardingRequest {
  companyName: string;
  registrationNumber: string;
  address: string;
  docUrls: string[];
}

/**
 * Login request DTO (admin email/password)
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response DTO
 */
export interface LoginResponse {
  accessToken: string;
  user: User;
}

/**
 * Auth state interface
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
