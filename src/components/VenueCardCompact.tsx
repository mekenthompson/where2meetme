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
      className="w-full text-left bg-surface-lowest rounded-[24px] overflow-hidden shadow-[0_4px_24px_rgba(0,6,102,0.04)] hover:shadow-lg transition-all active:scale-[0.98] grid grid-cols-[112px_1fr] h-48"
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
            <Icon name="favorite" size={18} className="text-on-surface-variant" />
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
              const color = i % 2 === 0 ? "text-primary" : "text-primary-container";

              return (
                <div key={t.label} className={color}>
                  {t.label.toUpperCase()}: {formatTime(t.seconds)}
                </div>
              );
            })}
          </div>
          <div className={`flex items-center gap-1 bg-secondary/10 px-2 py-1 rounded-full ${matchColor}`}>
            <Icon name="balance" size={14} />
            <span className="text-[10px] font-black">{matchText.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
