import {useMemo} from "react";
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
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
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
    subtitle: "Last 14 days",
    getBuckets: () => {
      const today = new Date();
      return Array.from({length: 14}, (_, i) => {
        const day = subDays(today, 13 - i);
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
    subtitle: "Last 12 weeks",
    getBuckets: () => {
      const today = new Date();
      return Array.from({length: 12}, (_, i) => {
        const week = subWeeks(today, 11 - i);
        const start = startOfWeek(week, {weekStartsOn: 1});
        return {
          label: format(start, "MMM d"),
          start,
          end: endOfWeek(week, {weekStartsOn: 1}),
        };
      });
    },
  },
  monthly: {
    label: "Monthly view",
    subtitle: "Last 12 months",
    getBuckets: () => {
      const today = new Date();
      return Array.from({length: 12}, (_, i) => {
        const month = subMonths(today, 11 - i);
        return {
          label: format(month, "MMM"),
          start: startOfMonth(month),
          end: endOfMonth(month),
        };
      });
    },
  },
  yearly: {
    label: "Yearly view",
    subtitle: "Last 5 years",
    getBuckets: () => {
      const today = new Date();
      return Array.from({length: 5}, (_, i) => {
        const year = subYears(today, 4 - i);
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
}: TooltipContentProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
        <p className="text-sm font-medium text-foreground mb-2 border-b pb-1">
          {payload[0]?.payload?.label}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{backgroundColor: entry.color}}
                />
                <span className="text-muted-foreground font-medium">
                  {entry.name}
                </span>
              </div>
              <span className="font-semibold tabular-nums text-foreground">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

function ChartContent({
  chartData,
  eventTypes,
}: {
  chartData: Record<string, string | number>[];
  eventTypes: EventType[];
}) {
  const chartConfig = Object.fromEntries(
    eventTypes.map(t => [
      t.id,
      {
        label: t.label,
        color: t.color,
      },
    ]),
  );

  return (
    <div className="w-full px-4">
      <AspectRatio ratio={16 / 9} className="w-full">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{top: 10, right: 0, left: -20, bottom: 0}}>
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
              className="text-xs text-muted-foreground"
              interval="preserveStartEnd"
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              className="text-xs text-muted-foreground"
            />
            <ChartTooltip
              cursor={{fill: "hsl(var(--muted))", fillOpacity: 0.3}}
              content={CustomTooltipContent}
            />
            {eventTypes.map((t, i) => (
              <Bar
                key={t.id}
                name={t.label}
                dataKey={t.id}
                stackId="a"
                fill={`var(--color-${t.id})`}
                radius={
                  i === eventTypes.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]
                }
                fillOpacity={0.9}
              />
            ))}
          </BarChart>
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
    return config.getBuckets().map(bucket => {
      const row: Record<string, string | number> = {label: bucket.label};

      eventTypes.forEach(t => {
        row[t.id] = events.filter(e => {
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
      });
      return row;
    });
  }, [config, events, eventTypes]);

  if (!config) return null;

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="pb-10 max-w-5xl mx-auto focus-visible:outline-none">
        <DrawerHeader className="mb-2 px-6">
          <DrawerTitle className="text-2xl">{config.label}</DrawerTitle>
          <p className="text-muted-foreground text-sm">{config.subtitle}</p>
        </DrawerHeader>
        <ChartContent chartData={chartData} eventTypes={eventTypes} />
      </DrawerContent>
    </Drawer>
  );
}
