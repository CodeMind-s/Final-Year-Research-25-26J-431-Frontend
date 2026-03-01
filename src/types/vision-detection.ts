export interface ROIConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BoundingBox {
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  classId: number;
  className: "pure" | "impure" | "unwanted";
  confidence: number;
  color: string;
  insideROI?: boolean;
  whitenessPercentage?: number;
  qualityScore?: number;
}

export interface Detection {
  id: string;
  userId?: string;
  timestamp: string;
  frameWidth: number;
  frameHeight: number;
  processingTimeMs: number;
  pureCount: number;
  impureCount: number;
  unwantedCount: number;
  totalCount: number;
  purityPercentage: number;
  sessionId?: string;
  batchId?: string;
  roiPureCount?: number;
  roiImpureCount?: number;
  roiUnwantedCount?: number;
  roiTotalCount?: number;
  roiPurityPercentage?: number;
  avgWhiteness?: number;
  avgQualityScore?: number;
  roiAvgWhiteness?: number;
  roiAvgQualityScore?: number;
  boundingBoxes: BoundingBox[];
}

export interface DetectionResult {
  frameId: string;
  timestamp: number;
  processingTimeMs: number;
  pureCount: number;
  impureCount: number;
  unwantedCount: number;
  totalCount: number;
  purityPercentage: number;
  frameWidth: number;
  frameHeight: number;
  boundingBoxes: BoundingBox[];
  roiPureCount?: number;
  roiImpureCount?: number;
  roiUnwantedCount?: number;
  roiTotalCount?: number;
  roiPurityPercentage?: number;
  avgWhiteness?: number;
  avgQualityScore?: number;
  roiAvgWhiteness?: number;
  roiAvgQualityScore?: number;
  roi?: ROIConfig;
  currentBatchId?: string;
  currentBatchNumber?: number;
}

export interface BatchStats {
  pureCount: number;
  impureCount: number;
  unwantedCount: number;
  totalCount: number;
  purityPercentage: number;
  frameCount: number;
  avgWhiteness: number | null;
  avgQualityScore: number | null;
}

export interface BatchSummary {
  id: string;
  userId?: string;
  batchNumber: number;
  sessionId?: string;
  startTime: string;
  endTime: string | null;
  pureCount: number;
  impureCount: number;
  unwantedCount: number;
  totalCount: number;
  purityPercentage: number | null;
  frameCount: number;
  roi: ROIConfig;
  avgWhiteness: number | null;
  avgQualityScore: number | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface StatisticsSummary {
  totalDetections: number;
  totalPure: number;
  totalImpure: number;
  totalUnwanted: number;
  averagePurity: number;
  averageProcessingTime: number;
  detectionsPerHour: number;
  periodStart: string | null;
  periodEnd: string | null;
}

export interface HourlyStats {
  hour: number;
  detections: number;
  pureCount: number;
  impureCount: number;
  unwantedCount: number;
  avgPurity: number;
}

export interface DailyStats {
  date: string;
  detections: number;
  pureCount: number;
  impureCount: number;
  unwantedCount: number;
  avgPurity: number;
}

export interface TrendData {
  timestamp: string;
  purity: number;
}
