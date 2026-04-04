"use client";

import { useSearchStore } from "@/store/search";
import { VenueCardHero } from "@/components/VenueCardHero";
import { VenueCardCompact } from "@/components/VenueCardCompact";
import { VenueDetail } from "@/components/VenueDetail";
import { Icon } from "@/components/Icon";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { VenueResult } from "@/lib/types";

export default function ResultsPage() {
  const router = useRouter();
  const { result } = useSearchStore();
  const [selectedVenue, setSelectedVenue] = useState<VenueResult | null>(null);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-4 px-5">
        <Icon name="search_off" size={48} className="text-on-surface-variant" />
        <p className="text-on-surface-variant text-center font-body">
          No results found. Try a new search.
        </p>
        <button
          onClick={() => router.push("/")}
          className="btn-primary px-6 py-3 text-sm font-semibold font-headline"
        >
          New Search
        </button>
      </div>
    );
  }

  if (selectedVenue) {
    return (
      <VenueDetail
        venue={selectedVenue}
        participants={result.participants}
        shortCode={result.shortCode}
        onBack={() => setSelectedVenue(null)}
      />
    );
  }

  const venueTypeLabels: Record<string, string> = {
    cafe: "Cafes",
    restaurant: "Restaurants",
    bar: "Bars",
    park: "Parks",
    library: "Libraries",
    coworking: "Coworking spaces",
  };

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-4 pb-2">
        <button
          onClick={() => router.push("/")}
          className="w-9 h-9 rounded-full bg-surface-low flex items-center justify-center"
        >
          <Icon name="arrow_back" size={20} />
        </button>
        <div>
          <h2 className="text-lg font-bold font-headline text-primary">
            Where2Meet.Me
          </h2>
        </div>
      </header>

      {/* Map placeholder */}
      <section className="relative h-48 bg-surface-low mx-5 rounded-2xl overflow-hidden flex items-center justify-center">
        <div className="text-center space-y-2">
          <Icon name="map" size={40} className="text-on-surface-variant/30" />
          <p className="text-xs text-on-surface-variant">
            Interactive map coming soon
          </p>
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-xs text-secondary font-medium">Midpoint found</span>
          </div>
        </div>

        {/* Participant markers overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1">
          {result.participants.map((p) => (
            <span
              key={p.id}
              className="bg-surface-lowest/90 backdrop-blur-sm text-xs px-2 py-0.5 rounded-full text-on-surface font-medium"
            >
              {p.label}
            </span>
          ))}
        </div>
      </section>

      {/* Results header */}
      <section className="px-5 pt-5 pb-3">
        <h1 className="text-2xl font-bold font-headline text-on-surface">
          {venueTypeLabels[result.venueType] ?? "Places"} near the midpoint
        </h1>
        <p className="text-sm text-on-surface-variant mt-1 font-body">
          Balanced for {result.participants.length} travelers &middot;{" "}
          {result.venues.length} venues found
        </p>
      </section>

      {/* Venue cards */}
      <section className="px-5 pb-6 space-y-6">
        {result.venues.map((venue, i) => {
          if (i === 0) {
            return (
              <VenueCardHero
                key={venue.placeId}
                venue={venue}
                participants={result.participants}
                onSelect={setSelectedVenue}
              />
            );
          }
          return (
            <VenueCardCompact
              key={venue.placeId}
              venue={venue}
              participants={result.participants}
              onSelect={setSelectedVenue}
            />
          );
        })}
      </section>

      {/* FABs */}
      <div className="fixed bottom-6 right-5 flex flex-col gap-3">
        <button
          onClick={async () => {
            const url = `${window.location.origin}/m/${result.shortCode}`;
            if (navigator.share) {
              await navigator.share({
                title: "Where2Meet.Me — Fair Meeting Point",
                text: `Check out this fair meeting spot for ${result.participants.length} people!`,
                url,
              });
            } else {
              await navigator.clipboard.writeText(url);
              alert("Link copied to clipboard!");
            }
          }}
          className="btn-primary w-14 h-14 flex items-center justify-center shadow-ambient"
          style={{ borderRadius: "9999px" }}
        >
          <Icon name="share" size={24} />
        </button>
        <button
          onClick={() => router.push("/")}
          className="w-14 h-14 flex items-center justify-center bg-surface-lowest shadow-ambient rounded-full"
        >
          <Icon name="add" size={24} className="text-primary" />
        </button>
      </div>
    </div>
  );
}
