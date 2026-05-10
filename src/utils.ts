import {isWithinInterval, parseISO, startOfYear} from "date-fns";
import type {Event, OverallHealth, TickerMetrics} from "./types";

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
  const now = new Date();
  const labelLower = label.toLowerCase();
  let divisor = 1;

  if (labelLower.includes("week")) divisor = Math.max(1, now.getDay() || 7);
  else if (labelLower.includes("month")) divisor = Math.max(1, now.getDate());
  else if (labelLower.includes("year")) {
    const start = startOfYear(now);
    const diffTime = now.getTime() - start.getTime();
    divisor = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  } else {
    rates.push("Today");
    return {diff, pct, isUp, isDown, isFlat, rates};
  }

  const dailyRate = current / divisor;

  if (labelLower.includes("week")) {
    rates.push(`${dailyRate.toFixed(1)} / day`);
  } else if (labelLower.includes("month")) {
    rates.push(
      `${dailyRate.toFixed(1)} / day`,
      `${(current / 4).toFixed(1)} / wk`,
    );
  } else if (labelLower.includes("year")) {
    rates.push(
      `${dailyRate.toFixed(2)} / day`,
      `${(current / 52).toFixed(1)} / wk`,
      `${(current / 12).toFixed(1)} / mo`,
    );
  }

  return {diff, pct, isUp, isDown, isFlat, rates};
}

export function calculateOverallHealth(tickers: any[]): OverallHealth {
  let totalDailyRate = 0;
  let count = 0;

  tickers.forEach(ticker => {
    const {current, label} = ticker;
    const now = new Date();
    let divisor = 1;
    const labelLower = label.toLowerCase();

    if (labelLower.includes("week")) divisor = Math.max(1, now.getDay() || 7);
    else if (labelLower.includes("month")) divisor = Math.max(1, now.getDate());
    else if (labelLower.includes("year")) {
      const start = startOfYear(now);
      const diffTime = now.getTime() - start.getTime();
      divisor = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    } else {
      return; // Skip 'Today' for overall score to keep it consistent
    }

    // We weight Week and Month x2 because recent behavior matters more
    const weight =
      labelLower.includes("week") || labelLower.includes("month") ? 2 : 1;

    totalDailyRate += (current / divisor) * weight;
    count += weight;
  });

  const averageDailyRate = count > 0 ? totalDailyRate / count : 0;

  // SCORING LOGIC
  // 0.0 = 100
  // 0.2 = 95
  // 0.5 = 80
  // 1.0 = 50
  // 2.0 = 0

  let score = 0;
  let color = "text-emerald-500";
  let label = "Perfect";

  if (averageDailyRate === 0) {
    score = 100;
    color = "text-emerald-500";
    label = "Perfect";
  } else if (averageDailyRate < 0.2) {
    score = 95;
    color = "text-emerald-500";
    label = "Excellent";
  } else if (averageDailyRate < 0.5) {
    score = 80;
    color = "text-yellow-500";
    label = "Good";
  } else if (averageDailyRate < 1.0) {
    score = 60;
    color = "text-orange-500";
    label = "Fair";
  } else if (averageDailyRate < 2.0) {
    score = 30;
    color = "text-red-500";
    label = "Poor";
  } else {
    score = 0;
    color = "text-destructive"; // Deep Red
    label = "Critical";
  }

  return {score, color, label};
}

export function getRateExplanation(label: string, rate: string) {
  const lowerLabel = label.toLowerCase();

  if (lowerLabel.includes("week")) {
    return "Average events per day so far this week.";
  }

  if (lowerLabel.includes("month")) {
    if (rate.includes("/ day")) return "Daily average (Total / Days passed).";
    if (rate.includes("/ wk")) return "Weekly average (Total / 4).";
  }

  if (lowerLabel.includes("year")) {
    if (rate.includes("/ day")) return "Daily average for the year so far.";
    if (rate.includes("/ wk")) return "Weekly average (Total / 52).";
    if (rate.includes("/ mo")) return "Monthly average (Total / 12).";
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
