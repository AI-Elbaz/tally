import {isWithinInterval, parseISO} from "date-fns";
import type {Event, OverallHealth, Ticker, TickerMetrics} from "./types";

// Controls how steeply the score falls as daily rate increases.
// At k=50: rate 0.0 → 100, rate 0.02 → 91, rate 0.1 → 67, rate 0.5 → 29
const SCORE_STEEPNESS = 50;

export function calculateTickerMetrics(
  current: number,
  previous: number,
  label: string,
): TickerMetrics {
  const diff = current - previous;
  const pct =
    previous === 0
      ? current > 0
        ? 100
        : 0
      : Math.round((diff / previous) * 100);
  const isDown = diff < 0;
  const isUp = diff > 0;
  const isFlat = diff === 0;

  const rates: string[] = [];
  const labelLower = label.toLowerCase();

  if (labelLower.includes("week")) {
    // No sub-rates for week — daily rate is the only meaningful one
    const now = new Date();
    const dayOfWeek = (now.getDay() + 1) % 7 || 7;
    const dailyRate = current / Math.max(1, dayOfWeek);
    rates.push(`${dailyRate.toFixed(1)} / day`);
  } else if (labelLower.includes("month")) {
    // Full-period divisors: always /4 weeks, /~30 days
    rates.push(
      `${(current / 30).toFixed(1)} / day`,
      `${(current / 4).toFixed(1)} / wk`,
    );
  } else if (labelLower.includes("year")) {
    // Full-period divisors: always /365 days, /52 weeks, /12 months
    rates.push(
      `${(current / 365).toFixed(2)} / day`,
      `${(current / 52).toFixed(1)} / wk`,
      `${(current / 12).toFixed(1)} / mo`,
    );
  } else {
    rates.push("Today");
  }

  return {diff, pct, isUp, isDown, isFlat, rates};
}

export function calculateOverallHealth(tickers: Ticker[]): OverallHealth {
  let totalWeightedRate = 0;
  let totalWeight = 0;

  tickers.forEach(({current, label}) => {
    const labelLower = label.toLowerCase();
    let dailyRate: number | null = null;
    let weight = 1;

    if (labelLower.includes("week")) {
      const now = new Date();
      const dayOfWeek = now.getDay() || 7;
      dailyRate = current / Math.max(1, dayOfWeek);
      weight = 2; // Recent behavior matters more
    } else if (labelLower.includes("month")) {
      dailyRate = current / 30;
      weight = 2;
    } else if (labelLower.includes("year")) {
      dailyRate = current / 365;
      weight = 1;
    }
    // "Today" tickers are skipped — a single day is too noisy for the score

    if (dailyRate !== null) {
      totalWeightedRate += dailyRate * weight;
      totalWeight += weight;
    }
  });

  const averageDailyRate =
    totalWeight > 0 ? totalWeightedRate / totalWeight : 0;

  // Smooth decay: score = 100 / (1 + k * rate)
  // Never snaps — every change in rate produces a proportional change in score
  const score = Math.round(100 / (1 + SCORE_STEEPNESS * averageDailyRate));

  const color =
    score >= 90
      ? "text-emerald-500"
      : score >= 70
        ? "text-yellow-500"
        : score >= 40
          ? "text-orange-500"
          : "text-destructive";

  const label =
    score >= 90
      ? "Excellent"
      : score >= 70
        ? "Good"
        : score >= 40
          ? "Fair"
          : "Poor";

  return {score, color, label};
}

export function getRateExplanation(label: string, rate: string) {
  const lowerLabel = label.toLowerCase();

  if (lowerLabel.includes("week")) {
    return "Daily average based on days elapsed this week.";
  }
  if (lowerLabel.includes("month")) {
    if (rate.includes("/ day")) return "Daily average (total ÷ 30).";
    if (rate.includes("/ wk")) return "Weekly average (total ÷ 4).";
  }
  if (lowerLabel.includes("year")) {
    if (rate.includes("/ day")) return "Daily average (total ÷ 365).";
    if (rate.includes("/ wk")) return "Weekly average (total ÷ 52).";
    if (rate.includes("/ mo")) return "Monthly average (total ÷ 12).";
  }

  return "Average rate.";
}

export const now = () => new Date();

export function countInRange(events: Event[], start: Date, end: Date) {
  return events.filter(e => {
    try {
      return isWithinInterval(parseISO(e.datetime), {start, end});
    } catch {
      return false;
    }
  }).length;
}
