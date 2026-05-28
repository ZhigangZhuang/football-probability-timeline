"use client";

import {
  Download,
  Eye,
  EyeOff,
  FileJson,
  Pause,
  Palette,
  Play,
  RotateCcw,
  Upload
} from "lucide-react";
import type { TeamInfo } from "@/types";

type ControlsProps = {
  currentMinute: number;
  isPlaying: boolean;
  showEvents: boolean;
  themeLabel: string;
  teams: {
    home: TeamInfo;
    away: TeamInfo;
  };
  onReplay: () => void;
  onPlayPause: () => void;
  onToggleEvents: () => void;
  onNextTheme: () => void;
  onSeek: (minute: number) => void;
  onExportPng: () => void;
  onExportStoryboard: () => void;
  onUploadEvents: (file: File) => void;
  onHomeTeamChange: (name: string) => void;
  onAwayTeamChange: (name: string) => void;
};

export function Controls({
  currentMinute,
  isPlaying,
  showEvents,
  themeLabel,
  teams,
  onReplay,
  onPlayPause,
  onToggleEvents,
  onNextTheme,
  onSeek,
  onExportPng,
  onExportStoryboard,
  onUploadEvents,
  onHomeTeamChange,
  onAwayTeamChange
}: ControlsProps) {
  return (
    <aside className="w-full max-w-[430px] rounded-[26px] border border-white/10 bg-white/10 p-4 text-white shadow-2xl backdrop-blur lg:w-[300px]">
      <div className="mb-4">
        <div className="text-sm font-black">录屏控制台</div>
        <div className="mt-1 text-xs font-semibold text-white/60">动画默认 20 秒走完整场</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onPlayPause}
          className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-3 py-2 text-sm font-black text-white shadow-glowGreen"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" fill="currentColor" />}
          {isPlaying ? "暂停" : "播放"}
        </button>
        <button
          type="button"
          onClick={onReplay}
          className="flex items-center justify-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-black text-slate-950"
        >
          <RotateCcw className="h-4 w-4" />
          重新播放
        </button>
        <button
          type="button"
          onClick={onToggleEvents}
          className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm font-bold text-white"
        >
          {showEvents ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          事件卡片
        </button>
        <button
          type="button"
          onClick={onNextTheme}
          className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm font-bold text-white"
        >
          <Palette className="h-4 w-4" />
          {themeLabel}
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-black/20 p-3">
        <div className="flex items-center justify-between text-xs font-black">
          <span>当前分钟</span>
          <span>{currentMinute >= 90 ? "90+" : `${currentMinute}'`}</span>
        </div>
        <input
          aria-label="拖动查看比赛分钟"
          className="mt-3 h-2 w-full accent-emerald-400"
          type="range"
          min={0}
          max={90}
          value={currentMinute}
          onChange={(event) => onSeek(Number(event.target.value))}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <label className="text-xs font-bold text-white/70">
          主队名称
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-black text-white outline-none placeholder:text-white/40"
            value={teams.home.name}
            maxLength={8}
            onChange={(event) => onHomeTeamChange(event.target.value)}
          />
        </label>
        <label className="text-xs font-bold text-white/70">
          客队名称
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-black text-white outline-none placeholder:text-white/40"
            value={teams.away.name}
            maxLength={8}
            onChange={(event) => onAwayTeamChange(event.target.value)}
          />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onExportPng}
          className="flex items-center justify-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-black text-slate-950"
        >
          <Download className="h-4 w-4" />
          导出 PNG
        </button>
        <button
          type="button"
          onClick={onExportStoryboard}
          className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm font-bold text-white"
        >
          <FileJson className="h-4 w-4" />
          分镜数据
        </button>
        <label className="col-span-2 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/25 bg-white/10 px-3 py-2 text-sm font-bold text-white">
          <Upload className="h-4 w-4" />
          上传事件 JSON
          <input
            className="hidden"
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUploadEvents(file);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>
    </aside>
  );
}
