"use client";

import { useSearchStore } from "@/store/search";
import { VenueCardHero } from "@/components/VenueCardHero";
import { VenueCardCompact } from "@/components/VenueCardCompact";
import { VenueDetail } from "@/components/VenueDetail";
import { ResultsMap } from "@/components/ResultsMap";
import { Icon } from "@/components/Icon";
import { FilterChips, type FilterType } from "@/components/FilterChips";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import type { VenueResult } from "@/lib/types";

export default function ResultsPage() {
  const router = useRouter();
  const { result } = useSearchStore();
  const [selectedVenue, setSelectedVenue] = useState<VenueResult | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

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

  const filteredVenues = useMemo(() => {
    const venues = [...result.venues];

    switch (activeFilter) {
      case "topRated":
        return venues.sort((a, b) => {
          const ratingA = a.rating ?? 0;
          const ratingB = b.rating ?? 0;
          return ratingB - ratingA;
        });

      case "closest":
        return venues.sort((a, b) => {
          const avgTimeA = Object.values(a.travelTimes).reduce((sum, t) => sum + t, 0) / Object.values(a.travelTimes).length;
          const avgTimeB = Object.values(b.travelTimes).reduce((sum, t) => sum + t, 0) / Object.values(b.travelTimes).length;
          return avgTimeA - avgTimeB;
        });

      case "bestMatch":
      case "all":
      default:
        // Already sorted by fairness score (default sort from API)
        return venues;
    }
  }, [result.venues, activeFilter]);

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-4 pb-2">
        <button
          onClick={() => router.push("/")}
          className="w-9 h-9 rounded-full bg-surface-low flex items-center justify-center"
        >
          <Icon name="arrow_back" size={20} />
        </button>
        <div className="bg-surface-low px-4 py-2 rounded-full flex items-center gap-2">
          <Icon name="location_on" size={16} className="text-primary" />
          <span className="text-sm font-semibold text-on-surface font-headline">
            {result.participants.map(p => p.label).join(" • ")}
          </span>
        </div>
        <button
          onClick={async () => {
            const url = `${window.location.origin}/m/${result.shortCode}`;
            if (navigator.share) {
              await navigator.share({
                title: "Where2Meet.Me — Great Spot for Everyone",
                text: `Check out this great meeting spot for ${result.participants.length} people!`,
                url,
              });
            } else {
              await navigator.clipboard.writeText(url);
              alert("Link copied to clipboard!");
            }
          }}
          className="w-9 h-9 rounded-full bg-surface-low flex items-center justify-center"
        >
          <Icon name="lock" size={18} className="text-on-surface-variant" />
        </button>
      </header>

      {/* Interactive map */}
      <section className="w-full">
        <ResultsMap
          midpointLat={result.midpointLat}
          midpointLng={result.midpointLng}
          participants={result.participants}
          venues={result.venues}
        />
      </section>

      {/* Results header */}
      <section className="px-5 pt-5 pb-3">
        <h1 className="text-3xl font-extrabold tracking-tight font-headline text-primary">
          {venueTypeLabels[result.venueType] ?? "Places"} for your group
        </h1>
        <p className="text-sm text-on-surface-variant mt-1 font-body">
          Easy for {result.participants.length} people &middot;{" "}
          {result.venues.length} venues found
        </p>
      </section>

      {/* Filter chips */}
      <section className="px-5 pb-4">
        <FilterChips selected={activeFilter} onSelect={setActiveFilter} />
      </section>

      {/* Venue cards */}
      <section className="px-5 pb-6 space-y-6">
        {filteredVenues.map((venue, i) => {
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
                title: "Where2Meet.Me — Great Spot for Everyone",
                text: `Check out this great meeting spot for ${result.participants.length} people!`,
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
