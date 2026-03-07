/**
 * Base API Controller
 * Abstract base class providing common functionality for all API controllers
 */

import { httpClient } from '@/lib/http-client';
import { AxiosRequestConfig } from 'axios';

/**
 * Base controller class for all API controllers
 */
export abstract class BaseController {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Build full URL with base path
   * @param path - Endpoint path to append to base URL
   * @returns Full URL string
   */
  protected buildUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  /**
   * Execute GET request
   * @param path - Endpoint path
   * @param config - Optional Axios request configuration
   * @returns Promise with response data
   */
  protected async get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return httpClient.get<T>(this.buildUrl(path), config);
  }

  /**
   * Execute POST request
   * @param path - Endpoint path
   * @param data - Request body data
   * @param config - Optional Axios request configuration
   * @returns Promise with response data
   */
  protected async post<T, D = unknown>(
    path: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return httpClient.post<T, D>(this.buildUrl(path), data, config);
  }

  /**
   * Execute PUT request
   * @param path - Endpoint path
   * @param data - Request body data
   * @param config - Optional Axios request configuration
   * @returns Promise with response data
   */
  protected async put<T, D = unknown>(
    path: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return httpClient.put<T, D>(this.buildUrl(path), data, config);
  }

  /**
   * Execute PATCH request
   * @param path - Endpoint path
   * @param data - Request body data
   * @param config - Optional Axios request configuration
   * @returns Promise with response data
   */
  protected async patch<T, D = unknown>(
    path: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return httpClient.patch<T, D>(this.buildUrl(path), data, config);
  }

  /**
   * Execute DELETE request
   * @param path - Endpoint path
   * @param config - Optional Axios request configuration
   * @returns Promise with response data
   */
  protected async delete<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return httpClient.delete<T>(this.buildUrl(path), config);
  }
}
