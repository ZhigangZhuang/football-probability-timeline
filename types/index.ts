export type ProbabilityKey = "homeWin" | "draw" | "awayWin";

export type ProbabilityPoint = {
  minute: number;
  label: string;
  homeWin: number;
  draw: number;
  awayWin: number;
};

export type MatchEvent = {
  id: string;
  minute: number;
  type: "goal" | "penalty" | "red_card" | "winner";
  title: string;
  subtitle: string;
  description: string;
  avatarUrl?: string;
  team: "home" | "away";
  color: "green" | "yellow" | "red";
  probabilityKey: ProbabilityKey;
  cardPosition: {
    left: string;
    top: string;
  };
};

export type TeamInfo = {
  name: string;
  shortName: string;
  label: "HOME" | "AWAY";
  logo?: string;
  color?: string;
};

export type MatchTimelinePayload = {
  source: "mock" | "polymarket";
  sourceUrl?: string;
  slug?: string;
  title: string;
  score: string;
  status: string;
  dataMappingNote?: string;
  teams: {
    home: TeamInfo;
    away: TeamInfo;
  };
  probabilityData: ProbabilityPoint[];
  events: MatchEvent[];
};

export type ThemeName = "classic" | "night" | "mint";

export type ThemePalette = {
  name: ThemeName;
  label: string;
  background: string;
  surface: string;
  accent: string;
  muted: string;
};
