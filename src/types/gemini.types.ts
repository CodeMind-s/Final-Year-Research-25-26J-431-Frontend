/**
 * Gemini AI Type Definitions
 * Types for AI-powered plan creation hints and recommendations
 */

/**
 * AI-generated hint response for harvest plan creation
 */
export interface PlanCreateHintResponse {
  notification: {
    si: string;
    ta: string;
    en: string;
  };
  description: {
    si: string;
    ta: string;
    en: string;
  };
  plandays: number;
  startdate: string;
}
