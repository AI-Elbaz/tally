import React, {useState, useMemo, useCallback} from "react";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  format,
  isWithinInterval,
  parseISO,
  min,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
} from "date-fns";
import {
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
  Line,
  ComposedChart,
  type TooltipContentProps,
} from "recharts";

import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

import {ChartContainer, ChartTooltip} from "@/components/ui/chart";
import {useStore} from "../store";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import {Button} from "@/components/ui/button";
import {ChevronLeft, Undo2} from "lucide-react";
import type {EventType} from "@/types";
import type {PeriodKey} from "@/configs";

type BucketConfig = {
  label: string;
  periodLabel: string;
  loadStep: number;
  initialLength: number;
  getBuckets: (count: number) => Array<{
    label: string;
    start: Date;
    end: Date;
  }>;
};

const PERIOD_CONFIG: Record<PeriodKey, BucketConfig> = {
  daily: {
    label: "Daily view",
    periodLabel: "day",
    loadStep: 30,
    initialLength: 7,
    getBuckets: (count: number) => {
      const today = new Date();
      return Array.from({length: count}, (_, i) => {
        const day = subDays(today, count - 1 - i);
        return {
          label: format(day, "MMM d"),
          start: startOfDay(day),
          end: endOfDay(day),
        };
      });
    },
  },
  weekly: {
    label: "Weekly view",
    periodLabel: "week",
    loadStep: 12,
    initialLength: 4,
    getBuckets: (count: number) => {
      const today = new Date();
      return Array.from({length: count}, (_, i) => {
        const week = subWeeks(today, count - 1 - i);
        const start = startOfWeek(week, {weekStartsOn: 6});
        return {
          label: format(start, "MMM d"),
          start,
          end: endOfWeek(week, {weekStartsOn: 6}),
        };
      });
    },
  },
  monthly: {
    label: "Monthly view",
    periodLabel: "month",
    loadStep: 12,
    initialLength: 6,
    getBuckets: (count: number) => {
      const today = new Date();
      return Array.from({length: count}, (_, i) => {
        const month = subMonths(today, count - 1 - i);
        return {
          label: format(month, "MMM yy"),
          start: startOfMonth(month),
          end: endOfMonth(month),
        };
      });
    },
  },
  yearly: {
    label: "Yearly view",
    periodLabel: "year",
    loadStep: 5,
    initialLength: 2,
    getBuckets: (count: number) => {
      const today = new Date();
      return Array.from({length: count}, (_, i) => {
        const year = subYears(today, count - 1 - i);
        return {
          label: format(year, "yyyy"),
          start: startOfYear(year),
          end: endOfYear(year),
        };
      });
    },
  },
};

