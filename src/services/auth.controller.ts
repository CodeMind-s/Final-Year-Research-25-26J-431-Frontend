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
   */
  async signUp(request: SignUpRequest): Promise<SignInResponse> {
    return this.post<SignInResponse, SignUpRequest>(
      API_CONFIG.ENDPOINTS.AUTH.SIGN_UP,
      request
    );
  }

  /**
   * Send OTP to phone or email (existing user login)
   */
  async signIn(request: SignInRequest): Promise<SignInResponse> {
    return this.post<SignInResponse, SignInRequest>(
      API_CONFIG.ENDPOINTS.AUTH.SIGN_IN,
      request
    );
  }

  /**
   * Verify OTP and get tokens
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
   * Get personal details of authenticated user (GET /auth/personal-details)
   */
  async getPersonalDetails(): Promise<User> {
    const response = await this.get<PersonalDetailsResponse>(
      API_CONFIG.ENDPOINTS.AUTH.PERSONAL_DETAILS
    );
    return response.user;
  }

  /**
   * Submit landowner onboarding
   */
  async onboardLandowner(request: LandOwnerOnboardingRequest): Promise<User> {
    return this.post<User, LandOwnerOnboardingRequest>(
      API_CONFIG.ENDPOINTS.AUTH.ONBOARDING_LANDOWNER,
      request
    );
  }

  /**
   * Submit laboratory onboarding
   */
  async onboardLaboratory(request: LaboratoryOnboardingRequest): Promise<User> {
    return this.post<User, LaboratoryOnboardingRequest>(
      API_CONFIG.ENDPOINTS.AUTH.ONBOARDING_LABORATORY,
      request
    );
  }

  /**
   * Submit distributor onboarding
   */
  async onboardDistributor(request: DistributorOnboardingRequest): Promise<User> {
    return this.post<User, DistributorOnboardingRequest>(
      API_CONFIG.ENDPOINTS.AUTH.ONBOARDING_DISTRIBUTOR,
      request
    );
  }

  /**
   * Admin login with email/password
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
   * Logout user (client-side only — no backend endpoint)
   */
  logout(): void {
    tokenStorage.clearTokens();
    storage.remove('auth_user');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenStorage.hasToken();
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return tokenStorage.getToken();
  }

  /**
   * Clear all authentication data
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
