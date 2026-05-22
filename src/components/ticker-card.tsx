import {TrendingDown, TrendingUp, Minus, Activity} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import type {Ticker} from "@/types";
import {ChartDrawer} from "./chart-drawer";
import {calculateTickerMetrics, getRateExplanation} from "@/utils";
import {Tooltip, TooltipTrigger, TooltipContent} from "@/components/ui/tooltip";
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
      <Card className="aspect-square py-2 px-1 cursor-pointer active:scale-[0.98] transition-all duration-200 select-none w-full border-border/50 hover:border-foreground/20 relative overflow-hidden">
        <CardContent className="p-0 h-full w-full relative group flex flex-col gap-4 justify-between">
          {/* Top Section */}
          <div className="px-4 sm:px-5 py-3 sm:py-4 w-full">
            <div className="flex justify-between items-start w-full gap-2">
              <p className="text-[8px] sm:text-sm font-bold text-muted-foreground uppercase tracking-wider leading-tight">
                {label}
              </p>

              <div className="flex items-center gap-1.5 shrink-0">
                {isFlat && (
                  <Minus size={12} className="text-muted-foreground" />
                )}
                {isUp && <TrendingUp size={12} className="text-destructive" />}
                {isDown && (
                  <TrendingDown size={12} className="text-emerald-500" />
                )}

                <span
                  className={cn(
                    "text-[8px] sm:text-sm font-semibold tabular-nums leading-none",
                    isFlat
                      ? "text-muted-foreground"
                      : isUp
                        ? "text-destructive"
                        : "text-emerald-500",
                  )}>
                  {isFlat ? "100%" : `${isUp ? "+" : ""}${diff} (${pct}%)`}
                </span>
              </div>
            </div>
          </div>

          {/* Middle Section */}
          <div className="flex items-center justify-center px-4">
            <p className="text-3xl sm:text-6xl font-bold tabular-nums tracking-tight text-foreground leading-none">
              {current}
            </p>
          </div>

          {/* Bottom Section */}
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex-wrap w-full flex justify-center items-center gap-3 text-[8px] sm:text-[10px] font-medium tabular-nums">
            {rates.map((rate, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-help border-b border-dotted border-muted-foreground/30 hover:border-foreground/50 transition-colors shrink-0">
                    <Activity size={10} className="text-muted-foreground" />
                    <span
                      className={cn(
                        "leading-none",
                        i > 0
                          ? "opacity-80 text-muted-foreground"
                          : "text-foreground",
                      )}>
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
