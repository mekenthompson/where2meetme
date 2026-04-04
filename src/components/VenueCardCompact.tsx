"use client";

import { Icon } from "./Icon";
import type { VenueResult, Participant } from "@/lib/types";

interface VenueCardCompactProps {
  venue: VenueResult;
  participants: Participant[];
  onSelect: (venue: VenueResult) => void;
}

function getMatchLabel(score: number): { text: string; color: string } {
  if (score >= 95) return { text: "Perfect", color: "text-parity-good" };
  if (score >= 85) return { text: "Great", color: "text-parity-good" };
  if (score >= 70) return { text: "Good", color: "text-parity-ok" };
  return { text: "Decent", color: "text-parity-ok" };
}

function formatTime(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

export function VenueCardCompact({ venue, participants, onSelect }: VenueCardCompactProps) {
  const { text: matchText, color: matchColor } = getMatchLabel(venue.fairnessScore);

  const travelTimes = participants
    .filter((p) => venue.travelTimes[p.id] != null)
    .map((p) => ({
      label: p.label,
      seconds: venue.travelTimes[p.id]!,
    }));

  const maxTime = Math.max(...travelTimes.map((t) => t.seconds));
  const minTime = Math.min(...travelTimes.map((t) => t.seconds));

  return (
    <button
      onClick={() => onSelect(venue)}
      className="w-full text-left bg-surface-lowest rounded-3xl overflow-hidden shadow-ambient hover:shadow-lg transition-all active:scale-[0.98] grid grid-cols-[112px_1fr] h-28"
    >
      {venue.photoReference && (
        <div className="overflow-hidden">
          <img
            src={`/api/places/photo?ref=${encodeURIComponent(venue.photoReference)}`}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-primary leading-tight font-headline">
              {venue.name}
            </h3>
          </div>
          {venue.rating && (
            <div className="flex items-center gap-1 mt-1">
              <Icon name="star" size={12} filled className="text-amber-500" />
              <span className="text-xs font-semibold">
                {venue.rating}
                {venue.userRatingsTotal && ` (${(venue.userRatingsTotal / 1000).toFixed(1)}k)`}
              </span>
            </div>
          )}
        </div>

        <div className="bg-surface-low p-2 rounded-xl flex items-center justify-between px-3">
          <div className="text-[10px] font-bold font-body">
            {travelTimes.map((t, i) => {
              const pct = maxTime > 0 ? (t.seconds / maxTime) * 100 : 0;
              const deltaMin = Math.abs(t.seconds - minTime) / 60;
              const color =
                deltaMin <= 5
                  ? "text-parity-good"
                  : deltaMin <= 10
                    ? "text-parity-ok"
                    : "text-parity-bad";

              return (
                <div key={t.label} className={color}>
                  {t.label.toUpperCase()}: {formatTime(t.seconds)}
                </div>
              );
            })}
          </div>
          <div className={`flex items-center gap-1 bg-secondary/10 px-2 py-1 rounded-full ${matchColor}`}>
            <Icon name="thumb_up" size={14} />
            <span className="text-[10px] font-black">{matchText.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
