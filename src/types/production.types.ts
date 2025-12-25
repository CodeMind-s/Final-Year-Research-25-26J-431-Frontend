/**
 * Actual Monthly Production Request
 */
export interface ActualMonthlyProductionRequest {
  startMonth: string; // Format: "YYYY-MM"
  endMonth: string;   // Format: "YYYY-MM"
}

/**
 * Actual Monthly Production Data from API
 */
export interface ActualMonthlyProductionData {
  _id: string;
  month: string; // Format: "YYYY-MM"
  production_volume: number;
  season: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Actual Monthly Production Response
 */
export interface ActualMonthlyProductionResponse {
  data: ActualMonthlyProductionData[];
  success: boolean;
  message: string;
}
