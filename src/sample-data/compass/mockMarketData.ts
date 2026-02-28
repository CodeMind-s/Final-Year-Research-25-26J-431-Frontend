// ─── Price / Demand chart data ────────────────────────────────────

export interface PricePoint {
  month: string;
  price: number;
  isForecast?: boolean;
}

export interface DemandPoint {
  month: string;
  demand: number;
  isForecast?: boolean;
}

// Today = Feb 2026. Last 6 months: Sep–Feb. Current: Feb. Next 6: Mar–Aug.
export const PRICE_DATA: PricePoint[] = [
  { month: "Sep",  price: 1480 },
  { month: "Oct",  price: 1520 },
  { month: "Nov",  price: 1590 },
  { month: "Dec",  price: 1640 },
  { month: "Jan",  price: 1720 },
  { month: "Feb",  price: 1850 },   // now
  { month: "Mar",  price: 1920,  isForecast: true },
  { month: "Apr",  price: 2010,  isForecast: true },
  { month: "May",  price: 2150,  isForecast: true },
  { month: "Jun",  price: 2080,  isForecast: true },
  { month: "Jul",  price: 1980,  isForecast: true },
  { month: "Aug",  price: 1860,  isForecast: true },
];

export const DEMAND_DATA: DemandPoint[] = [
  { month: "Sep",  demand: 38 },
  { month: "Oct",  demand: 45 },
  { month: "Nov",  demand: 52 },
  { month: "Dec",  demand: 60 },
  { month: "Jan",  demand: 72 },
  { month: "Feb",  demand: 85 },    // now
  { month: "Mar",  demand: 90,  isForecast: true },
  { month: "Apr",  demand: 95,  isForecast: true },
  { month: "May",  demand: 88,  isForecast: true },
  { month: "Jun",  demand: 75,  isForecast: true },
  { month: "Jul",  demand: 62,  isForecast: true },
  { month: "Aug",  demand: 50,  isForecast: true },
];

export const INSIGHTS = {
  price: "Prices are climbing — expected to peak in May at ~Rs. 2,150",
  demand: "High buyer interest right now — good time for quick sales",
  production: "Regional production is down 15% — your stock is more valuable",
  recommendation: "Hold for 4-6 weeks for best profit",
};

// ─── Distributors ─────────────────────────────────────────────────

export interface Distributor {
  id: string;
  name: string;
  location: string;
  offerPricePerBag: number;
  bagsNeeded: number;
  description: string;
}

export const MOCK_DISTRIBUTORS: Distributor[] = [
  {
    id: "dist-1",
    name: "Lanka Salt Limited",
    location: "Colombo",
    offerPricePerBag: 1950,
    bagsNeeded: 200,
    description: "Sri Lanka's largest salt distributor. Known for fast payment within 3 days of delivery.",
  },
  {
    id: "dist-2",
    name: "Puttalam Salt Ltd",
    location: "Puttalam",
    offerPricePerBag: 1850,
    bagsNeeded: 150,
    description: "Specialises in bulk salt from the Palavi salterns. Reliable and long-standing buyer.",
  },
  {
    id: "dist-3",
    name: "Keells Super",
    location: "Colombo",
    offerPricePerBag: 2100,
    bagsNeeded: 80,
    description: "Retail supply chain — pays a premium per bag for quality salt. Requires smaller batches.",
  },
];

// ─── Deal types ───────────────────────────────────────────────────

export type DealStatus = "DRAFT" | "PENDING" | "ACCEPTED" | "CLOSED" | "CANCELED";

export interface MarketDeal {
  id: string;
  distributorId: string;
  distributorName: string;
  distributorLocation: string;
  // Distributor's original offer
  offeredPricePerBag: number;
  offeredBagsNeeded: number;
  // Landowner's counter-request
  requestedBags: number;
  requestedPricePerBag: number;
  // Meta
  status: DealStatus;
  createdAt: number; // timestamp
  updatedAt: number;
}
