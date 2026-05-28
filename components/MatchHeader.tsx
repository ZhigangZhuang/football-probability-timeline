"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import type { TeamInfo } from "@/types";
import { cn } from "@/lib/utils";

type MatchHeaderProps = {
  teams: {
    home: TeamInfo;
    away: TeamInfo;
  };
  score?: string;
  currentMinute: number;
  isDark?: boolean;
};

function TeamBadge({ team, side }: { team: TeamInfo; side: "home" | "away" }) {
  const hasLogo = Boolean(team.logo);

  return (
    <div className="flex w-20 flex-col items-center gap-1.5">
      <div
        className={cn(
          "grid h-12 w-12 place-items-center overflow-hidden rounded-full border-4 bg-white bg-cover bg-center shadow-md",
          side === "home" ? "border-emerald-200 text-emerald-600" : "border-red-200 text-red-500"
        )}
        style={hasLogo ? { backgroundImage: `url("${team.logo}")` } : undefined}
      >
        {!hasLogo && <Shield className="h-7 w-7" fill="currentColor" fillOpacity={0.13} />}
      </div>
      <div className="text-center">
        <div className="max-w-20 truncate text-[16px] font-black leading-none text-slate-950">
          {team.name}
        </div>
        <div className="mt-1 text-[10px] font-black tracking-[0.18em] text-slate-400">{team.label}</div>
      </div>
    </div>
  );
}

function formatScore(score: string) {
  return score.replace(/\s*-\s*/, " - ");
}

export function MatchHeader({ teams, score = "2 - 1", currentMinute, isDark = false }: MatchHeaderProps) {
  return (
    <header className="space-y-2">
      <div className="flex flex-col items-start gap-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={cn("whitespace-nowrap text-[32px] font-black leading-[0.95]", isDark ? "text-white" : "text-slate-950")}>
            比赛<span className="text-emerald-500">胜率走势</span>
          </h1>
        </motion.div>
      </div>

      <motion.div
        className="relative overflow-hidden rounded-[24px] border border-white/80 bg-white/90 p-2.5 shadow-lg shadow-slate-200/70 backdrop-blur"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.5 }}
      >
        <div className="pointer-events-none absolute -bottom-6 left-1/2 text-[70px] opacity-[0.035]">⚽</div>
        <div className="flex items-center justify-between">
          <TeamBadge team={teams.home} side="home" />

          <div className="flex flex-col items-center">
            <div className="rounded-[20px] bg-slate-950 px-5 py-2.5 text-center text-white shadow-xl">
              <div className="text-[34px] font-black leading-none tracking-tight">{formatScore(score)}</div>
              <div className="mt-1 rounded-full bg-emerald-500 px-3 py-0.5 text-[12px] font-black text-white shadow-glowGreen">
                {currentMinute === 0 ? "00'" : currentMinute >= 90 ? "90+5'" : `${currentMinute}'`}
              </div>
            </div>
            <div className="mt-2 text-[10px] font-black tracking-[0.18em] text-slate-400">MATCH TIMELINE</div>
          </div>

          <TeamBadge team={teams.away} side="away" />
        </div>
      </motion.div>
    </header>
  );
}
