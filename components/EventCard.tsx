"use client";

import { motion } from "framer-motion";
import { CircleDot, Flag, Sparkles, Square } from "lucide-react";
import type { MatchEvent } from "@/types";
import { cn, eventColorClasses } from "@/lib/utils";

type EventCardProps = {
  event: MatchEvent;
};

function EventIcon({ event }: { event: MatchEvent }) {
  const iconClass = "h-3.5 w-3.5";
  if (event.type === "red_card") return <Square className={iconClass} fill="currentColor" />;
  if (event.type === "penalty") return <Flag className={iconClass} />;
  if (event.type === "winner") return <Sparkles className={iconClass} />;
  return <CircleDot className={iconClass} />;
}

export function EventCard({ event }: EventCardProps) {
  const colors = eventColorClasses(event.color);

  return (
    <motion.article
      className={cn(
        "pointer-events-none absolute z-20 w-[118px] rounded-xl border bg-white/96 p-1.5 shadow-lg backdrop-blur",
        colors.border,
        colors.shadow
      )}
      style={{ left: event.cardPosition.left, top: event.cardPosition.top }}
      initial={{ opacity: 0, y: 14, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 360, damping: 22 }}
    >
      <div className="flex items-center gap-1.5">
        <div className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full ring-2", colors.bg, colors.text, colors.ring)}>
          <EventIcon event={event} />
        </div>
        <div className="min-w-0">
          <div className={cn("text-[11px] font-black leading-tight", colors.text)}>{event.title}</div>
          <div className="truncate text-[9px] font-bold leading-tight text-slate-700">{event.subtitle}</div>
          <div className="truncate text-[9px] font-semibold leading-tight text-slate-500">{event.description}</div>
        </div>
      </div>
    </motion.article>
  );
}
