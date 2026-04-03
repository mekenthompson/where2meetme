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
