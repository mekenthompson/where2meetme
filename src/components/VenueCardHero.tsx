"use client";

import { Icon } from "./Icon";
import { ParityMeter } from "./ParityMeter";
import type { VenueResult, Participant } from "@/lib/types";

interface VenueCardHeroProps {
  venue: VenueResult;
  participants: Participant[];
  onSelect: (venue: VenueResult) => void;
}

function getFairnessLabel(score: number): { text: string; color: string } {
  if (score >= 95) return { text: "Optimal", color: "text-parity-good" };
  if (score >= 85) return { text: "Great", color: "text-parity-good" };
  if (score >= 70) return { text: "Good", color: "text-parity-ok" };
  return { text: "Fair", color: "text-parity-ok" };
}

export function VenueCardHero({ venue, participants, onSelect }: VenueCardHeroProps) {
  const { text: fairnessText, color: fairnessColor } = getFairnessLabel(venue.fairnessScore);

  const travelTimes = participants
    .filter((p) => venue.travelTimes[p.id] != null)
    .map((p) => ({
      label: p.label,
      seconds: venue.travelTimes[p.id]!,
    }));

  return (
    <button
      onClick={() => onSelect(venue)}
      className="w-full text-left bg-surface-lowest rounded-3xl overflow-hidden shadow-ambient hover:shadow-lg transition-all active:scale-[0.98]"
    >
      {venue.photoReference && (
        <div className="relative h-56 overflow-hidden">
          <img
            src={`/api/places/photo?ref=${encodeURIComponent(venue.photoReference)}`}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-surface-lowest/90 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-1.5 shadow-sm">
            <span className="material-symbols-outlined text-amber-500 text-sm" style={{ fontFamily: "'Material Symbols Outlined Variable', 'Material Symbols Outlined'", fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <span className="text-xs font-bold">{venue.rating}</span>
          </div>
        </div>
      )}

      <div className="p-6 space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-xl font-bold text-primary font-headline leading-tight">
              {venue.name}
            </h3>
            <div className="flex flex-col items-end">
              <span className={`text-lg font-bold ${fairnessColor}`}>
                {Math.round(venue.fairnessScore)}% Match
              </span>
              <span className="text-[10px] uppercase tracking-widest font-black text-secondary">
                {fairnessText}
              </span>
            </div>
          </div>
          <p className="text-sm text-on-surface-variant">{venue.shortAddress}</p>
          {venue.userRatingsTotal && (
            <p className="text-xs text-on-surface-variant mt-1">
              {venue.userRatingsTotal.toLocaleString()} reviews
            </p>
          )}
        </div>

        <div className="bg-surface-low p-4 rounded-2xl space-y-3">
          <ParityMeter travelTimes={travelTimes} />
          {travelTimes.length >= 2 && (
            <div className="flex items-center justify-center gap-2 text-secondary font-bold text-xs">
              <Icon name="verified" size={14} />
              {(() => {
                const times = travelTimes.map((t) => t.seconds);
                const maxTime = Math.max(...times);
                const minTime = Math.min(...times);
                const diffMin = Math.round((maxTime - minTime) / 60);
                return diffMin <= 2
                  ? `Only ${diffMin} minute difference`
                  : `${diffMin} minute difference`;
              })()}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
