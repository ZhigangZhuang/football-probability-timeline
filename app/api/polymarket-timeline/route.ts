import { NextResponse } from "next/server";
import type { MatchEvent, MatchTimelinePayload, ProbabilityPoint } from "@/types";
import { formatMatchMinute } from "@/lib/utils";

type GammaTeam = {
  name?: string;
  alias?: string;
  abbreviation?: string;
  logo?: string;
  color?: string;
};

type GammaMarket = {
  slug: string;
  groupItemTitle?: string;
  outcomePrices: string;
  clobTokenIds: string;
  sportsMarketType?: string;
  gameStartTime?: string;
  startDate?: string;
  endDate?: string;
  updatedAt?: string;
  closedTime?: string;
};

type GammaEvent = {
  slug: string;
  title: string;
  score?: string;
  startTime?: string;
  startDate?: string;
  endDate?: string;
  updatedAt?: string;
  finishedTimestamp?: string;
  closedTime?: string;
  teams?: GammaTeam[];
  markets?: GammaMarket[];
};

type PriceHistoryPoint = {
  t: number;
  p: number;
};

const GAMMA_API_BASE = "https://gamma-api.polymarket.com";
const CLOB_API_BASE = "https://clob.polymarket.com";
const DEFAULT_SLUG = "ucl-psg-ars-2026-05-30";
const MARKET_REACTION_LAG_SECONDS = 60;
const ESTIMATED_HALFTIME_SECONDS = 16 * 60;

type ConfiguredGoal = {
  id: string;
  minute: number;
  title: string;
  subtitle: string;
  description: string;
  scoreAfter?: string;
  avatarUrl?: string;
  team: MatchEvent["team"];
  color: MatchEvent["color"];
  probabilityKey: MatchEvent["probabilityKey"];
};

type MatchConfig = {
  timestampAnchors: (startTs: number, endTs: number) => Array<{ minute: number; ts: number }>;
  goals: ConfiguredGoal[];
};