const CustomTooltipContent = ({
  active,
  payload,
  label,
}: TooltipContentProps<ValueType, NameType>) => {
  if (!active || !payload?.length) return null;

  const counts = payload.filter(p => p.dataKey?.toString().endsWith("_count"));
  const averages = payload.filter(p => p.dataKey?.toString().endsWith("_avg"));

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md min-w-36">
      <p className="text-[11px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
        {label}
      </p>
      <div className="space-y-1.5">
        {counts.map((entry, index) => (
          <div
            key={`count-${index}`}
            className="flex items-center justify-between gap-6 text-xs">
            <div className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-sm shrink-0"
                style={{backgroundColor: entry.color}}
              />
              <span className="text-muted-foreground">{entry.name}</span>
            </div>
            <span className="font-semibold tabular-nums text-foreground">
              {entry.value}
            </span>
          </div>
        ))}

        {averages.length > 0 && (
          <div className="pt-1.5 mt-0.5 border-t border-dashed border-border">
            <p className="text-[10px] text-muted-foreground/70 mb-1 uppercase tracking-wide">
              7-period avg
            </p>
            {averages.map((entry, index) => (
              <div
                key={`avg-${index}`}
                className="flex items-center justify-between gap-6 text-xs">
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-px w-3 shrink-0"
                    style={{backgroundColor: entry.color}}
                  />
                  <span className="text-muted-foreground/70">
                    {entry.name?.toString().replace(" (Avg)", "")}
                  </span>
                </div>
                <span className="tabular-nums text-muted-foreground/70">
                  {typeof entry.value === "number"
                    ? entry.value.toFixed(1)
                    : entry.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function SummaryStats({
  chartData,
  eventTypes,
}: {
  chartData: Record<string, string | number>[];
  eventTypes: EventType[];
}) {
  const stats = useMemo(() => {
    return eventTypes.map(t => {
      const counts = chartData.map(row => Number(row[`${t.id}_count`]) || 0);
      const total = counts.reduce((a, b) => a + b, 0);
      const avg = total / (counts.length || 1);
      const maxVal = Math.max(...counts);
      return {type: t, total, avg, max: maxVal};
    });
  }, [chartData, eventTypes]);

  return (
    <div className="grid grid-cols-2 gap-2 px-4 w-full">
      {stats.map(({type, total, avg, max}) => (
        <div
          key={type.id}
          className="flex-1 min-w-0 rounded-lg border bg-muted/30 px-3 py-2">
          <div className="flex items-center gap-1.5 mb-1">
            <div
              className="h-2 w-2 rounded-full shrink-0"
              style={{backgroundColor: type.color}}
            />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide truncate">
              {type.label}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div>
              <p className="text-lg font-bold tabular-nums text-foreground leading-none">
                {total}
              </p>
              <p className="text-[9px] text-muted-foreground mt-0.5">total</p>
            </div>
            <div className="h-6 w-px bg-border shrink-0" />
            <div>
              <p className="text-sm font-semibold tabular-nums text-foreground leading-none">
                {avg.toFixed(1)}
              </p>
              <p className="text-[9px] text-muted-foreground mt-0.5">avg</p>
            </div>
            <div className="h-6 w-px bg-border shrink-0" />
            <div>
              <p className="text-sm font-semibold tabular-nums text-foreground leading-none">
                {max}
              </p>
              <p className="text-[9px] text-muted-foreground mt-0.5">peak</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// New Component for All Events Stats
function AllEventsStats({
  chartData,
  eventTypes,
}: {
  chartData: Record<string, string | number>[];
  eventTypes: EventType[];
}) {
  const stats = useMemo(() => {
    // Calculate total events per bucket (row) across all types
    const totalEventsPerBucket = chartData.map(row => {
      return eventTypes.reduce(
        (sum, t) => sum + (Number(row[`${t.id}_count`]) || 0),
        0,
      );
    });

    const total = totalEventsPerBucket.reduce((a, b) => a + b, 0);
    const avg = total / (totalEventsPerBucket.length || 1);
    const max = Math.max(...totalEventsPerBucket, 0);

    return {total, avg, max};
  }, [chartData, eventTypes]);

  return (
    <div className="col-span-2 rounded-lg border bg-muted/30 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-muted-foreground/50" />
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
          All Events
        </span>
      </div>

      <div className="flex items-baseline gap-4">
        <div className="text-right">
          <p className="text-lg font-bold tabular-nums text-foreground leading-none">
            {stats.total}
          </p>
          <p className="text-[9px] text-muted-foreground mt-0.5">total</p>
        </div>
        <div className="h-6 w-px bg-border shrink-0" />
        <div className="text-right">
          <p className="text-sm font-semibold tabular-nums text-foreground leading-none">
            {stats.avg.toFixed(1)}
          </p>
          <p className="text-[9px] text-muted-foreground mt-0.5">avg</p>
        </div>
        <div className="h-6 w-px bg-border shrink-0" />
        <div className="text-right">
          <p className="text-sm font-semibold tabular-nums text-foreground leading-none">
            {stats.max}
          </p>
          <p className="text-[9px] text-muted-foreground mt-0.5">peak</p>
        </div>
      </div>
    </div>
  );
}

function ChartContent({
  chartData,
  eventTypes,
  periodAverages,
}: {
  chartData: Record<string, string | number>[];
  eventTypes: EventType[];
  periodAverages: Record<string, number>;
}) {
  const chartConfig = Object.fromEntries(
    eventTypes.map(t => [t.id, {label: t.label, color: t.color}]),
  );

  return (
    <div className="w-full -mx-4 sm:mx-0 sm:px-4 pb-4">
      <ChartContainer config={chartConfig} className="w-full h-full p-0">
        <ComposedChart
          accessibilityLayer
          data={chartData}
          // left: -10 pulls chart behind the Y axis to remove whitespace
          margin={{top: 10, right: 0, left: -10, bottom: 0}}>
          <CartesianGrid
            vertical={false}
            strokeDasharray="4 4"
            className="stroke-muted"
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className="text-[10px] text-muted-foreground"
            interval="preserveStartEnd"
          />

          <YAxis
            // Keep the axis visible
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            className="text-[10px] text-muted-foreground"
          />

          <ChartTooltip
            cursor={{fill: "hsl(var(--muted))", fillOpacity: 0.1}}
            content={CustomTooltipContent}
          />

          {eventTypes.map(t => (
            <React.Fragment key={t.id}>
              <Bar
                name={t.label}
                dataKey={`${t.id}_count`}
                stackId="a"
                fill={`var(--color-${t.id})`}
                fillOpacity={0.8}
                maxBarSize={40}
              />
              <Line
                name={`${t.label} (Avg)`}
                dataKey={`${t.id}_avg`}
                stroke={`var(--color-${t.id})}`}
                strokeWidth={1.5}
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
              <ReferenceLine
                y={periodAverages[t.id]}
                stroke={`var(--color-${t.id})}`}
                strokeDasharray="3 3"
                strokeOpacity={0.4}
              />
            </React.Fragment>
          ))}
        </ComposedChart>
      </ChartContainer>
    </div>
  );
}

export function ChartDrawer({
  period,
  children,
}: {
  period: PeriodKey;
  children: React.ReactNode;
}) {
  const events = useStore(s => s.events);
  const eventTypes = useStore(s => s.eventTypes);
  const config = PERIOD_CONFIG[period];

  const [visibleCount, setVisibleCount] = useState<number>(
    config?.initialLength || 7,
  );

  const maxPossibleCount = useMemo(() => {
    if (events.length === 0) return config?.initialLength || 7;

    const dates = events
      .map(e => {
        try {
          return parseISO(e.datetime);
        } catch {
          return null;
        }
      })
      .filter((d): d is Date => d !== null && !isNaN(d.getTime()));

    if (dates.length === 0) return config?.initialLength || 7;

    const oldestDate = min(dates);
    const today = new Date();

    switch (period) {
      case "daily":
        return differenceInDays(today, oldestDate) + 1;
      case "weekly":
        return differenceInWeeks(today, oldestDate) + 1;
      case "monthly":
        return differenceInMonths(today, oldestDate) + 1;
      case "yearly":
        return differenceInYears(today, oldestDate) + 1;
      default:
        return config?.initialLength || 7;
    }
  }, [events, period, config]);

  const buckets = useMemo(() => {
    if (!config) return [];
    return config.getBuckets(visibleCount);
  }, [config, visibleCount]);

  const chartData = useMemo(() => {
    if (buckets.length === 0) return [];

    return buckets.map((bucket, index) => {
      const row: Record<string, string | number> = {label: bucket.label};

      eventTypes.forEach(t => {
        const count = events.filter(e => {
          try {
            return (
              e.type === t.id &&
              isWithinInterval(parseISO(e.datetime), {
                start: bucket.start,
                end: bucket.end,
              })
            );
          } catch {
            return false;
          }
        }).length;
        row[`${t.id}_count`] = count;
      });

      eventTypes.forEach(t => {
        let sum = 0;
        let validPoints = 0;
        const windowSize = 7;

        for (let w = 0; w < windowSize; w++) {
          const targetIndex = index - w;
          if (targetIndex >= 0) {
            const targetBucket = buckets[targetIndex];
            const wCount = events.filter(e => {
              try {
                return (
                  e.type === t.id &&
                  isWithinInterval(parseISO(e.datetime), {
                    start: targetBucket.start,
                    end: targetBucket.end,
                  })
                );
              } catch {
                return false;
              }
            }).length;

            sum += wCount;
            validPoints++;
          }
        }

        row[`${t.id}_avg`] = validPoints > 0 ? sum / validPoints : 0;
      });

      return row;
    });
  }, [buckets, events, eventTypes]);

  const periodAverages = useMemo(() => {
    const avgs: Record<string, number> = {};
    eventTypes.forEach(t => {
      const total = chartData.reduce(
        (sum, row) => sum + (Number(row[`${t.id}_count`]) || 0),
        0,
      );
      avgs[t.id] = total / (chartData.length || 1);
    });
    return avgs;
  }, [chartData, eventTypes]);

  const handleLoadMore = useCallback(() => {
    if (!config) return;
    setVisibleCount(prev => {
      const next = prev + config.loadStep;
      return Math.min(next, maxPossibleCount);
    });
  }, [config, maxPossibleCount]);

  const handleReset = useCallback(() => {
    if (config) setVisibleCount(config.initialLength);
  }, [config]);

  if (!config) return null;

  const canLoadMore = visibleCount < maxPossibleCount;
  const isZoomedOut = visibleCount > config.initialLength;

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="pb-8 w-full max-w-5xl mx-auto focus-visible:outline-none overflow-y-hidden rounded-t-2xl">
        <div className="overflow-y-auto h-full space-y-4">
          <DrawerHeader className="px-4 py-2 space-y-2">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex flex-col gap-2 mb-0.5">
                <DrawerTitle className="text-lg text-left font-semibold truncate">
                  {config.label}
                </DrawerTitle>
                <DrawerDescription className="text-left">
                  Showing last {visibleCount} {config.periodLabel}
                  {visibleCount > 1 ? "s" : ""}
                  {maxPossibleCount > visibleCount &&
                    ` (of ${maxPossibleCount} total)`}
                </DrawerDescription>
              </div>

              <div className="flex flex-row gap-2 items-center justify-end">
                {isZoomedOut && (
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <Undo2 />
                    Reset
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canLoadMore}
                  onClick={handleLoadMore}>
                  <ChevronLeft />
                  Load More
                </Button>
              </div>
            </div>
          </DrawerHeader>

          <div className="grid grid-cols-2 gap-2 px-4 w-full">
            <AllEventsStats chartData={chartData} eventTypes={eventTypes} />
          </div>

          <SummaryStats chartData={chartData} eventTypes={eventTypes} />

          <ChartContent
            chartData={chartData}
            eventTypes={eventTypes}
            periodAverages={periodAverages}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
