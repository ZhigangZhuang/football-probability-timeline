"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import type { MatchEvent } from "@/types";
import { cn, eventColorClasses } from "@/lib/utils";

type EventTimelineProps = {
  events: MatchEvent[];
  currentMinute: number;
};

export function EventTimeline({ events, currentMinute }: EventTimelineProps) {
  const sortedEvents = [...events].sort((a, b) => a.minute - b.minute);
  const visibleEvents = sortedEvents.filter((event) => currentMinute >= event.minute);

  return (
    <motion.section
      className="relative overflow-hidden rounded-[22px] border border-white/80 bg-white/82 p-3 shadow-lg shadow-slate-200/60 backdrop-blur"
      initial={{ opacity: 0, x: -14, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <div className="pointer-events-none absolute -right-4 -top-5 text-[58px] opacity-[0.045]">⚽</div>
      <div className="mb-1.5 flex items-center justify-between">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">match events</div>
          <div className="text-[16px] font-black text-slate-950">事件栏</div>
        </div>
        <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <Trophy className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="relative space-y-1.5 overflow-hidden">
        {visibleEvents.length > 0 && <div className="absolute bottom-3 left-[20px] top-3 w-px bg-slate-200" />}
        {visibleEvents.map((event) => {
          const colors = eventColorClasses(event.color);
          const fallbackInitial = event.subtitle.trim().slice(0, 1) || "球";

          return (
            <motion.div
              key={event.id}
              className={cn(
                "relative flex items-center gap-2 rounded-xl border px-2 py-1.5 transition",
                `${colors.border} bg-white shadow-sm`
              )}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
            >
              <div className="relative z-10 h-9 w-9 shrink-0">
                <div
                  className={cn(
                    "grid h-9 w-9 place-items-center overflow-hidden rounded-full border-2 border-white bg-cover bg-center text-[13px] font-black shadow-md",
                    event.avatarUrl ? "bg-slate-100 text-slate-400" : `${colors.solid} text-white`
                  )}
                  aria-label={event.subtitle}
                  style={event.avatarUrl ? { backgroundImage: `url("${event.avatarUrl}")` } : undefined}
                >
                  {event.avatarUrl ? <span className="sr-only">{event.subtitle}</span> : fallbackInitial}
                </div>
                <div
                  className={cn(
                    "absolute -bottom-0.5 -right-1 rounded-full border border-white px-1 text-[7px] font-black leading-3",
                    `${colors.solid} text-white`
                  )}
                >
                  {event.minute}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className={cn("text-[11px] font-black leading-tight", colors.text)}>
                  {event.title}
                </div>
                <div className="truncate text-[10px] font-bold leading-tight text-slate-700">{event.subtitle}</div>
                <div className="truncate text-[9px] font-semibold leading-tight text-slate-500">
                  {event.description}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
