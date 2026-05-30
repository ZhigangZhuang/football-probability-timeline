"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { motion } from "framer-motion";
import { Controls } from "@/components/Controls";
import { EventTimeline } from "@/components/EventTimeline";
import { MatchHeader } from "@/components/MatchHeader";
import { ProbabilityChart } from "@/components/ProbabilityChart";
import { defaultTeams, matchEvents, probabilityData, themes } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import type { MatchEvent, MatchTimelinePayload, ProbabilityPoint, TeamInfo } from "@/types";

const PLAYBACK_DURATION_MS = 20_000;
const MAX_MINUTE = 90;
const DEFAULT_POLYMARKET_SLUG = "ucl-psg-ars-2026-05-30";

const fallbackPositions = [
  { left: "5%", top: "12%" },
  { left: "27%", top: "3%" },
  { left: "62%", top: "18%" },
  { left: "54%", top: "68%" }
];

function normalizeUploadedEvents(value: unknown): MatchEvent[] | null {
  if (!Array.isArray(value)) return null;

  return value
    .filter((item): item is Partial<MatchEvent> => Boolean(item && typeof item === "object"))
    .map((item, index): MatchEvent => {
      const team: MatchEvent["team"] = item.team === "away" ? "away" : "home";
      const color: MatchEvent["color"] =
        item.color === "yellow" || item.color === "red" || item.color === "green" ? item.color : "green";
      const type: MatchEvent["type"] =
        item.type === "penalty" || item.type === "red_card" || item.type === "winner" || item.type === "goal"
          ? item.type
          : "goal";
      const probabilityKey: MatchEvent["probabilityKey"] =
        item.probabilityKey === "draw" || item.probabilityKey === "awayWin" || item.probabilityKey === "homeWin"
          ? item.probabilityKey
          : "homeWin";

      return {
        id: typeof item.id === "string" ? item.id : `uploaded-${index}`,
        minute: typeof item.minute === "number" ? Math.min(MAX_MINUTE, Math.max(0, Math.round(item.minute))) : 0,
        type,
        title: typeof item.title === "string" ? item.title : "关键事件",
        subtitle: typeof item.subtitle === "string" ? item.subtitle : "比赛节点",
        description: typeof item.description === "string" ? item.description : "概率出现明显变化",
        scoreAfter: typeof item.scoreAfter === "string" ? item.scoreAfter : undefined,
        avatarUrl: typeof item.avatarUrl === "string" ? item.avatarUrl : undefined,
        team,
        color,
        probabilityKey,
        cardPosition:
          item.cardPosition &&
          typeof item.cardPosition.left === "string" &&
          typeof item.cardPosition.top === "string"
            ? item.cardPosition
            : fallbackPositions[index % fallbackPositions.length]
      };
    })
    .sort((a, b) => a.minute - b.minute);
}

function downloadJson(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: "application/json;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function scoreAtMinute(events: MatchEvent[], finalScore: string, currentMinute: number) {
  const latestScoringEvent = events
    .filter((event) => event.scoreAfter && event.minute <= currentMinute)
    .sort((a, b) => b.minute - a.minute)[0];

  if (latestScoringEvent?.scoreAfter) return latestScoringEvent.scoreAfter;
  if (currentMinute >= MAX_MINUTE) return finalScore;
  return "0-0";
}

