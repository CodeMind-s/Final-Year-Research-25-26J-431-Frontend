/**
 * Time-based greeting utility
 * Returns appropriate greeting based on current time of day
 */

export function getTimeBasedGreeting(): {
  key: string;
  period: 'morning' | 'afternoon' | 'evening';
} {
  const hour = new Date().getHours();

  if (hour < 12) {
    return {
      key: 'home.goodMorning',
      period: 'morning',
    };
  } else if (hour < 18) {
    return {
      key: 'home.goodAfternoon',
      period: 'afternoon',
    };
  } else {
    return {
      key: 'home.goodEvening',
      period: 'evening',
    };
  }
}

/**
 * Get time period for weather icon selection
 */
export function getTimePeriod(): 'day' | 'night' {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'day' : 'night';
}
