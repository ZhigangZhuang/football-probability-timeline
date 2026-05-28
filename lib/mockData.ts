import type { MatchEvent, ProbabilityPoint, TeamInfo, ThemePalette } from "@/types";
import { formatMatchMinute } from "@/lib/utils";

const anchors = [
  { minute: 0, homeWin: 40, draw: 30, awayWin: 30 },
  { minute: 6, homeWin: 41, draw: 31, awayWin: 28 },
  { minute: 11, homeWin: 43, draw: 29, awayWin: 28 },
  { minute: 12, homeWin: 62, draw: 22, awayWin: 16 },
  { minute: 20, homeWin: 59, draw: 24, awayWin: 17 },
  { minute: 30, homeWin: 57, draw: 26, awayWin: 17 },
  { minute: 38, homeWin: 66, draw: 19, awayWin: 15 },
  { minute: 45, homeWin: 64, draw: 20, awayWin: 16 },
  { minute: 55, homeWin: 60, draw: 24, awayWin: 16 },
  { minute: 66, homeWin: 62, draw: 21, awayWin: 17 },
  { minute: 67, homeWin: 72, draw: 14, awayWin: 14 },
  { minute: 75, homeWin: 69, draw: 17, awayWin: 14 },
  { minute: 80, homeWin: 65, draw: 19, awayWin: 16 },
  { minute: 81, homeWin: 76, draw: 10, awayWin: 14 },
  { minute: 86, homeWin: 74, draw: 11, awayWin: 15 },
  { minute: 90, homeWin: 68, draw: 12, awayWin: 20 }
];

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function basePoint(minute: number) {
  const currentIndex = anchors.findIndex((anchor, index) => {
    const next = anchors[index + 1];
    return next ? minute >= anchor.minute && minute <= next.minute : minute === anchor.minute;
  });
  const start = anchors[Math.max(currentIndex, 0)];
  const end = anchors[Math.min(currentIndex + 1, anchors.length - 1)];
  const progress = end.minute === start.minute ? 0 : (minute - start.minute) / (end.minute - start.minute);

  return {
    homeWin: lerp(start.homeWin, end.homeWin, progress),
    draw: lerp(start.draw, end.draw, progress)
  };
}

function isAnchorMinute(minute: number) {
  return anchors.some((anchor) => anchor.minute === minute);
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

export const probabilityData: ProbabilityPoint[] = Array.from({ length: 91 }, (_, minute) => {
  const point = basePoint(minute);
  const wave = isAnchorMinute(minute)
    ? 0
    : Math.sin(minute * 0.72) * 1.1 + Math.sin(minute * 0.19) * 0.8;
  const drawWave = isAnchorMinute(minute)
    ? 0
    : Math.cos(minute * 0.46) * 0.9 - Math.sin(minute * 0.13) * 0.45;

  const homeWin = Math.max(4, Math.min(92, point.homeWin + wave));
  const draw = Math.max(3, Math.min(65, point.draw + drawWave));
  const awayWin = Math.max(2, 100 - homeWin - draw);
  const total = homeWin + draw + awayWin;

  return {
    minute,
    label: formatMatchMinute(minute),
    homeWin: roundOne((homeWin / total) * 100),
    draw: roundOne((draw / total) * 100),
    awayWin: roundOne((awayWin / total) * 100)
  };
});

export const matchEvents: MatchEvent[] = [
  {
    id: "goal-12",
    minute: 12,
    type: "goal",
    title: "12' 进球",
    subtitle: "主队 #9",
    description: "精彩推射破门！",
    team: "home",
    color: "green",
    probabilityKey: "homeWin",
    cardPosition: { left: "5%", top: "12%" }
  },
  {
    id: "penalty-38",
    minute: 38,
    type: "penalty",
    title: "38' 点球命中",
    subtitle: "主队点球一蹴而就",
    description: "扩大领先优势",
    team: "home",
    color: "yellow",
    probabilityKey: "homeWin",
    cardPosition: { left: "30%", top: "3%" }
  },
  {
    id: "red-card-67",
    minute: 67,
    type: "red_card",
    title: "67' 红牌",
    subtitle: "客队 #4",
    description: "犯规被直红罚下",
    team: "away",
    color: "red",
    probabilityKey: "homeWin",
    cardPosition: { left: "62%", top: "18%" }
  },
  {
    id: "winner-81",
    minute: 81,
    type: "winner",
    title: "81' 绝杀",
    subtitle: "主队 #11",
    description: "补时绝杀锁定胜局！",
    team: "home",
    color: "green",
    probabilityKey: "homeWin",
    cardPosition: { left: "54%", top: "68%" }
  }
];

export const defaultTeams: { home: TeamInfo; away: TeamInfo } = {
  home: {
    name: "主队",
    shortName: "HOME",
    label: "HOME"
  },
  away: {
    name: "客队",
    shortName: "AWAY",
    label: "AWAY"
  }
};

export const themes: ThemePalette[] = [
  {
    name: "classic",
    label: "经典绿",
    background: "from-slate-50 via-white to-emerald-50",
    surface: "bg-white/90",
    accent: "text-emerald-500",
    muted: "text-slate-500"
  },
  {
    name: "night",
    label: "夜赛",
    background: "from-slate-950 via-slate-900 to-emerald-950",
    surface: "bg-white/95",
    accent: "text-emerald-400",
    muted: "text-slate-500"
  },
  {
    name: "mint",
    label: "薄荷",
    background: "from-teal-50 via-white to-emerald-100",
    surface: "bg-white/90",
    accent: "text-teal-500",
    muted: "text-slate-500"
  }
];
