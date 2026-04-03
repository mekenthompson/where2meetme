"use client";

import { Icon } from "./Icon";
import { ParityMeter } from "./ParityMeter";
import type { VenueResult, Participant } from "@/lib/types";

interface VenueCardProps {
  venue: VenueResult;
  participants: Participant[];
  onSelect: (venue: VenueResult) => void;
  rank: number;
}

function getFairnessLabel(score: number): { text: string; color: string } {
  if (score >= 95) return { text: "Perfect", color: "text-parity-good" };
  if (score >= 85) return { text: "Great", color: "text-parity-good" };
  if (score >= 70) return { text: "Good", color: "text-parity-ok" };
  return { text: "Fair", color: "text-parity-ok" };
}

export function VenueCard({ venue, participants, onSelect, rank }: VenueCardProps) {
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
      className="w-full text-left bg-surface-lowest rounded-2xl overflow-hidden shadow-ambient hover:shadow-lg transition-all active:scale-[0.98]"
    >
      {venue.photoReference && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={`/api/places/photo?ref=${encodeURIComponent(venue.photoReference)}`}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 bg-surface-lowest/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
            <span className={`text-sm font-bold font-headline ${fairnessColor}`}>
              {Math.round(venue.fairnessScore)}%
            </span>
            <span className="text-xs text-on-surface-variant">Match</span>
          </div>
          {rank <= 3 && (
            <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm text-on-primary rounded-full w-7 h-7 flex items-center justify-center">
              <span className="text-xs font-bold font-headline">{rank}</span>
            </div>
          )}
        </div>
      )}

      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-on-surface font-headline leading-tight">
              {venue.name}
            </h3>
            <span className={`text-xs font-semibold whitespace-nowrap ${fairnessColor}`}>
              {fairnessText}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">{venue.shortAddress}</p>
          {venue.rating && (
            <div className="flex items-center gap-1 mt-1">
              <Icon name="star" size={14} filled className="text-amber-500" />
              <span className="text-xs font-medium text-on-surface">{venue.rating}</span>
              {venue.userRatingsTotal && (
                <span className="text-xs text-on-surface-variant">
                  ({venue.userRatingsTotal.toLocaleString()})
                </span>
              )}
            </div>
          )}
        </div>

        <ParityMeter travelTimes={travelTimes} />
      </div>
    </button>
  );
}
