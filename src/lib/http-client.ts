/**
 * HTTP Client
 * Axios-based HTTP client with interceptors, error handling, and retry logic
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_CONFIG, ENV, HTTP_STATUS } from './api.config';
import { ApiError, ApiErrorFactory, ErrorHandler } from './api-error';
import { tokenStorage } from './storage.utils';
import { ApiResponse, ApiErrorResponse } from '@/types/api.types';

/**
 * Create axios instance with default configuration
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
      Accept: API_CONFIG.HEADERS.ACCEPT,
    },
  });

  return instance;
};

/**
 * HTTP Client class with interceptors and error handling
 */
class HttpClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = createAxiosInstance();
    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      this.handleRequest.bind(this),
      this.handleRequestError.bind(this)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      this.handleResponse.bind(this),
      this.handleResponseError.bind(this)
    );
  }

  /**
   * Request interceptor - add auth token
   */
  private handleRequest(
    config: InternalAxiosRequestConfig
  ): InternalAxiosRequestConfig {
    const token = tokenStorage.getToken();

    if (token && config.headers) {
      config.headers.Authorization = `${API_CONFIG.TOKEN.TOKEN_PREFIX} ${token}`;
    }

    // Log request in development
    if (ENV.isDevelopment) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  }

  /**
   * Request error interceptor
   */
  private handleRequestError(error: AxiosError): Promise<never> {
    ErrorHandler.logError(
      ApiErrorFactory.createNetworkError('Request configuration error'),
      'Request Interceptor'
    );
    return Promise.reject(error);
  }

  /**
   * Response interceptor - handle successful responses
   */
  private handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): AxiosResponse<ApiResponse<T>> {
    // Log response in development
    if (ENV.isDevelopment) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  }

  /**
   * Response error interceptor - handle errors and retry logic
   */
  private async handleResponseError(error: AxiosError<ApiErrorResponse>): Promise<never> {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    // Network error
    if (!error.response) {
      const apiError = ApiErrorFactory.createNetworkError();
      ErrorHandler.logError(apiError, 'Network');
      return Promise.reject(apiError);
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized - clear tokens (no refresh endpoint available)
    if (status === HTTP_STATUS.UNAUTHORIZED) {
      tokenStorage.clearTokens();
    }

    // Handle retry logic for specific status codes
    const retryStatusCodes = API_CONFIG.RETRY.RETRY_STATUS_CODES as readonly number[];
    if (
      retryStatusCodes.includes(status) &&
      (!originalRequest._retryCount ||
        originalRequest._retryCount < API_CONFIG.RETRY.MAX_RETRIES)
    ) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, API_CONFIG.RETRY.RETRY_DELAY)
      );

      return this.axiosInstance(originalRequest) as Promise<never>;
    }

    // Log full error response for debugging
    if (ENV.isDevelopment) {
      console.error('🔴 Full error response data:', JSON.stringify(data, null, 2));
    }

    // Create appropriate error — check multiple response formats
    const dataAny = data as unknown as Record<string, unknown> | undefined;
    const errorMessage = data?.error?.message
      || (dataAny?.message as string)
      || error.message;
    const errorDetails = data?.error?.details
      || (dataAny?.errors as Record<string, unknown>);

    const apiError = ApiErrorFactory.createFromResponse(
      status,
      errorMessage,
      errorDetails
    );

    ErrorHandler.logError(apiError, 'Response');
    return Promise.reject(apiError);
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<ApiResponse<T> | T>(url, config);
    // Handle both { success: true, data: T } and direct T responses
    return this.extractData<T>(response.data);
  }

  /**
   * POST request
   */
  async post<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.post<ApiResponse<T> | T>(url, data, config);
    // Handle both { success: true, data: T } and direct T responses
    return this.extractData<T>(response.data);
  }

  /**
   * PUT request
   */
  async put<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.put<ApiResponse<T> | T>(url, data, config);
    // Handle both { success: true, data: T } and direct T responses
    return this.extractData<T>(response.data);
  }

  /**
   * PATCH request
   */
  async patch<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.patch<ApiResponse<T> | T>(url, data, config);
    // Handle both { success: true, data: T } and direct T responses
    return this.extractData<T>(response.data);
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<ApiResponse<T> | T>(url, config);
    // Handle both { success: true, data: T } and direct T responses
    return this.extractData<T>(response.data);
  }

  /**
   * Extract data from response - handles both wrapped and unwrapped responses
   */
  private extractData<T>(responseData: ApiResponse<T> | T): T {
    // Check if response is wrapped in ApiResponse format
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      return (responseData as ApiResponse<T>).data;
    }
    // Return data directly if not wrapped
    return responseData as T;
  }

  /**
   * Get raw axios instance for custom requests
   */
  getInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

/**
 * Singleton instance
 */
export const httpClient = new HttpClient();
