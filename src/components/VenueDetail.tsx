"use client";

import { Icon } from "./Icon";
import { ParityMeter } from "./ParityMeter";
import type { VenueResult, Participant } from "@/lib/types";

interface VenueDetailProps {
  venue: VenueResult;
  participants: Participant[];
  shortCode: string;
  onBack: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

export function VenueDetail({
  venue,
  participants,
  shortCode,
  onBack,
}: VenueDetailProps) {
  const travelTimes = participants
    .filter((p) => venue.travelTimes[p.id] != null)
    .map((p) => ({
      label: p.label,
      seconds: venue.travelTimes[p.id]!,
    }));

  const handleShare = async () => {
    const url = `${window.location.origin}/m/${shortCode}`;
    const text = `Let's meet at ${venue.name} — it's fair for everyone! ${url}`;

    if (navigator.share) {
      await navigator.share({
        title: `Meet at ${venue.name}`,
        text,
        url,
      });
    } else {
      await navigator.clipboard.writeText(text);
      alert("Link copied to clipboard!");
    }
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}&destination_place_id=${venue.placeId}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Photo hero */}
      <div className="relative">
        {venue.photoReference ? (
          <img
            src={`/api/places/photo?ref=${encodeURIComponent(venue.photoReference)}`}
            alt={venue.name}
            className="w-full h-56 object-cover"
          />
        ) : (
          <div className="w-full h-56 bg-surface-low flex items-center justify-center">
            <Icon name="photo" size={48} className="text-on-surface-variant/30" />
          </div>
        )}

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-surface-lowest/80 backdrop-blur-sm flex items-center justify-center"
        >
          <Icon name="arrow_back" size={20} />
        </button>

        {/* Fairness badge */}
        <div className="absolute top-4 right-4 bg-surface-lowest/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
          <span className="text-sm font-bold text-secondary font-headline">
            {Math.round(venue.fairnessScore)}%
          </span>
          <span className="text-xs text-on-surface-variant">Fair</span>
        </div>
      </div>

      {/* Venue info */}
      <section className="px-5 pt-5 space-y-1">
        <h1 className="text-2xl font-bold font-headline text-on-surface">
          {venue.name}
        </h1>
        <p className="text-sm text-on-surface-variant font-body">{venue.address}</p>
        {venue.rating && (
          <div className="flex items-center gap-1.5 pt-1">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon
                  key={i}
                  name="star"
                  size={16}
                  filled={i < Math.round(venue.rating!)}
                  className={
                    i < Math.round(venue.rating!)
                      ? "text-amber-500"
                      : "text-surface-high"
                  }
                />
              ))}
            </div>
            <span className="text-sm font-medium text-on-surface">
              {venue.rating}
            </span>
            {venue.userRatingsTotal && (
              <span className="text-sm text-on-surface-variant">
                ({venue.userRatingsTotal.toLocaleString()} reviews)
              </span>
            )}
          </div>
        )}
      </section>

      {/* Travel Parity Card */}
      <section className="mx-5 mt-5 bg-surface-lowest rounded-2xl p-5 shadow-ambient space-y-3">
        <div className="flex items-center gap-2">
          <Icon name="balance" size={20} className="text-secondary" />
          <h3 className="text-sm font-semibold font-headline text-on-surface">
            Travel Parity
          </h3>
        </div>
        <ParityMeter travelTimes={travelTimes} />
      </section>

      {/* Quick stats */}
      <section className="px-5 pt-4 flex gap-3">
        {travelTimes.map((t) => (
          <div
            key={t.label}
            className="flex-1 bg-surface-low rounded-xl p-3 text-center"
          >
            <p className="text-xs text-on-surface-variant font-body">{t.label}</p>
            <p className="text-lg font-bold font-headline text-on-surface mt-0.5">
              {formatTime(t.seconds)}
            </p>
          </div>
        ))}
      </section>

      {/* Actions */}
      <section className="px-5 pt-6 pb-8 mt-auto space-y-3">
        <button
          onClick={handleShare}
          className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base font-semibold font-headline"
        >
          <Icon name="share" size={20} />
          Share this spot
        </button>
        <button
          onClick={handleDirections}
          className="w-full py-4 flex items-center justify-center gap-2 text-base font-semibold font-headline bg-surface-high text-on-surface rounded-full hover:bg-surface-highest transition-colors"
        >
          <Icon name="directions" size={20} />
          Get Directions
        </button>
        <a
          href={`https://www.google.com/maps/place/?q=place_id:${venue.placeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-sm text-primary font-medium font-body hover:underline pt-1"
        >
          View on Google Maps
        </a>
      </section>
    </div>
  );
}
