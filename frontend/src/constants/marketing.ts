import { MapPin, Bookmark, CalendarDays, type LucideIcon } from "lucide-react";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const features: Feature[] = [
  {
    icon: MapPin,
    title: "Plan Routes Anywhere",
    description: "Draw custom paths on any street, trail, or campus worldwide.",
  },
  {
    icon: Bookmark,
    title: "Save & Reuse Routes",
    description:
      "Name and store your favorite routes so you never have to re-draw them.",
  },
  {
    icon: CalendarDays,
    title: "Track Your Consistency",
    description:
      "A built-in calendar logs your activity history so you can see your habits grow over time.",
  },
];

export const brandColors = {
  accent:     "#D5A021",  // amber — use on dark backgrounds only (marketing panel)
  accentText: "#6B4F0A",  // dark amber — WCAG AA on light bg (6.2:1)
  dark:       "#4B4237",
  light:      "#EDE7D9",
  muted:      "#A49694",
} as const;