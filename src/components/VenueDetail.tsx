"use client";

import { Icon } from "./Icon";
import { ParityMeter } from "./ParityMeter";
import { VenueMap } from "./VenueMap";
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
    const text = `Let's meet at ${venue.name} — it's easy for everyone to get to! ${url}`;

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
            className="w-full h-[300px] object-cover"
          />
        ) : (
          <div className="w-full h-[300px] bg-surface-low flex items-center justify-center">
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

        {/* Match badge */}
        <div className="absolute top-4 right-4 bg-surface-lowest/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
          <span className="text-sm font-bold text-secondary font-headline">
            {Math.round(venue.fairnessScore)}%
          </span>
          <span className="text-xs text-on-surface-variant">Match</span>
        </div>

        {/* Photo count badge */}
        <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
          <Icon name="photo_library" size={14} />
          Photos
        </div>
      </div>

      {/* Category + Rating row */}
      <section className="px-5 pt-4 flex items-center gap-3 flex-wrap">
        <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
          Cafe
        </span>
        {venue.rating && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon
                  key={i}
                  name="star"
                  size={14}
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
                ({venue.userRatingsTotal.toLocaleString()})
              </span>
            )}
          </div>
        )}
      </section>

      {/* Venue info */}
      <section className="px-5 pt-3 space-y-1.5">
        <h1 className="text-3xl md:text-4xl font-extrabold font-headline text-primary tracking-tight">
          {venue.name}
        </h1>
        <p className="text-sm text-on-surface-variant font-body flex items-center gap-1">
          <Icon name="location_on" size={16} className="text-on-surface-variant/60 shrink-0" />
          {venue.address}
        </p>
      </section>

      {/* Favorite + Bookmark actions */}
      <section className="px-5 pt-3 flex gap-3">
        <button className="bg-surface-high p-3 rounded-xl hover:bg-surface-highest transition-colors">
          <Icon name="favorite" size={20} />
        </button>
        <button className="bg-surface-high p-3 rounded-xl hover:bg-surface-highest transition-colors">
          <Icon name="bookmark" size={20} />
        </button>
      </section>

      {/* Map */}
      <section className="px-5 pt-5">
        <VenueMap
          venueLat={venue.lat}
          venueLng={venue.lng}
          venueName={venue.name}
          participants={participants}
        />
      </section>

      {/* Travel times Card */}
      <section className="mx-5 mt-5 bg-surface-low rounded-xl p-6 shadow-ambient space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="schedule" size={22} className="text-secondary" />
            <h3 className="text-xl font-bold font-headline text-primary">
              Travel times
            </h3>
          </div>
          <span className="bg-parity-good/10 text-parity-good px-3 py-1 rounded-full text-xs font-bold">
            Great for everyone
          </span>
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

      {/* CTA Card */}
      <section className="px-5 pt-6 pb-8 mt-auto">
        <div className="bg-primary p-6 rounded-2xl text-white space-y-4 shadow-elevated">
          <h3 className="text-xl font-bold font-headline text-center">
            Ready to meet?
          </h3>

          <button
            onClick={handleDirections}
            className="w-full py-4 flex items-center justify-center gap-2 text-base font-semibold font-headline bg-white text-primary rounded-full hover:bg-white/90 transition-colors"
          >
            <Icon name="directions" size={20} />
            Get Directions
          </button>

          <button
            onClick={handleShare}
            className="w-full py-4 flex items-center justify-center gap-2 text-base font-semibold font-headline bg-transparent text-white border border-white/30 rounded-full hover:bg-white/10 transition-colors"
          >
            <Icon name="share" size={20} />
            Share this spot
          </button>

          <a
            href={`https://www.google.com/maps/place/?q=place_id:${venue.placeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-sm text-white/80 font-medium font-body hover:text-white hover:underline pt-1"
          >
            Google Maps Details
          </a>
        </div>
      </section>
    </div>
  );
}