function parseJsonArray<T>(value: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function timestampSeconds(value?: string) {
  if (!value) return null;
  const normalized = value.replace(" ", "T");
  const ms = new Date(normalized).getTime();
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function interpolate(history: PriceHistoryPoint[], targetTs: number) {
  if (!history.length) return 0;
  if (targetTs <= history[0].t) return history[0].p;
  if (targetTs >= history[history.length - 1].t) return history[history.length - 1].p;

  let rightIndex = 1;
  while (rightIndex < history.length && history[rightIndex].t < targetTs) {
    rightIndex += 1;
  }

  const left = history[rightIndex - 1];
  const right = history[rightIndex];
  const progress = (targetTs - left.t) / Math.max(1, right.t - left.t);
  return left.p + (right.p - left.p) * progress;
}

function normalizePoint(minute: number, homeRaw: number, drawRaw: number, awayRaw: number): ProbabilityPoint {
  const total = Math.max(0.001, homeRaw + drawRaw + awayRaw);

  return {
    minute,
    label: formatMatchMinute(minute),
    homeWin: roundOne((homeRaw / total) * 100),
    draw: roundOne((drawRaw / total) * 100),
    awayWin: roundOne((awayRaw / total) * 100)
  };
}

function interpolateTimestamp(minute: number, anchors: Array<{ minute: number; ts: number }>) {
  if (minute <= anchors[0].minute) return anchors[0].ts;
  if (minute >= anchors[anchors.length - 1].minute) return anchors[anchors.length - 1].ts;

  let rightIndex = 1;
  while (rightIndex < anchors.length && anchors[rightIndex].minute < minute) {
    rightIndex += 1;
  }

  const left = anchors[rightIndex - 1];
  const right = anchors[rightIndex];
  const progress = (minute - left.minute) / Math.max(1, right.minute - left.minute);
  return left.ts + (right.ts - left.ts) * progress;
}

function genericMatchClockTimestamp(minute: number, startTs: number, endTs: number) {
  if (minute >= 90) return endTs;

  const halftimeOffset = minute > 45 ? ESTIMATED_HALFTIME_SECONDS : 0;
  return startTs + minute * 60 + halftimeOffset + MARKET_REACTION_LAG_SECONDS;
}

function chartPosition(minute: number, value: number) {
  const left = Math.max(3, Math.min(78, 6 + (minute / 90) * 78 - 7));
  const y = 17 + ((100 - value) / 100) * 67;
  const top = value >= 78 ? y + 7 : y - 13;

  return {
    left: `${roundOne(left)}%`,
    top: `${roundOne(Math.max(15, Math.min(78, top)))}%`
  };
}

const matchConfigs: Record<string, MatchConfig> = {
  "ucl-psg-ars-2026-05-30": {
    timestampAnchors: (startTs) => [
      { minute: 0, ts: startTs + MARKET_REACTION_LAG_SECONDS },
      { minute: 6, ts: startTs + 7 * 60 + 5 },
      { minute: 45, ts: startTs + 49 * 60 },
      { minute: 65, ts: startTs + 87 * 60 + 6 },
      { minute: 90, ts: startTs + 122 * 60 + 4 }
    ],
    goals: [
      {
        id: "goal-6-havertz",
        minute: 6,
        title: "6' 进球",
        subtitle: "哈弗茨",
        description: "Arsenal 0-1",
        scoreAfter: "0-1",
        avatarUrl: "https://resources.premierleague.com/premierleague/photos/players/250x250/p219847.png",
        team: "away",
        color: "red",
        probabilityKey: "awayWin"
      },
      {
        id: "goal-65-dembele",
        minute: 65,
        title: "65' 点球",
        subtitle: "登贝莱",
        description: "PSG 1-1",
        scoreAfter: "1-1",
        avatarUrl: "https://ui-avatars.com/api/?name=%E7%99%BB%E8%B4%9D%E8%8E%B1&background=105070&color=fff&bold=true&size=128",
        team: "home",
        color: "yellow",
        probabilityKey: "draw"
      }
    ]
  },
  "epl-che-tot-2026-05-19": {
    timestampAnchors: (startTs, endTs) => [
      { minute: 0, ts: startTs + MARKET_REACTION_LAG_SECONDS },
      { minute: 18, ts: startTs + 19 * 60 + 4 },
      { minute: 45, ts: startTs + 46 * 60 },
      { minute: 67, ts: startTs + 84 * 60 + 4 },
      { minute: 73, ts: startTs + 90 * 60 + 4 },
      { minute: 90, ts: endTs }
    ],
    goals: [
      {
        id: "goal-18-fernandez",
        minute: 18,
        title: "18' 进球",
        subtitle: "恩佐·费尔南德斯",
        description: "Chelsea 1-0",
        team: "home",
        color: "green",
        probabilityKey: "homeWin"
      },
      {
        id: "goal-67-santos",
        minute: 67,
        title: "67' 进球",
        subtitle: "安德雷·桑托斯",
        description: "Chelsea 2-0",
        team: "home",
        color: "green",
        probabilityKey: "homeWin"
      },
      {
        id: "goal-73-richarlison",
        minute: 73,
        title: "73' 进球",
        subtitle: "理查利森",
        description: "Spurs 追回一球",
        team: "away",
        color: "red",
        probabilityKey: "awayWin"
      }
    ]
  },
  "epl-eve-mac-2026-05-04": {
    timestampAnchors: (startTs, endTs) => [
      { minute: 0, ts: startTs + MARKET_REACTION_LAG_SECONDS },
      { minute: 43, ts: startTs + 43 * 60 + 6 },
      { minute: 45, ts: startTs + 46 * 60 },
      { minute: 68, ts: startTs + 87 * 60 + 4 },
      { minute: 73, ts: startTs + 92 * 60 + 4 },
      { minute: 81, ts: startTs + 100 * 60 + 6 },
      { minute: 83, ts: startTs + 102 * 60 + 4 },
      { minute: 90, ts: endTs }
    ],
    goals: [
      {
        id: "goal-43-doku",
        minute: 43,
        title: "43' 进球",
        subtitle: "多库",
        description: "Man City 0-1",
        scoreAfter: "0-1",
        avatarUrl: "https://resources.premierleague.com/premierleague/photos/players/250x250/p248875.png",
        team: "away",
        color: "red",
        probabilityKey: "awayWin"
      },
      {
        id: "goal-68-barry",
        minute: 68,
        title: "68' 进球",
        subtitle: "蒂埃诺·巴里",
        description: "Everton 1-1",
        scoreAfter: "1-1",
        avatarUrl: "https://ui-avatars.com/api/?name=%E5%B7%B4%E9%87%8C&background=10b981&color=fff&bold=true&size=128",
        team: "home",
        color: "green",
        probabilityKey: "homeWin"
      },
      {
        id: "goal-73-obrien",
        minute: 73,
        title: "73' 进球",
        subtitle: "杰克·奥布赖恩",
        description: "Everton 2-1",
        scoreAfter: "2-1",
        avatarUrl: "https://resources.premierleague.com/premierleague/photos/players/250x250/p512462.png",
        team: "home",
        color: "green",
        probabilityKey: "homeWin"
      },
      {
        id: "goal-81-barry",
        minute: 81,
        title: "81' 进球",
        subtitle: "蒂埃诺·巴里",
        description: "Everton 3-1",
        scoreAfter: "3-1",
        avatarUrl: "https://ui-avatars.com/api/?name=%E5%B7%B4%E9%87%8C&background=10b981&color=fff&bold=true&size=128",
        team: "home",
        color: "green",
        probabilityKey: "homeWin"
      },
      {
        id: "goal-83-haaland",
        minute: 83,
        title: "83' 进球",
        subtitle: "哈兰德",
        description: "Man City 3-2",
        scoreAfter: "3-2",
        avatarUrl: "https://resources.premierleague.com/premierleague/photos/players/250x250/p223094.png",
        team: "away",
        color: "red",
        probabilityKey: "awayWin"
      },
      {
        id: "goal-90-doku",
        minute: 90,
        title: "90+7' 进球",
        subtitle: "多库",
        description: "Man City 3-3",
        scoreAfter: "3-3",
        avatarUrl: "https://resources.premierleague.com/premierleague/photos/players/250x250/p248875.png",
        team: "away",
        color: "red",
        probabilityKey: "awayWin"
      }
    ]
  }
};

function movementLabel(
  key: "homeWin" | "draw" | "awayWin",
  labels: {
    home: string;
    away: string;
    draw: string;
  }
) {
  if (key === "homeWin") return labels.home;
  if (key === "awayWin") return labels.away;
  return labels.draw;
}

function movementColor(key: "homeWin" | "draw" | "awayWin", delta: number): MatchEvent["color"] {
  if (key === "homeWin" && delta >= 0) return "green";
  if (key === "awayWin" && delta >= 0) return "red";
  if (key === "draw" && delta >= 0) return "yellow";
  return "green";
}

function buildMarketEvents(
  data: ProbabilityPoint[],
  labels: {
    home: string;
    away: string;
    draw: string;
  }
): MatchEvent[] {
  const candidates = data
    .slice(1)
    .map((point, index) => {
      const previous = data[index];
      const deltas = [
        { key: "homeWin" as const, value: point.homeWin - previous.homeWin },
        { key: "draw" as const, value: point.draw - previous.draw },
        { key: "awayWin" as const, value: point.awayWin - previous.awayWin }
      ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

      return {
        minute: point.minute,
        key: deltas[0].key,
        delta: deltas[0].value,
        strength: Math.abs(deltas[0].value)
      };
    })
    .filter((item) => item.minute > 3 && item.minute < 88 && item.strength >= 1.8)
    .sort((a, b) => b.strength - a.strength);

  const picked: typeof candidates = [];
  for (const candidate of candidates) {
    if (picked.every((item) => Math.abs(item.minute - candidate.minute) >= 9)) {
      picked.push(candidate);
    }
    if (picked.length === 4) break;
  }

  const positions = [
    { left: "5%", top: "12%" },
    { left: "30%", top: "3%" },
    { left: "62%", top: "18%" },
    { left: "54%", top: "68%" }
  ];

  return picked
    .sort((a, b) => a.minute - b.minute)
    .map((item, index): MatchEvent => {
      const color = movementColor(item.key, item.delta);
      const direction = item.delta >= 0 ? "上行" : "回落";
      const label = movementLabel(item.key, labels);

      return {
        id: `real-jump-${item.minute}-${item.key}`,
        minute: item.minute,
        type: color === "yellow" ? "penalty" : color === "red" ? "red_card" : "goal",
        title: `${item.minute}' 概率跳变`,
        subtitle: `${label} 预期${direction} ${roundOne(Math.abs(item.delta))}pp`,
        description: "由历史价格变化自动识别",
        team: item.key === "awayWin" ? "away" : "home",
        color,
        probabilityKey: item.key,
        cardPosition: positions[index]
      };
    });
}

function buildConfiguredGoalEvents(data: ProbabilityPoint[], goals: ConfiguredGoal[]): MatchEvent[] {
  const pointAt = (minute: number) => data[Math.min(90, Math.max(0, minute))];
  return goals.map((goal) => ({
    ...goal,
    type: "goal",
    cardPosition: chartPosition(goal.minute, pointAt(goal.minute)[goal.probabilityKey])
  }));
}

async function fetchEvent(slug: string) {
  const url = new URL("/events", GAMMA_API_BASE);
  url.searchParams.set("slug", slug);
  const response = await fetch(url, { next: { revalidate: 60 } });

  if (!response.ok) {
    throw new Error(`Polymarket event fetch failed: ${response.status}`);
  }

  const events = (await response.json()) as GammaEvent[];
  return events[0] ?? null;
}

async function fetchHistory(tokenId: string, startTs: number, endTs: number) {
  const url = new URL("/prices-history", CLOB_API_BASE);
  url.searchParams.set("market", tokenId);
  url.searchParams.set("startTs", String(startTs));
  url.searchParams.set("endTs", String(endTs));
  url.searchParams.set("fidelity", "1");

  const response = await fetch(url, { next: { revalidate: 60 } });

  if (!response.ok) {
    throw new Error(`Polymarket history fetch failed: ${response.status}`);
  }

  const payload = (await response.json()) as { history?: PriceHistoryPoint[] };
  return (payload.history ?? []).sort((a, b) => a.t - b.t);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug") || DEFAULT_SLUG;
    const event = await fetchEvent(slug);

    if (!event?.markets?.length) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const moneylineMarkets = event.markets.filter((market) => market.sportsMarketType === "moneyline");
    const [homeTeam, awayTeam] = event.teams ?? [];
    const homeAbbr = homeTeam?.abbreviation?.toLowerCase();
    const awayAbbr = awayTeam?.abbreviation?.toLowerCase();
    const homeMarket =
      (homeAbbr ? moneylineMarkets.find((market) => market.slug.endsWith(`-${homeAbbr}`)) : undefined) ??
      moneylineMarkets.find((market) => !market.slug.endsWith("-draw"));
    const drawMarket = moneylineMarkets.find((market) => market.slug.endsWith("-draw")) ?? moneylineMarkets[1];
    const awayMarket =
      (awayAbbr ? moneylineMarkets.find((market) => market.slug.endsWith(`-${awayAbbr}`)) : undefined) ??
      moneylineMarkets.find((market) => market !== homeMarket && market !== drawMarket);

    if (!homeMarket || !drawMarket || !awayMarket) {
      return NextResponse.json({ error: "Moneyline markets not found" }, { status: 404 });
    }

    const startTs =
      timestampSeconds(event.startTime) ??
      timestampSeconds(homeMarket.gameStartTime) ??
      timestampSeconds(drawMarket.gameStartTime) ??
      timestampSeconds(awayMarket.gameStartTime) ??
      timestampSeconds(event.endDate);
    const endTs =
      timestampSeconds(event.finishedTimestamp) ??
      timestampSeconds(event.closedTime) ??
      timestampSeconds(homeMarket.closedTime) ??
      timestampSeconds(drawMarket.closedTime) ??
      timestampSeconds(awayMarket.closedTime) ??
      timestampSeconds(event.updatedAt) ??
      timestampSeconds(drawMarket.updatedAt) ??
      timestampSeconds(homeMarket.updatedAt) ??
      timestampSeconds(awayMarket.updatedAt);

    if (!startTs || !endTs || endTs <= startTs) {
      return NextResponse.json({ error: "Missing match timestamps" }, { status: 422 });
    }

    const [homeToken] = parseJsonArray<string>(homeMarket.clobTokenIds, []);
    const [drawToken] = parseJsonArray<string>(drawMarket.clobTokenIds, []);
    const [awayToken] = parseJsonArray<string>(awayMarket.clobTokenIds, []);

    if (!homeToken || !drawToken || !awayToken) {
      return NextResponse.json({ error: "Missing CLOB token ids" }, { status: 422 });
    }

    const [homeHistory, drawHistory, awayHistory] = await Promise.all([
      fetchHistory(homeToken, startTs, endTs),
      fetchHistory(drawToken, startTs, endTs),
      fetchHistory(awayToken, startTs, endTs)
    ]);

    const matchConfig = matchConfigs[slug];
    const clockAnchors = matchConfig?.timestampAnchors(startTs, endTs) ?? null;
    const probabilityData = Array.from({ length: 91 }, (_, minute) => {
      const targetTs = clockAnchors
        ? interpolateTimestamp(minute, clockAnchors)
        : genericMatchClockTimestamp(minute, startTs, endTs);
      return normalizePoint(
        minute,
        interpolate(homeHistory, targetTs) * 100,
        interpolate(drawHistory, targetTs) * 100,
        interpolate(awayHistory, targetTs) * 100
      );
    });

    const homeName = homeTeam?.alias ?? homeTeam?.name ?? "主队";
    const awayName = awayTeam?.alias ?? awayTeam?.name ?? "客队";
    const league = slug.split("-")[0] || "epl";
    const payload: MatchTimelinePayload = {
      source: "polymarket",
      sourceUrl: `https://polymarket.com/zh/sports/${league}/${slug}`,
      slug,
      title: event.title,
      score: event.score ?? "2-1",
      status: "完赛",
      dataMappingNote:
        Boolean(matchConfig)
          ? "按比赛时钟重映射：进球价格反应点 + 中场休息 + 终场 90+ 分段校准。"
          : "按比赛时钟重映射：上半场、估算中场休息、下半场、终场分段处理。",
      teams: {
        home: {
          name: homeName,
          shortName: homeTeam?.abbreviation?.toUpperCase() ?? "CHE",
          label: "HOME",
          logo: homeTeam?.logo,
          color: homeTeam?.color
        },
        away: {
          name: awayName,
          shortName: awayTeam?.abbreviation?.toUpperCase() ?? "TOT",
          label: "AWAY",
          logo: awayTeam?.logo,
          color: awayTeam?.color
        }
      },
      probabilityData,
      events: matchConfig
        ? buildConfiguredGoalEvents(probabilityData, matchConfig.goals)
        : buildMarketEvents(probabilityData, { home: homeName, away: awayName, draw: "平局" })
    };

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown Polymarket timeline error" },
      { status: 500 }
    );
  }
}
