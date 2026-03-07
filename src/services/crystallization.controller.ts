/**
 * Crystallization API Controller
 * Handles all crystallization-related API requests
 */

import { BaseController } from "./base-controller";
import {
  DailyMeasurementRequest,
  DailyMeasurementGetRequest,
  DailyMeasurementDataItem,
  PredictedDailyMeasurementGetRequest,
  PredictedDailyMeasurementGetResponse,
  PredictedMonthlyProductionRequest,
  PredictedMonthlyProductionResponse,
  WeatherForecastResponse,
  CrystallizationPredictionRequest,
  GetCrystallizationModelPerformanceRequest,
  GetCrystallizationModelPerformanceResponse,
} from "@/types/crystallization.types";

/**
 * Crystallization controller class
 */
class CrystallizationController extends BaseController {
  constructor() {
    super("/crystallization");
  }

  /**
   * Get predicted monthly productions
   * @param request - Start and end month for predictions
   * @returns Predicted monthly production data
   */
  async getPredictedMonthlyProductions(
    request: PredictedMonthlyProductionRequest,
  ): Promise<PredictedMonthlyProductionResponse> {
    return this.get<PredictedMonthlyProductionResponse>(
      `/predicted-monthly-productions?startMonth=${request.startMonth}&endMonth=${request.endMonth}`,
    );
  }

  /**
   * Create daily measurement
   * @param request - Daily measurement data
   * @returns Created measurement data
   */
  async createDailyMeasurement(
    request: DailyMeasurementRequest,
  ): Promise<DailyMeasurementDataItem> {
    return this.post<DailyMeasurementDataItem, DailyMeasurementRequest>(
      "/daily-measurement",
      request,
    );
  }

  /**
   * Update daily measurement
   * @param id - Measurement ID
   * @param request - Updated measurement data
   * @returns Updated measurement data
   */
  async updateDailyMeasurement(
    id: string,
    request: DailyMeasurementRequest,
  ): Promise<DailyMeasurementDataItem> {
    return this.patch<DailyMeasurementDataItem, DailyMeasurementRequest>(
      `/daily-measurement/${id}`,
      request,
    );
  }

  /**
   * Get daily measurements (historical data)
   * @param request - Start and end date for measurements
   * @returns Daily measurement data array
   */
  async getDailyMeasurements(
    request: DailyMeasurementGetRequest,
  ): Promise<DailyMeasurementDataItem[]> {
    return this.get<DailyMeasurementDataItem[]>(
      `/daily-measurement?startDate=${request.startDate}&endDate=${request.endDate}`,
    );
  }

  /**
   * Get predicted daily measurements
   * @param request - Start and end date for predictions
   * @returns Predicted daily measurement data
   */
  async getPredictedDailyMeasurements(
    request: PredictedDailyMeasurementGetRequest,
  ): Promise<PredictedDailyMeasurementGetResponse> {
    return this.get<PredictedDailyMeasurementGetResponse>(
      `/predicted-daily-measurement?startDate=${request.startDate}&endDate=${request.endDate}`,
    );
  }

  /**
   * Get 16-day weather forecast
   * @returns Weather forecast data for next 16 days
   */
  async getWeatherForecast(): Promise<WeatherForecastResponse> {
    return this.get<WeatherForecastResponse>("/weather-forecast");
  }

  async getCrystallizationPredictions(
    request: CrystallizationPredictionRequest,
  ): Promise<any> {
    return this.post<any>("/predictions", request);
  }

  async getCrystallizationModelPerformance(
    request: GetCrystallizationModelPerformanceRequest,
  ): Promise<GetCrystallizationModelPerformanceResponse> {
    const params = new URLSearchParams();
    if (request.limit) params.append("limit", request.limit.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/model-performance?${queryString}` : "/model-performance";
    return this.get<GetCrystallizationModelPerformanceResponse>(endpoint);
  }
}

/**
 * Singleton instance
 */
export const crystallizationController = new CrystallizationController();
