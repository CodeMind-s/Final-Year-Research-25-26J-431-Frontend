/**
 * Authentication Controller
 * Handles all authentication-related API calls
 */

import { BaseController } from './base-controller';
import { API_CONFIG } from '@/lib/api.config';
import { tokenStorage, storage } from '@/lib/storage.utils';
import {
  SignUpRequest,
  SignInRequest,
  SignInResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  PersonalDetailsResponse,
  LandOwnerOnboardingRequest,
  LaboratoryOnboardingRequest,
  DistributorOnboardingRequest,
  LoginRequest,
  LoginResponse,
  User,
} from '@/dtos/auth.dto';

/**
 * Authentication controller class
 */
class AuthController extends BaseController {
  constructor() {
    super('');
  }

  /**
   * Send OTP for new user registration (includes role)
   * @param request - Sign up request data with phone/email and role
   * @returns Response with OTP sent confirmation
   */
  async signUp(request: SignUpRequest): Promise<SignInResponse> {
    return this.post<SignInResponse, SignUpRequest>(
      API_CONFIG.ENDPOINTS.AUTH.SIGN_UP,
      request
    );
  }

  /**
   * Send OTP to phone or email (existing user login)
   * @param request - Sign in request data with phone or email
   * @returns Response with OTP sent confirmation
   */
  async signIn(request: SignInRequest): Promise<SignInResponse> {
    return this.post<SignInResponse, SignInRequest>(
      API_CONFIG.ENDPOINTS.AUTH.SIGN_IN,
      request
    );
  }

  /**
   * Verify OTP and get authentication tokens
   * @param request - OTP verification request with code
   * @returns Response with access token and user data
   */
  async verifyOtp(request: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const response = await this.post<VerifyOtpResponse, VerifyOtpRequest>(
      API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP,
      request
    );

    if (response.accessToken) {
      tokenStorage.setToken(response.accessToken);
    }

    return response;
  }

  /**
   * Get personal details of authenticated user
   * @returns Full personal details response with user and role-specific details
   */
  async getPersonalDetails(): Promise<PersonalDetailsResponse> {
    return this.get<PersonalDetailsResponse>(
      API_CONFIG.ENDPOINTS.AUTH.PERSONAL_DETAILS
    );
  }

  /**
   * Submit landowner onboarding details
   * @param request - Landowner onboarding data
   * @returns Updated user object
   */
  async onboardLandowner(request: LandOwnerOnboardingRequest): Promise<User> {
    return this.post<User, LandOwnerOnboardingRequest>(
      API_CONFIG.ENDPOINTS.AUTH.ONBOARDING_LANDOWNER,
      request
    );
  }

  /**
   * Submit laboratory onboarding details
   * @param request - Laboratory onboarding data
   * @returns Updated user object
   */
  async onboardLaboratory(request: LaboratoryOnboardingRequest): Promise<User> {
    return this.post<User, LaboratoryOnboardingRequest>(
      API_CONFIG.ENDPOINTS.AUTH.ONBOARDING_LABORATORY,
      request
    );
  }

  /**
   * Submit distributor onboarding details
   * @param request - Distributor onboarding data
   * @returns Updated user object
   */
  async onboardDistributor(request: DistributorOnboardingRequest): Promise<User> {
    return this.post<User, DistributorOnboardingRequest>(
      API_CONFIG.ENDPOINTS.AUTH.ONBOARDING_DISTRIBUTOR,
      request
    );
  }

  /**
   * Admin login with email and password
   * @param credentials - Login credentials (email and password)
   * @returns Response with access token and user data
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse, LoginRequest>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    if (response.accessToken) {
      tokenStorage.setToken(response.accessToken);
    }

    return response;
  }

  /**
   * Logout user and clear authentication data (client-side only)
   */
  logout(): void {
    tokenStorage.clearTokens();
    storage.remove('auth_user');
  }

  /**
   * Check if user is authenticated
   * @returns True if user has valid token, false otherwise
   */
  isAuthenticated(): boolean {
    return tokenStorage.hasToken();
  }

  /**
   * Get stored authentication token
   * @returns Access token or null if not authenticated
   */
  getToken(): string | null {
    return tokenStorage.getToken();
  }

  /**
   * Clear all authentication data from storage
   */
  clearAuth(): void {
    tokenStorage.clearTokens();
    storage.remove('auth_user');
  }
}

/**
 * Singleton instance
 */
export const authController = new AuthController();
