import { Maximize2, Pause } from "lucide-react";

type PlaybackBarProps = {
  progress: number;
};

export function PlaybackBar({ progress }: PlaybackBarProps) {
  return (
    <div className="rounded-[18px] bg-slate-950 px-3 py-1.5 text-white shadow-lg">
      <div className="flex items-center gap-3">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-white/10">
          <Pause className="h-4 w-4" fill="currentColor" />
        </div>

        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-emerald-400 shadow-glowGreen" style={{ width: `${progress}%` }} />
        </div>

        <div className="text-[11px] font-black text-white/80">1.0x</div>
        <Maximize2 className="h-4 w-4 text-white/75" />
      </div>
    </div>
  );
}
