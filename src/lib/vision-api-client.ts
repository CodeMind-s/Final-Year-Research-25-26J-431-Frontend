import { httpClient } from "@/lib/http-client";
import {
  Detection,
  BatchSummary,
  PaginatedResponse,
  StatisticsSummary,
  HourlyStats,
  DailyStats,
  TrendData,
} from "@/types/vision-detection";

const PREFIX = "/vision";

// --- Response transform helpers ---

interface BackendDetectionsResponse {
  detections: Detection[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface BackendStatsResponse<T> {
  stats: T[];
}

interface BackendSessionBatchesResponse {
  batches: BatchSummary[];
  total: number;
}

function toPaginated<T>(raw: {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}): PaginatedResponse<T> {
  return {
    data: raw.data,
    meta: {
      total: raw.total,
      page: raw.page,
      limit: raw.limit,
      totalPages: raw.totalPages,
      hasNext: raw.page < raw.totalPages,
      hasPrev: raw.page > 1,
    },
  };
}

// --- API Client ---

export const visionApi = {
  // Detections
  getDetections: async (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    minPurity?: number;
    maxPurity?: number;
    sessionId?: string;
  }): Promise<PaginatedResponse<Detection>> => {
    const raw = await httpClient.get<BackendDetectionsResponse>(
      `${PREFIX}/detections`,
      { params }
    );
    return toPaginated({
      data: raw.detections,
      total: raw.meta.total,
      page: raw.meta.page,
      limit: raw.meta.limit,
      totalPages: raw.meta.totalPages,
    });
  },

  getDetection: (id: string): Promise<Detection> =>
    httpClient.get<Detection>(`${PREFIX}/detections/${id}`),

  deleteDetection: (id: string): Promise<void> =>
    httpClient.delete<void>(`${PREFIX}/detections/${id}`),

  // Batches
  getAllBatches: async (params?: {
    page?: number;
    limit?: number;
    sessionId?: string;
  }): Promise<{ batches: BatchSummary[]; total: number }> => {
    return httpClient.get<BackendSessionBatchesResponse>(
      `${PREFIX}/batches`,
      { params }
    );
  },

  getSessionBatches: async (
    sessionId: string
  ): Promise<{ batches: BatchSummary[]; total: number }> => {
    return httpClient.get<BackendSessionBatchesResponse>(
      `${PREFIX}/batches/session/${sessionId}`
    );
  },

  getBatch: (id: string): Promise<BatchSummary> =>
    httpClient.get<BatchSummary>(`${PREFIX}/batches/${id}`),

  // Statistics
  getStatsSummary: (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<StatisticsSummary> =>
    httpClient.get<StatisticsSummary>(`${PREFIX}/statistics/summary`, {
      params,
    }),

  getHourlyStats: async (date?: string): Promise<HourlyStats[]> => {
    const raw = await httpClient.get<BackendStatsResponse<HourlyStats>>(
      `${PREFIX}/statistics/hourly`,
      { params: date ? { date } : undefined }
    );
    return raw.stats;
  },

  getDailyStats: async (params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<DailyStats[]> => {
    const raw = await httpClient.get<BackendStatsResponse<DailyStats>>(
      `${PREFIX}/statistics/daily`,
      { params }
    );
    return raw.stats;
  },

  getTrends: async (params?: {
    period?: string;
    limit?: number;
  }): Promise<TrendData[]> => {
    const raw = await httpClient.get<BackendStatsResponse<TrendData>>(
      `${PREFIX}/statistics/trends`,
      { params }
    );
    return raw.stats;
  },

  // Health
  getHealth: (): Promise<unknown> =>
    httpClient.get<unknown>(`${PREFIX}/health`),
};
