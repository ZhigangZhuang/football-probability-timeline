"use client";

import { Activity } from "lucide-react";
import type { ProbabilityPoint, TeamInfo } from "@/types";
import { cn, formatMatchMinute, formatPercent } from "@/lib/utils";

type ProbabilitySummaryProps = {
  point: ProbabilityPoint;
  teams: {
    home: TeamInfo;
    away: TeamInfo;
  };
};

const rows = [
  { key: "homeWin" as const, label: "主胜", color: "bg-emerald-500", text: "text-emerald-700" },
  { key: "draw" as const, label: "平局", color: "bg-yellow-400", text: "text-yellow-700" },
  { key: "awayWin" as const, label: "客胜", color: "bg-red-500", text: "text-red-700" }
];

function leaderLabel(point: ProbabilityPoint, teams: ProbabilitySummaryProps["teams"]) {
  const sorted = rows
    .map((row) => ({ ...row, value: point[row.key] }))
    .sort((a, b) => b.value - a.value);
  const leader = sorted[0];

  if (leader.key === "homeWin") return `${teams.home.name} 胜`;
  if (leader.key === "awayWin") return `${teams.away.name} 胜`;
  return "平局";
}

export function ProbabilitySummary({ point, teams }: ProbabilitySummaryProps) {
  return (
    <section className="relative flex-1 overflow-hidden rounded-[24px] border border-white/80 bg-white/85 p-4 shadow-lg shadow-slate-200/60 backdrop-blur">
      <div className="pointer-events-none absolute -bottom-8 -right-5 text-[112px] font-black text-emerald-500 opacity-[0.055]">
        %
      </div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[13px] font-black text-slate-400">当前盘面</div>
          <div className="text-[23px] font-black leading-tight text-slate-950">胜平负概率</div>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-950 text-white">
          <Activity className="h-5 w-5" />
        </div>
      </div>

      <div className="mb-4 rounded-[22px] border border-slate-200 bg-white/72 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[13px] font-black text-slate-400">领先方向</div>
            <div className="max-w-[210px] truncate text-[28px] font-black leading-tight text-slate-950">
              {leaderLabel(point, teams)}
            </div>
          </div>
          <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-[16px] font-black text-emerald-700">
            {formatMatchMinute(point.minute)}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {rows.map((row) => {
          const label =
            row.key === "homeWin" ? `${teams.home.name}胜` : row.key === "awayWin" ? `${teams.away.name}胜` : row.label;
          const value = point[row.key];

          return (
            <div key={row.key}>
              <div className="mb-1.5 flex items-center justify-between text-[16px] font-black">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className={`h-3 w-3 rounded-full ${row.color}`} />
                  {label}
                </span>
                <span className={cn("text-[20px]", row.text)}>{formatPercent(value)}</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${row.color}`} style={{ width: `${Math.max(3, value)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
