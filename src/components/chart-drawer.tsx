import React, {useMemo} from "react";
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
import {AspectRatio} from "@/components/ui/aspect-ratio";
import {useStore} from "../store";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import type {EventType} from "@/types";
import type {PeriodKey} from "@/configs";

const PERIOD_CONFIG = {
  daily: {
    label: "Daily view",
    subtitle: "Last 30 days",
    periodLabel: "day",
    getBuckets: () => {
      const today = new Date();
      return Array.from({length: 30}, (_, i) => {
        const day = subDays(today, 29 - i);
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
    subtitle: "Last 24 weeks",
    periodLabel: "week",
    getBuckets: () => {
      const today = new Date();
      return Array.from({length: 24}, (_, i) => {
        const week = subWeeks(today, 23 - i);
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
    subtitle: "Last 24 months",
    periodLabel: "month",
    getBuckets: () => {
      const today = new Date();
      return Array.from({length: 24}, (_, i) => {
        const month = subMonths(today, 23 - i);
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
    subtitle: "Last 10 years",
    periodLabel: "year",
    getBuckets: () => {
      const today = new Date();
      return Array.from({length: 10}, (_, i) => {
        const year = subYears(today, 9 - i);
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
  periodLabel,
}: {
  chartData: Record<string, string | number>[];
  eventTypes: EventType[];
  periodLabel: string;
}) {
  const stats = useMemo(() => {
    return eventTypes.map(t => {
      const counts = chartData.map(row => Number(row[`${t.id}_count`]) || 0);
      const total = counts.reduce((a, b) => a + b, 0);
      const avg = total / (counts.length || 1);
      const max = Math.max(...counts);
      return {type: t, total, avg, max};
    });
  }, [chartData, eventTypes]);

  return (
    <div className="flex gap-3 px-6 flex-wrap">
      {stats.map(({type, total, avg, max}) => (
        <div
          key={type.id}
          className="flex-1 min-w-28 rounded-lg border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-1.5 mb-2">
            <div
              className="h-2 w-2 rounded-full shrink-0"
              style={{backgroundColor: type.color}}
            />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
              {type.label}
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <div>
              <p className="text-2xl font-bold tabular-nums text-foreground leading-none">
                {total}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">total</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-lg font-semibold tabular-nums text-foreground leading-none">
                {avg.toFixed(1)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                per {periodLabel}
              </p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-lg font-semibold tabular-nums text-foreground leading-none">
                {max}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">peak</p>
            </div>
          </div>
        </div>
      ))}
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
    <div className="w-full px-4">
      <AspectRatio ratio={16 / 9} className="w-full">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ComposedChart
            accessibilityLayer
            data={chartData}
            margin={{top: 20, right: 0, left: -20, bottom: 0}}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="4 4"
              className="stroke-muted"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              className="text-[10px] text-muted-foreground"
              interval="preserveStartEnd"
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
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
                  stroke={`var(--color-${t.id})`}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={false}
                  isAnimationActive={false}
                />
                <ReferenceLine
                  y={periodAverages[t.id]}
                  stroke={`var(--color-${t.id})`}
                  strokeDasharray="3 3"
                  strokeOpacity={0.4}
                />
              </React.Fragment>
            ))}
          </ComposedChart>
        </ChartContainer>
      </AspectRatio>
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

  const chartData = useMemo(() => {
    if (!config) return [];
    const buckets = config.getBuckets();

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
  }, [config, events, eventTypes]);

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

  if (!config) return null;

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="pb-10 max-w-5xl mx-auto focus-visible:outline-none">
        <DrawerHeader className="mb-3 px-6">
          <DrawerTitle className="text-2xl">{config.label}</DrawerTitle>
          <p className="text-muted-foreground text-sm">{config.subtitle}</p>
        </DrawerHeader>
        <SummaryStats
          chartData={chartData}
          eventTypes={eventTypes}
          periodLabel={config.periodLabel}
        />
        <ChartContent
          chartData={chartData}
          eventTypes={eventTypes}
          periodAverages={periodAverages}
        />
      </DrawerContent>
    </Drawer>
  );
}
