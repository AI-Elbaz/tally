import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subYears,
} from "date-fns";
import {now} from "./utils";

export const PERIODS = [
  {
    key: "daily",
    label: "Today",
    current: () => ({start: startOfDay(now()), end: endOfDay(now())}),
    previous: () => ({
      start: startOfDay(subDays(now(), 1)),
      end: endOfDay(subDays(now(), 1)),
    }),
  },
  {
    key: "weekly",
    label: "This week",
    current: () => ({
      start: startOfWeek(now(), {weekStartsOn: 1}),
      end: endOfWeek(now(), {weekStartsOn: 1}),
    }),
    previous: () => ({
      start: startOfWeek(subWeeks(now(), 1), {weekStartsOn: 1}),
      end: endOfWeek(subWeeks(now(), 1), {weekStartsOn: 1}),
    }),
  },
  {
    key: "monthly",
    label: "This month",
    current: () => ({start: startOfMonth(now()), end: endOfMonth(now())}),
    previous: () => ({
      start: startOfMonth(subMonths(now(), 1)),
      end: endOfMonth(subMonths(now(), 1)),
    }),
  },
  {
    key: "yearly",
    label: "This year",
    current: () => ({start: startOfYear(now()), end: endOfYear(now())}),
    previous: () => ({
      start: startOfYear(subYears(now(), 1)),
      end: endOfYear(subYears(now(), 1)),
    }),
  },
];

export const THEMES = [
  {
    id: "default",
    name: "System Default",
    description: "Follows system preference",
    previewBg: "#ffffff", // Just for the drawer chip
    previewFg: "#09090b",
  },
  {
    id: "theme-sage",
    name: "Sage Mist",
    description: "Airy forest",
    previewBg: "#E8F5E9",
    previewFg: "#3A5A4C",
  },
  {
    id: "theme-sky",
    name: "Sky Wash",
    description: "Clear & light",
    previewBg: "#E0F2FE",
    previewFg: "#0C4A6E",
  },
  {
    id: "theme-lavender",
    name: "Lavender Haze",
    description: "Dreamy calm",
    previewBg: "#F5F3FF",
    previewFg: "#5B21B6",
  },
  {
    id: "theme-blush",
    name: "Blush Pink",
    description: "Warm & gentle",
    previewBg: "#FFF1F2",
    previewFg: "#831843",
  },
  {
    id: "theme-sand",
    name: "Warm Sand",
    description: "Organic earth",
    previewBg: "#FDFBF7",
    previewFg: "#5C4E3D",
  },
];
