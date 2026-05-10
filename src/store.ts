import {create} from "zustand";
import {persist} from "zustand/middleware";
import type {Event, EventType} from "./types";

const DEFAULT_EVENT_TYPES = [
  {id: "1", label: "Withdrawal", color: "#eab308"}, // Yellow
  {id: "2", label: "Relapse", color: "#ef4444"}, // Red
];

type Store = {
  events: Event[];
  addEvent: (event: Pick<Event, "type" | "datetime" | "description">) => void;
  removeEvent: (id: string) => void;
  getEvents: () => Event[];
  eventTypes: EventType[];
  addEventType: (type: Pick<EventType, "label" | "color">) => void;
  removeEventType: (id: string) => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      events: [],
      eventTypes: DEFAULT_EVENT_TYPES,

      addEventType: type =>
        set(state => ({
          eventTypes: [
            ...state.eventTypes,
            {
              id: crypto.randomUUID(),
              label: type.label,
              color: type.color,
            },
          ],
        })),

      removeEventType: id =>
        set(state => ({
          eventTypes: state.eventTypes.filter(t => t.id !== id),
        })),

      addEvent: event =>
        set(state => ({
          events: [
            ...state.events,
            {
              id: crypto.randomUUID(),
              type: event.type,
              datetime: event.datetime,
              description: event.description || "",
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      removeEvent: id =>
        set(state => ({
          events: state.events.filter(e => e.id !== id),
        })),

      getEvents: () => get().events,
    }),
    {
      name: "reboot-tracker-storage",
    },
  ),
);
