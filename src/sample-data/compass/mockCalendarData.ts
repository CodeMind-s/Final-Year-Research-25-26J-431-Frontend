// Mock calendar data for the harvest calendar view
// Generates day-by-day weather and harvest condition data

export type WeatherType = "sunny" | "cloudy" | "rainy";
export type DayCondition = "ideal" | "moderate" | "poor" | "rest";

export interface CalendarDay {
  date: string; // ISO date YYYY-MM-DD
  dayOfMonth: number;
  weather: WeatherType;
  condition: DayCondition;
  note?: string; // optional note shown on tap
}

/**
 * Generate mock calendar data starting from a given date,
 * for a given duration (30, 45, or 60 days).
 */
export function generateMockCalendar(
  startDate: string,
  durationDays: number
): CalendarDay[] {
  const start = new Date(startDate);
  const days: CalendarDay[] = [];

  // Pseudo-random but deterministic pattern for demo purposes
  const weatherPattern: WeatherType[] = [
    "sunny", "sunny", "sunny", "cloudy", "sunny", "sunny", "cloudy",
    "sunny", "sunny", "rainy", "cloudy", "sunny", "sunny", "sunny",
    "cloudy", "rainy", "rainy", "cloudy", "sunny", "sunny", "sunny",
    "sunny", "sunny", "cloudy", "sunny", "sunny", "sunny", "sunny",
    "cloudy", "sunny", "sunny", "sunny", "rainy", "cloudy", "sunny",
    "sunny", "sunny", "sunny", "cloudy", "sunny", "sunny", "sunny",
    "sunny", "rainy", "cloudy", "sunny", "sunny", "sunny", "sunny",
    "sunny", "cloudy", "sunny", "sunny", "sunny", "sunny", "rainy",
    "cloudy", "sunny", "sunny", "sunny",
  ];

  const conditionPattern: DayCondition[] = [
    "ideal", "ideal", "ideal", "moderate", "ideal", "ideal", "moderate",
    "ideal", "ideal", "poor", "moderate", "ideal", "ideal", "ideal",
    "moderate", "poor", "poor", "moderate", "ideal", "ideal", "ideal",
    "ideal", "ideal", "moderate", "ideal", "ideal", "ideal", "ideal",
    "moderate", "ideal", "rest", "ideal", "poor", "moderate", "ideal",
    "ideal", "ideal", "ideal", "moderate", "ideal", "ideal", "ideal",
    "ideal", "poor", "moderate", "ideal", "ideal", "ideal", "ideal",
    "rest", "moderate", "ideal", "ideal", "ideal", "ideal", "poor",
    "moderate", "ideal", "ideal", "ideal",
  ];

  const notes: Record<string, string> = {
    ideal: "Great day for salt work",
    moderate: "Proceed with caution",
    poor: "Not suitable for harvesting",
    rest: "Scheduled rest day",
  };

  for (let i = 0; i < durationDays; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);

    const weather = weatherPattern[i % weatherPattern.length];
    const condition = conditionPattern[i % conditionPattern.length];

    days.push({
      date: current.toISOString().split("T")[0],
      dayOfMonth: current.getDate(),
      weather,
      condition,
      note: notes[condition],
    });
  }

  return days;
}
