"use client";

import { Activity, Gauge } from "lucide-react";
import type { ProbabilityPoint, TeamInfo } from "@/types";
import { formatMatchMinute, formatPercent } from "@/lib/utils";

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
    <section className="relative flex-1 overflow-hidden rounded-[22px] border border-white/80 bg-white/82 p-3 shadow-lg shadow-slate-200/60 backdrop-blur">
      <div className="pointer-events-none absolute -bottom-8 -right-5 text-[88px] font-black text-emerald-500 opacity-[0.055]">
        %
      </div>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">market pulse</div>
          <div className="text-[16px] font-black text-slate-950">当前概率</div>
        </div>
        <div className="grid h-7 w-7 place-items-center rounded-full bg-slate-950 text-white">
          <Activity className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="mb-3 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">focus</div>
            <div className="max-w-[180px] truncate text-[17px] font-black leading-tight text-slate-950">
              {leaderLabel(point, teams)}
            </div>
          </div>
          <div className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">
            {formatMatchMinute(point.minute)}
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {rows.map((row) => {
          const label =
            row.key === "homeWin" ? teams.home.shortName : row.key === "awayWin" ? teams.away.shortName : row.label;
          const value = point[row.key];

          return (
            <div key={row.key}>
              <div className="mb-1 flex items-center justify-between text-[10px] font-black">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className={`h-2 w-2 rounded-full ${row.color}`} />
                  {label}
                </span>
                <span className={row.text}>{formatPercent(value)}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${row.color}`} style={{ width: `${Math.max(3, value)}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-slate-200 bg-white/60 px-3 py-2">
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
            <Gauge className="h-3 w-3" />
            波动
          </div>
          <div className="mt-1 text-[13px] font-black text-slate-800">实时跟随</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/60 px-3 py-2">
          <div className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">source</div>
          <div className="mt-1 text-[13px] font-black text-slate-800">市场价格</div>
        </div>
      </div>
    </section>
  );
}
