import type {PeriodKey} from "./configs";

export type Ticker = {
  key: PeriodKey;
  label: string;
  current: number;
  previous: number;
};

export type EventType = {
  id: string;
  label: string;
  color: string;
};

export type Event = {
  id: string;
  type: string;
  datetime: string;
  description?: string;
  createdAt: string;
};

export interface TickerMetrics {
  diff: number;
  pct: number;
  isUp: boolean;
  isDown: boolean;
  isFlat: boolean;
  rates: string[];
}

export interface OverallHealth {
  score: number;
  color: string;
  label: string;
}
