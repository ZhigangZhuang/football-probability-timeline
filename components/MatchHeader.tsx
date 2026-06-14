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
  const sideLabel = side === "home" ? "主队" : "客队";

  return (
    <div className="flex w-[96px] flex-col items-center gap-2">
      <div
        className={cn(
          "grid h-[64px] w-[64px] place-items-center overflow-hidden rounded-full border-[5px] bg-white bg-cover bg-center shadow-lg",
          side === "home" ? "border-emerald-200 text-emerald-600" : "border-red-200 text-red-500"
        )}
        style={hasLogo ? { backgroundImage: `url("${team.logo}")` } : undefined}
      >
        {!hasLogo && <Shield className="h-9 w-9" fill="currentColor" fillOpacity={0.13} />}
      </div>
      <div className="text-center">
        <div className="max-w-[96px] truncate text-[22px] font-black leading-none text-slate-950">
          {team.name}
        </div>
        <div className="mt-1 text-[13px] font-black text-slate-400">{sideLabel}</div>
      </div>
    </div>
  );
}

function formatScore(score: string) {
  return score.replace(/\s*-\s*/, " - ");
}

export function MatchHeader({ teams, score = "2 - 1", currentMinute, isDark = false }: MatchHeaderProps) {
  return (
    <header className="space-y-3">
      <div className="flex flex-col items-start gap-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={cn("whitespace-nowrap text-[40px] font-black leading-[0.95]", isDark ? "text-white" : "text-slate-950")}>
            比赛<span className="text-emerald-500">胜率走势</span>
          </h1>
        </motion.div>
      </div>

      <motion.div
        className="relative overflow-hidden rounded-[26px] border border-white/80 bg-white/92 p-4 shadow-xl shadow-slate-200/70 backdrop-blur"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.5 }}
      >
        <div className="pointer-events-none absolute -bottom-8 left-1/2 text-[92px] opacity-[0.035]">⚽</div>
        <div className="flex items-center justify-between gap-3">
          <TeamBadge team={teams.home} side="home" />

          <div className="flex min-w-[132px] flex-col items-center">
            <div className="w-full rounded-[24px] bg-slate-950 px-4 py-3 text-center text-white shadow-2xl">
              <div className="text-[54px] font-black leading-none tracking-tight">{formatScore(score)}</div>
              <div className="mt-2 rounded-full bg-emerald-500 px-4 py-1 text-[18px] font-black leading-none text-white shadow-glowGreen">
                {currentMinute === 0 ? "00'" : currentMinute >= 90 ? "90+5'" : `${currentMinute}'`}
              </div>
            </div>
            <div className="mt-2 text-[13px] font-black text-slate-400">比分时间轴</div>
          </div>

          <TeamBadge team={teams.away} side="away" />
        </div>
      </motion.div>
    </header>
  );
}
