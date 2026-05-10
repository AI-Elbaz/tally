import {useMemo} from "react";
import {useStore} from "./store";

import {ThemeDrawer} from "./components/theme-drawer";
import {TickerCard} from "./components/ticker-card";
import {PERIODS} from "./configs";
import {calculateOverallHealth, countInRange} from "./utils";
import {ManageEventsDrawer} from "./components/manage-events-drawer";
import {AddEventDrawer} from "./components/add-event-drawer";

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
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="flex flex-col mx-auto w-full justify-between gap-10 max-w-4xl px-4 sm:px-6 lg:px-8 pt-12 pb-12">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Tally</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track events, not streaks.
            </p>
          </div>
          <div className="flex gap-2">
            <ManageEventsDrawer />
            <ThemeDrawer />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <div
            className={`mb-3 px-3 py-1 rounded-full border border-current bg-muted/30 text-[10px] font-bold uppercase tracking-[0.2em] ${health.color}`}>
            {health.label}
          </div>
          <div className="flex items-baseline justify-center gap-1.5 tabular-nums">
            <span
              className={`text-7xl sm:text-8xl font-bold tracking-tighter leading-none ${health.color}`}>
              {health.score}
            </span>
            <span className="text-muted-foreground/50 text-xl font-medium">
              /100
            </span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3 justify-center items-center w-full h-full">
          {tickers.map(t => (
            <TickerCard key={t.key} ticker={t} />
          ))}
        </div>

        <AddEventDrawer />
      </div>
    </div>
  );
}
