export interface PricePoint {
  month: string;
  price: number;
}

export interface DemandPoint {
  month: string;
  demand: number; // 0-100 scale
}

export const PRICE_DATA: PricePoint[] = [
  { month: "Jan", price: 1650 },
  { month: "Feb", price: 1720 },
  { month: "Mar", price: 1850 }, // Current
  { month: "Apr", price: 1980 },
  { month: "May", price: 2150 },
  { month: "Jun", price: 2050 },
];

export const DEMAND_DATA: DemandPoint[] = [
  { month: "Jan", demand: 45 },
  { month: "Feb", demand: 60 },
  { month: "Mar", demand: 85 }, // Current peak
  { month: "Apr", demand: 95 },
  { month: "May", demand: 80 },
  { month: "Jun", demand: 65 },
];

export const INSIGHTS = {
  price: "Prices are climbing — expected to peak in May at ~Rs. 2,150",
  demand: "High buyer interest right now — good time for quick sales",
  production: "Regional production is down 15% — your stock is more valuable",
  recommendation: "Hold for 4-6 weeks for best profit",
};
