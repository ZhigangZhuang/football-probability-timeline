"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { MatchEvent, ProbabilityPoint } from "@/types";
import { eventColorClasses, formatPercent } from "@/lib/utils";
import { EventCard } from "@/components/EventCard";
import { Legend } from "@/components/Legend";
import { ResultLabels } from "@/components/ResultLabels";

type ProbabilityChartProps = {
  data: ProbabilityPoint[];
  events: MatchEvent[];
  currentMinute: number;
  showEvents: boolean;
};

const lineColors = {
  homeWin: "#22c55e",
  draw: "#facc15",
  awayWin: "#ef4444"
};

const chartMargin = { top: 88, right: 96, left: 0, bottom: 24 };

function axisLabel(value: number) {
  if (value === 0) return "00'";
  if (value === 45) return "HT";
  if (value === 90) return "90+";
  return `${value}'`;
}

function CustomTooltip({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
      <div className="mb-1 text-[11px] font-black text-slate-500">{axisLabel(Number(label))}</div>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-4 text-[11px] font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name}
          </span>
          <span>{formatPercent(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function ProbabilityChart({ data, events, currentMinute, showEvents }: ProbabilityChartProps) {
  const minute = Math.min(90, Math.max(0, Math.floor(currentMinute)));
  const visibleData = data.filter((point) => point.minute <= minute);
  const visibleEvents = showEvents ? events.filter((event) => event.minute <= minute) : [];
  const currentPoint = visibleData[visibleData.length - 1] ?? data[0];

  return (
    <section className="relative min-h-0 overflow-hidden rounded-[28px] border border-white/80 bg-white/82 shadow-xl shadow-slate-200/70 backdrop-blur">
      <div className="chart-grid-mask absolute inset-0 opacity-80" />
      <div className="absolute left-4 top-3 z-10">
        <div className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">implied probability</div>
        <div className="mt-0.5 flex items-center gap-2 text-[24px] font-black text-slate-950">
          胜平负概率时间轴
        </div>
      </div>
      <div className="absolute right-4 top-4 z-10 rounded-full bg-slate-950 px-3 py-1 text-[11px] font-black text-white">
        {axisLabel(minute)}
      </div>
      <div className="absolute right-20 top-4 z-10 w-[300px]">
        <Legend />
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={visibleData} margin={chartMargin}>
          <CartesianGrid stroke="#dbe4df" strokeDasharray="4 8" vertical={false} />
          <XAxis
            dataKey="minute"
            type="number"
            domain={[0, 90]}
            ticks={[0, 15, 30, 45, 60, 75, 90]}
            tickFormatter={axisLabel}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 800 }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
            tickFormatter={(value) => `${value}%`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 800 }}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#94a3b8", strokeDasharray: "4 5" }} />
          <ReferenceLine
            x={minute}
            stroke="#0f172a"
            strokeDasharray="5 5"
            strokeWidth={1.6}
            ifOverflow="extendDomain"
          />
          {visibleEvents.map((event) => (
            <ReferenceLine
              key={`${event.id}-guide`}
              x={event.minute}
              stroke={event.color === "yellow" ? "#eab308" : event.color === "red" ? "#ef4444" : "#22c55e"}
              strokeDasharray="3 6"
              strokeOpacity={0.36}
              strokeWidth={1.2}
              ifOverflow="extendDomain"
            />
          ))}
          <Line
            name="主胜"
            type="monotone"
            dataKey="homeWin"
            stroke={lineColors.homeWin}
            strokeWidth={4.6}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 3, stroke: "#ffffff" }}
            isAnimationActive={false}
          />
          <Line
            name="平局"
            type="monotone"
            dataKey="draw"
            stroke={lineColors.draw}
            strokeWidth={3.7}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 3, stroke: "#ffffff" }}
            isAnimationActive={false}
          />
          <Line
            name="客胜"
            type="monotone"
            dataKey="awayWin"
            stroke={lineColors.awayWin}
            strokeWidth={3.7}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 3, stroke: "#ffffff" }}
            isAnimationActive={false}
          />

          {visibleEvents.map((event) => {
            const eventPoint = data[event.minute];
            const colors = eventColorClasses(event.color);

            return (
              <ReferenceDot
                key={event.id}
                x={event.minute}
                y={eventPoint[event.probabilityKey]}
                r={5.5}
                fill={event.color === "yellow" ? "#facc15" : event.color === "red" ? "#ef4444" : "#22c55e"}
                stroke="#ffffff"
                strokeWidth={3}
                className={colors.shadow}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      {visibleEvents.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}

      <ResultLabels point={currentPoint} minute={minute} margin={chartMargin} />
    </section>
  );
}
