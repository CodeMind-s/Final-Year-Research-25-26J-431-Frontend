/**
 * Crystallization API Controller
 * Handles all crystallization-related API requests
 */

import { PlanCreateHintResponse } from "@/types/gemini.types";
import { BaseController } from "./base-controller";
import {
  DailyMeasurementRequest,
  DailyMeasurementResponse,
  DailyMeasurementGetRequest,
  DailyMeasurementGetResponse,
  PredictedDailyMeasurementGetRequest,
  PredictedDailyMeasurementGetResponse,
  PredictedMonthlyProductionRequest,
  PredictedMonthlyProductionResponse,
  WeatherForecastResponse,
  CrystallizationPredictionRequest,
} from "@/types/crystallization.types";

/**
 * Ai controller class
 */
class AiController extends BaseController {
  constructor() {
    super("/ai");
  }

  /**
   * Get 16-day weather forecast
   * @returns Weather forecast data for next 16 days
   */
  async getPlanCreateHint(): Promise<PlanCreateHintResponse> {
    return this.get<PlanCreateHintResponse>("/plan-creating-hint");
  }
}

/**
 * Singleton instance
 */
export const aiController = new AiController();