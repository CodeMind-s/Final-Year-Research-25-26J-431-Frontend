/**
 * AI/Gemini API Controller
 * Handles AI-powered recommendation and hint generation API requests
 */

import { PlanCreateHintResponse } from "@/types/gemini.types";
import { BaseController } from "./base-controller";

/**
 * AI controller class
 */
class AiController extends BaseController {
  constructor() {
    super("/ai");
  }

  /**
   * Get AI-generated hint for harvest plan creation
   * @returns Plan creation hint with notification, description, planning days and start date
   */
  async getPlanCreateHint(): Promise<PlanCreateHintResponse> {
    return this.get<PlanCreateHintResponse>("/plan-creating-hint");
  }
}

/**
 * Singleton instance
 */
export const aiController = new AiController();