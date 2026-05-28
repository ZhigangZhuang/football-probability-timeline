import { Activity, Circle } from "lucide-react";

export function Disclaimer() {
  return (
    <footer>
      <div className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/75 px-3 py-1.5 shadow-sm backdrop-blur">
        <div className="flex items-center gap-1.5 text-[12px] font-black text-slate-700">
          <Activity className="h-3.5 w-3.5 text-emerald-500" />
          全场时间轴
        </div>
        <div className="text-[11px] font-bold text-slate-500">实时概率每秒更新</div>
        <div className="flex items-center gap-1.5 text-[12px] font-black text-emerald-600">
          <Circle className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" />
          LIVE
        </div>
      </div>
    </footer>
  );
}
