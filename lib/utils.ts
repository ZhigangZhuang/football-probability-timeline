import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { MatchEvent } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function formatMatchMinute(minute: number) {
  if (minute === 0) return "00'";
  if (minute === 45) return "HT";
  if (minute >= 90) return "90+";
  return `${minute}'`;
}

export function eventColorClasses(color: MatchEvent["color"]) {
  const classes = {
    green: {
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      ring: "ring-emerald-300/60",
      solid: "bg-emerald-500",
      shadow: "shadow-glowGreen"
    },
    yellow: {
      text: "text-yellow-700",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      ring: "ring-yellow-300/60",
      solid: "bg-yellow-400",
      shadow: "shadow-glowYellow"
    },
    red: {
      text: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      ring: "ring-red-300/60",
      solid: "bg-red-500",
      shadow: "shadow-glowRed"
    }
  };

  return classes[color];
}
