import {useMemo} from "react";
import {Trash2, Calendar} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import {Button} from "./ui/button";
import {useStore} from "../store";

export function EventsLogDrawer() {
  const {events, removeEvent, eventTypes} = useStore();

  const eventsByDay = useMemo(() => {
    // Group events by day
    const grouped: Record<string, typeof events> = {};

    events.forEach(event => {
      const date = new Date(event.datetime);
      const dayKey = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(event);
    });

    // Sort days in descending order (newest first) and sort events within each day
    const sorted = Object.entries(grouped).sort(([a], [b]) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });

    return sorted.map(([day, dayEvents]) => ({
      day,
      events: dayEvents.sort(
        (a, b) =>
          new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
      ),
    }));
  }, [events]);

  const getEventTypeColor = (typeId: string) => {
    return eventTypes.find(t => t.id === typeId)?.color || "#666666";
  };

  const getEventTypeLabel = (typeId: string) => {
    return eventTypes.find(t => t.id === typeId)?.label || typeId;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isYesterday = (date: Date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return "Today";
    } else if (isYesterday(date)) {
      return "Yesterday";
    }
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRelativeTime = (datetime: string) => {
    const date = new Date(datetime);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl"
          aria-label="View all events">
          <Calendar size={16} />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-w-md mx-auto">
        <DrawerHeader>
          <DrawerTitle>Events Log</DrawerTitle>
          <p className="text-sm text-muted-foreground">
            {events.length} total event{events.length !== 1 ? "s" : ""}
          </p>
        </DrawerHeader>

        <div className="p-4 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          {eventsByDay.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No events logged yet. Start tracking!
              </p>
            </div>
          ) : (
            eventsByDay.map(({day, events: dayEvents}) => (
              <div key={day} className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {formatDate(day)}
                </h3>
                <div className="flex flex-col gap-2">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-muted/50 bg-muted hover:bg-muted/70 transition-colors">
                      <div
                        className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                        style={{backgroundColor: getEventTypeColor(event.type)}}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-sm font-medium">
                            {getEventTypeLabel(event.type)}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                            <span>{formatTime(event.datetime)}</span>
                            {isToday(new Date(day)) && (
                              <span className="text-muted-foreground/60">
                                • {getRelativeTime(event.datetime)}
                              </span>
                            )}
                          </div>
                        </div>
                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeEvent(event.id)}
                        className="flex-shrink-0 p-1.5 hover:bg-destructive/20 rounded transition-colors"
                        aria-label="Delete event">
                        <Trash2 size={14} className="text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
