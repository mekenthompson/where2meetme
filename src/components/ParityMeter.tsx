"use client";

interface ParityMeterProps {
  travelTimes: { label: string; seconds: number }[];
}

function formatTime(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

export function ParityMeter({ travelTimes }: ParityMeterProps) {
  if (travelTimes.length === 0) return null;

  const maxTime = Math.max(...travelTimes.map((t) => t.seconds));
  const minTime = Math.min(...travelTimes.map((t) => t.seconds));

  // Side-by-side layout for exactly 2 participants
  if (travelTimes.length === 2) {
    const [left, right] = travelTimes;
    const total = left.seconds + right.seconds;
    const leftPct = total > 0 ? (left.seconds / total) * 100 : 50;
    const rightPct = 100 - leftPct;

    return (
      <div className="space-y-3">
        {/* Labels row */}
        <div className="flex items-center justify-between text-sm font-body">
          <span className="flex items-center gap-1.5 font-medium text-on-surface">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0"></span>
            {left.label}: {formatTime(left.seconds)}
          </span>
          <span className="flex items-center gap-1.5 font-medium text-on-surface">
            {right.label}: {formatTime(right.seconds)}
            <span className="w-2.5 h-2.5 rounded-full bg-secondary shrink-0"></span>
          </span>
        </div>

        {/* Single bar with two halves */}
        <div className="relative h-3 bg-surface-high rounded-full overflow-hidden flex">
          <div
            className="h-full bg-primary/70 rounded-l-full transition-all duration-500"
            style={{ width: `${Math.max(leftPct, 8)}%` }}
          />
          <div
            className="h-full bg-secondary/70 rounded-r-full transition-all duration-500"
            style={{ width: `${Math.max(rightPct, 8)}%` }}
          />
          {/* Center divider */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-surface-lowest shadow-sm flex items-center justify-center border-2 border-surface-high">
            <span className="text-[8px] text-on-surface-variant font-bold">⇌</span>
          </div>
        </div>
      </div>
    );
  }

  // Default per-person bar layout for 3+ participants
  return (
    <div className="space-y-2">
      {travelTimes.map((t) => {
        const pct = maxTime > 0 ? (t.seconds / maxTime) * 100 : 0;
        const deltaMin = Math.abs(t.seconds - minTime) / 60;
        const color =
          deltaMin <= 5
            ? "bg-parity-good"
            : deltaMin <= 10
              ? "bg-parity-ok"
              : "bg-parity-bad";

        return (
          <div key={t.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-body">
              <span className="font-medium text-on-surface">{t.label}</span>
              <span className="text-on-surface-variant">{formatTime(t.seconds)}</span>
            </div>
            <div className="h-2 bg-surface-high rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${color}`}
                style={{ width: `${Math.max(pct, 4)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
