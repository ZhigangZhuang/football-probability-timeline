const items = [
  { label: "主胜概率", color: "bg-emerald-500" },
  { label: "平局概率", color: "bg-yellow-400" },
  { label: "客胜概率", color: "bg-red-500" }
];

export function Legend() {
  return (
    <div className="grid grid-cols-3 gap-1.5 rounded-full border border-slate-200/80 bg-white/75 px-2 py-1.5 shadow-sm backdrop-blur">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-center gap-1.5 text-center text-[10px] font-black text-slate-600">
          <span className={`h-1.5 w-5 rounded-full ${item.color}`} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
