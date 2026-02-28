// Mock data for saltern pond grid and harvest readiness

export type PondStatus = "ready" | "growing" | "flooded" | "idle";

export interface Pond {
  id: string;
  label: string;
  row: number;
  col: number;
  ownerId: string | null; // null = not owned by current user
  status: PondStatus;
}

export interface HarvestReadiness {
  id: string;
  type: "salinity" | "rainfall" | "temperature";
  level: "good" | "moderate" | "concern";
}

// 4×3 pond grid — landowner_001 owns 5 ponds
export const MOCK_POND_GRID: Pond[] = [
  // Row 0
  { id: "A1", label: "A1", row: 0, col: 0, ownerId: "landowner_001", status: "ready" },
  { id: "A2", label: "A2", row: 0, col: 1, ownerId: "landowner_001", status: "growing" },
  { id: "A3", label: "A3", row: 0, col: 2, ownerId: null, status: "idle" },
  { id: "A4", label: "A4", row: 0, col: 3, ownerId: null, status: "idle" },

  // Row 1
  { id: "B1", label: "B1", row: 1, col: 0, ownerId: "landowner_001", status: "ready" },
  { id: "B2", label: "B2", row: 1, col: 1, ownerId: null, status: "growing" },
  { id: "B3", label: "B3", row: 1, col: 2, ownerId: null, status: "flooded" },
  { id: "B4", label: "B4", row: 1, col: 3, ownerId: "landowner_001", status: "growing" },

  // Row 2
  { id: "C1", label: "C1", row: 2, col: 0, ownerId: null, status: "idle" },
  { id: "C2", label: "C2", row: 2, col: 1, ownerId: "landowner_001", status: "ready" },
  { id: "C3", label: "C3", row: 2, col: 2, ownerId: null, status: "ready" },
  { id: "C4", label: "C4", row: 2, col: 3, ownerId: null, status: "growing" },
];

export const MOCK_HARVEST_READINESS: HarvestReadiness[] = [
  { id: "salinity", type: "salinity", level: "good" },
  { id: "rainfall", type: "rainfall", level: "good" },
  { id: "temperature", type: "temperature", level: "moderate" },
];
