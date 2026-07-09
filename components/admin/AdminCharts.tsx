export function AdminBarChart({
  data,
  maxValue,
  className,
}: {
  data: { label: string; value: number }[];
  maxValue?: number;
  className?: string;
}) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={`flex h-48 items-end gap-3 ${className ?? ""}`}>
      {data.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t bg-gradient-to-t from-[#D60D26] to-[#f54a56] transition-all"
              style={{ height: `${(item.value / max) * 100}%`, minHeight: 4 }}
            />
          </div>
          <span className="text-[10px] font-medium text-slate-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function AdminDonutChart({
  segments,
  size = 120,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let cumulative = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox="0 0 42 42" className="-rotate-90">
        {segments.map((seg) => {
          const pct = (seg.value / total) * 100;
          const offset = cumulative;
          cumulative += pct;
          return (
            <circle
              key={seg.label}
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke={seg.color}
              strokeWidth="5"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeDashoffset={-offset}
            />
          );
        })}
      </svg>
      <div className="flex flex-col gap-1.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-slate-600">{seg.label}</span>
            <span className="font-semibold text-slate-800">{seg.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