export default function Home() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showEvents, setShowEvents] = useState(true);
  const [isRecordMode] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("record") === "1"
  );
  const [themeIndex, setThemeIndex] = useState(0);
  const [events, setEvents] = useState<MatchEvent[]>(matchEvents);
  const [chartData, setChartData] = useState<ProbabilityPoint[]>(probabilityData);
  const [teams, setTeams] = useState<{ home: TeamInfo; away: TeamInfo }>(defaultTeams);
  const [score, setScore] = useState("2-1");

  const theme = themes[themeIndex];
  const isDarkTheme = theme.name === "night";
  const liveScore = scoreAtMinute(events, score, currentMinute);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPolymarketTimeline() {
      try {
        const response = await fetch(`/api/polymarket-timeline?slug=${DEFAULT_POLYMARKET_SLUG}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Timeline request failed: ${response.status}`);
        }

        const payload = (await response.json()) as MatchTimelinePayload;
        setChartData(payload.probabilityData);
        setEvents(payload.events);
        setTeams(payload.teams);
        setScore(payload.score);
        setCurrentMinute(0);
        setIsPlaying(true);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
        }
      }
    }

    loadPolymarketTimeline();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.max(80, Math.round(PLAYBACK_DURATION_MS / MAX_MINUTE));
    const interval = window.setInterval(() => {
      setCurrentMinute((minute) => {
        if (minute >= MAX_MINUTE) {
          window.clearInterval(interval);
          setIsPlaying(false);
          return MAX_MINUTE;
        }

        return minute + 1;
      });
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [isPlaying]);

  const handleReplay = useCallback(() => {
    setCurrentMinute(0);
    setIsPlaying(true);
  }, []);

  const handleSeek = useCallback((minute: number) => {
    setCurrentMinute(minute);
    if (minute >= MAX_MINUTE) setIsPlaying(false);
  }, []);

  const handleExportPng = useCallback(async () => {
    if (!frameRef.current) return;

    const dataUrl = await toPng(frameRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#f8fafc"
    });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `football-probability-${currentMinute}m.png`;
    link.click();
  }, [currentMinute]);

  const handleExportStoryboard = useCallback(() => {
    const storyboard = [
      {
        time: "00'",
        scene: "开场",
        voiceover: "比赛开始，胜平负三条概率线从初始预期开启。"
      },
      ...events.map((event) => ({
        time: `${event.minute}'`,
        scene: event.title,
        voiceover: `${event.title}，${event.subtitle}，${event.description}，市场预期随之变化。`
      })),
      {
        time: "90+",
        scene: "终场",
        voiceover: "终场阶段，主胜、平局、客胜的最终概率标签出现，完整时间轴收束。"
      }
    ];

    downloadJson("football-probability-storyboard.json", storyboard);
  }, [events]);

  const handleUploadEvents = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const parsed = normalizeUploadedEvents(JSON.parse(text));

      if (parsed?.length) {
        setEvents(parsed);
        setCurrentMinute(0);
        setIsPlaying(true);
      }
    } catch {
      window.alert("事件 JSON 格式不正确，请检查后再上传。");
    }
  }, []);

  return (
    <main
      className={cn(
        "flex min-h-screen flex-col items-center justify-center lg:flex-row",
        isRecordMode ? "gap-0 bg-black p-0" : "gap-5 px-6 py-4 lg:px-10"
      )}
    >
      <motion.div
        ref={frameRef}
        className={cn(
          "relative overflow-hidden bg-gradient-to-b px-6 py-5 shadow-poster ring-1 ring-white/20",
          isRecordMode ? "record-shell" : "phone-shell",
          theme.background
        )}
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55 }}
      >
        <div className="field-texture absolute inset-0 opacity-95" />

        <div className="relative z-10 grid h-full grid-cols-[300px_minmax(0,1fr)] gap-5">
          <aside className="flex min-h-0 flex-col gap-3">
            <MatchHeader teams={teams} score={liveScore} currentMinute={currentMinute} isDark={isDarkTheme} />
            <EventTimeline events={events} currentMinute={currentMinute} />
          </aside>

          <ProbabilityChart
            data={chartData}
            events={events}
            currentMinute={currentMinute}
            showEvents={showEvents}
          />
        </div>
      </motion.div>

      {!isRecordMode && (
        <Controls
          currentMinute={currentMinute}
          isPlaying={isPlaying}
          showEvents={showEvents}
          themeLabel={theme.label}
          teams={teams}
          onReplay={handleReplay}
          onPlayPause={() => setIsPlaying((playing) => !playing)}
          onToggleEvents={() => setShowEvents((visible) => !visible)}
          onNextTheme={() => setThemeIndex((index) => (index + 1) % themes.length)}
          onSeek={handleSeek}
          onExportPng={handleExportPng}
          onExportStoryboard={handleExportStoryboard}
          onUploadEvents={handleUploadEvents}
          onHomeTeamChange={(name) =>
            setTeams((value) => ({
              ...value,
              home: { ...value.home, name: name || "主队" }
            }))
          }
          onAwayTeamChange={(name) =>
            setTeams((value) => ({
              ...value,
              away: { ...value.away, name: name || "客队" }
            }))
          }
        />
      )}
    </main>
  );
}
