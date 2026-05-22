import {useMemo} from "react";
import {useStore} from "./store";

import {ThemeDrawer} from "./components/theme-drawer";
import {TickerCard} from "./components/ticker-card";
import {PERIODS} from "./configs";
import {calculateOverallHealth, countInRange} from "./utils";
import {ManageEventsDrawer} from "./components/manage-events-drawer";
import {AddEventDrawer} from "./components/add-event-drawer";
import {EventsLogDrawer} from "./components/events-log-drawer";
import {cn} from "./lib/utils";

export default function App() {
  const events = useStore(s => s.events);

  const tickers = useMemo(
    () =>
      PERIODS.map(p => ({
        ...p,
        current: countInRange(events, p.current().start, p.current().end),
        previous: countInRange(events, p.previous().start, p.previous().end),
      })),
    [events],
  );

  const health = useMemo(() => calculateOverallHealth(tickers), [tickers]);

  return (
    <div className="h-screen flex flex-col max-w-2xl mx-auto w-full justify-between gap-5 px-2.5 pb-8 sm:px-5">
      <div className="flex items-end justify-between bg-card p-3 rounded-b-3xl">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tally</h1>
          <p className="text-xs sm:text-sm leading-3 text-muted-foreground">
            Track events, not streaks.
          </p>
        </div>
        <div className="flex gap-2">
          <EventsLogDrawer />
          <ManageEventsDrawer />
          <ThemeDrawer />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center text-center">
        <div
          className={cn(
            "mb-1 px-3 py-1 rounded-full border-2 border-current bg-muted/30 text-[10px] font-bold uppercase tracking-[0.2em]",
            health.color,
          )}>
          {health.label}
        </div>
        <div className="flex items-baseline justify-center gap-1.5 tabular-nums">
          <span
            className={`text-6xl sm:text-7xl font-bold tracking-tighter leading-none ${health.color}`}>
            {health.score}
          </span>
          <span className="text-muted-foreground/50 text-xl font-medium">
            /100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 md:gap-3">
        {tickers.map(t => (
          <TickerCard key={t.key} ticker={t} />
        ))}
      </div>

      <AddEventDrawer />
    </div>
  );
}
