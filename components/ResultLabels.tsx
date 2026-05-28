"use client";

import { motion } from "framer-motion";
import type { ProbabilityPoint } from "@/types";
import { formatPercent } from "@/lib/utils";

type ResultLabelsProps = {
  point: ProbabilityPoint;
  minute: number;
  margin: {
    top: number;
    right: number;
    left: number;
    bottom: number;
  };
};

const labelConfig = [
  {
    key: "homeWin" as const,
    label: "主胜",
    color: "bg-emerald-500",
    text: "text-emerald-700",
    topOffset: -6,
    lowValueOffset: -44
  },
  {
    key: "draw" as const,
    label: "平局",
    color: "bg-yellow-400",
    text: "text-yellow-700",
    topOffset: -12,
    lowValueOffset: -12
  },
  {
    key: "awayWin" as const,
    label: "客胜",
    color: "bg-red-500",
    text: "text-red-700",
    topOffset: 10,
    lowValueOffset: -10
  }
];

function xPosition(minute: number, margin: ResultLabelsProps["margin"]) {
  const plotLeft = 48 + margin.left;
  const plotRight = margin.right;
  const ratio = minute / 90;
  return `calc(${plotLeft}px + (100% - ${plotLeft + plotRight}px) * ${ratio} + 10px)`;
}

function yPosition(value: number, offset: number, lowValueOffset: number, margin: ResultLabelsProps["margin"]) {
  const plotTop = margin.top;
  const plotBottom = 24 + margin.bottom;
  const ratio = (100 - value) / 100;
  const resolvedOffset = value <= 5 ? lowValueOffset : offset;
  return `clamp(${plotTop + 16}px, calc(${plotTop}px + (100% - ${plotTop + plotBottom}px) * ${ratio} + ${resolvedOffset}px), calc(100% - ${
    plotBottom + 22
  }px))`;
}

export function ResultLabels({ point, minute, margin }: ResultLabelsProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {labelConfig.map((item, index) => (
        <motion.div
          key={item.key}
          className="absolute flex items-center gap-1.5 rounded-full border border-white bg-white/96 px-2.5 py-1.5 shadow-md backdrop-blur"
          style={{
            left: xPosition(minute, margin),
            top: yPosition(point[item.key], item.topOffset, item.lowValueOffset, margin),
            transform: "translateY(-50%)"
          }}
          initial={{ opacity: 0, x: 12, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: index * 0.04, type: "spring", stiffness: 320, damping: 24 }}
        >
          <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
          <span className={`text-[11px] font-black ${item.text}`}>
            {item.label} {formatPercent(point[item.key])}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
