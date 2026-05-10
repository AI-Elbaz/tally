import {TrendingDown, TrendingUp, Minus, Activity} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import type {Ticker} from "@/types";
import {ChartDrawer} from "./chart-drawer";
import {calculateTickerMetrics, getRateExplanation} from "@/utils";
import {Tooltip, TooltipTrigger, TooltipContent} from "./ui/tooltip";
import {cn} from "@/lib/utils";

export function TickerCard({ticker}: {ticker: Ticker}) {
  const {key, label, current, previous} = ticker;
  const {diff, pct, isUp, isDown, isFlat, rates} = calculateTickerMetrics(
    current,
    previous,
    label,
  );

  return (
    <ChartDrawer period={key}>
      <Card className="cursor-pointer active:scale-[0.98] transition-all duration-200 select-none size-full border-border/50 hover:border-foreground/20 relative overflow-hidden">
        <CardContent className="h-full w-full relative group flex flex-col justify-between">
          <div className="flex justify-between gap-3 items-start w-full">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            <div className="flex items-center gap-1.5">
              {isFlat && <Minus size={14} className="text-muted-foreground" />}
              {isUp && <TrendingUp size={14} className="text-destructive" />}
              {isDown && (
                <TrendingDown size={14} className="text-emerald-500" />
              )}
              <span
                className={cn(
                  "text-sm font-semibold",
                  isFlat
                    ? "text-muted-foreground"
                    : isUp
                      ? "text-destructive"
                      : "text-emerald-500",
                )}>
                {isFlat
                  ? "100% of last period"
                  : `${isUp ? "+" : ""}${diff} (${isUp ? "+" : ""}${pct}%)`}
              </span>
            </div>
          </div>
          <div className="flex-1 flex min-h-30 items-center justify-center">
            <p className="text-5xl sm:text-7xl font-bold tabular-nums tracking-tight text-foreground leading-none">
              {current}
            </p>
          </div>
          <div className="flex justify-center items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-medium tabular-nums">
            {rates.map((rate, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-help border-b border-dotted border-muted-foreground/30 hover:border-foreground/50 transition-colors">
                    <Activity size={11} className="text-muted-foreground" />
                    <span
                      className={
                        i > 0
                          ? "opacity-80 text-muted-foreground"
                          : "text-foreground"
                      }>
                      {rate}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-50 text-center">
                  {getRateExplanation(label, rate)}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </CardContent>
      </Card>
    </ChartDrawer>
  );
}
