export interface HarvestPlan {
  _id: string;
  userId: string;
  saltBeds: number;
  harvestStatus: number;
  planPeriod: number;
  startDate: string;
  endDate: string;
  predictedProduction: number;
  actualProduction: number;
  workerCount: number;
  predictedProfit: number;
  actualProfit: number;
  expenses: number;
  earnings: number;
  avgSellingPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface HarvestPlanRequest {
  saltBeds: number;
  harvestStatus: "FRESHER" | "MATURE";
  planPeriod: number;
  startDate: string;
  predictedProduction: number;
  actualProduction: number;
  workerCount: number;
  predictedProfit: number;
  actualProfit: number;
  expenses: number;
  earnings: number;
  avgSellingPrice: number;
}

export interface HarvestPlanResponse {
  success: boolean;
  message: string;
  data: HarvestPlan;
}

export interface GetMyHarvestPlansRequest {
  startDate?: string;
  endDate?: string;
  status?: "FRESHER" | "MIDLEVEL" | "HARVESTED" | "DISPOSED";
  limit?: number;
  page?: number;
}

export interface GetMyHarvestPlansResponse {
  success: boolean;
  message: string;
  data: HarvestPlan[];
}
