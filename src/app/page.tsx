"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchStore } from "@/store/search";
import { TravelerCard } from "@/components/TravelerCard";
import { VenueTypeSelector } from "@/components/VenueTypeSelector";
import { RecentSpots } from "@/components/RecentSpots";
import { Icon } from "@/components/Icon";
import { saveRecentSpot } from "@/lib/recent-spots";
import type { SearchError } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const {
    participants,
    venueType,
    isSearching,
    error,
    addParticipant,
    removeParticipant,
    updateParticipant,
    setVenueType,
    setSearching,
    setResult,
    setError,
    canSearch,
  } = useSearchStore();
  const [degradedWarning, setDegradedWarning] = useState(false);

  const handleSearch = async () => {
    if (!canSearch()) return;

    setSearching(true);
    setError(null);
    setDegradedWarning(false);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participants, venueType }),
      });

      const data = await res.json();

      // Check for structured error in response
      if (data.error) {
        setError(data.error as SearchError);
        return;
      }

      // Check for degraded flag (warning, not error)
      if (data.degraded) {
        setDegradedWarning(true);
      }

      setResult(data);
      saveRecentSpot(data);
      router.push(`/results/${data.shortCode}`);
    } catch (err) {
      setError({
        type: "API_ERROR",
        message: "Something went wrong reaching our maps. Please try again.",
      });
    } finally {
      setSearching(false);
    }
  };

  const getErrorMessage = (error: SearchError): string => {
    switch (error.type) {
      case "NO_VENUES":
        return `No ${venueType === "coworking" ? "coworking spaces" : venueType === "cafe" ? "cafes" : venueType === "restaurant" ? "restaurants" : venueType === "bar" ? "bars" : venueType === "park" ? "parks" : "libraries"} found near your group. Try a different type or add more people.`;
      case "API_ERROR":
        return "Something went wrong reaching our maps. Please try again.";
      case "RATE_LIMITED":
        return "Too many searches — please wait a moment and try again.";
      case "DEGRADED":
        return "Results may be less accurate due to limited data availability.";
      default:
        return error.message;
    }
  };

  const allLocationsSet = participants.every(
    (p) => p.originLat !== null && p.originLng !== null
  );

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-4 pb-2">
        <h2 className="text-lg font-bold font-headline text-primary">
          Where2Meet<span className="text-secondary">.Me</span>
        </h2>
        <button className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
          <Icon name="person" size={20} className="text-on-primary" />
        </button>
      </header>

      {/* Hero */}
      <section className="px-5 pt-4 pb-6">
        <h1 className="text-[3.5rem] font-extrabold font-headline text-on-surface leading-[1.1] tracking-[-0.02em]">
          Meet in the{" "}
          <span className="text-primary italic">middle</span>
          <span className="text-secondary">.Me</span>
        </h1>
        <p className="text-sm text-on-surface-variant mt-2 font-body leading-relaxed">
          Drop your locations and find a great spot that's easy for everyone.
        </p>
      </section>

      {/* Traveler Cards */}
      <section className="px-5 space-y-3">
        {participants.map((p, i) => (
          <TravelerCard
            key={p.id}
            participant={p}
            index={i}
            canRemove={participants.length > 2}
            onUpdate={updateParticipant}
            onRemove={removeParticipant}
          />
        ))}

        {participants.length < 6 && (
          <button
            onClick={addParticipant}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-surface-low text-on-surface-variant hover:bg-surface-high transition-colors text-sm font-medium font-body"
          >
            <Icon name="add" size={20} />
            Add person
          </button>
        )}
      </section>

      {/* Venue Type */}
      <section className="px-5 pt-6 space-y-2">
        <h3 className="text-sm font-bold text-primary uppercase tracking-widest font-body">
          Select Venue Type
        </h3>
        <VenueTypeSelector selected={venueType} onSelect={setVenueType} />
      </section>

      {/* Recent Spots */}
      <RecentSpots />

      {/* Search CTA */}
      <section className="px-5 pt-6 pb-8">
        <button
          onClick={handleSearch}
          disabled={!allLocationsSet || isSearching}
          className="w-full py-6 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-headline font-extrabold text-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={isSearching ? "Finding great spots" : "Find a great spot"}
        >
          {isSearching ? (
            <>
              <Icon name="progress_activity" size={20} className="animate-spin" />
              Finding great spots...
            </>
          ) : (
            <>
              Find a Great Spot
              <Icon name="east" size={20} />
            </>
          )}
        </button>

        {error && (
          <p className="text-sm text-parity-bad text-center mt-3 font-body" role="alert" aria-live="polite">
            {getErrorMessage(error)}
          </p>
        )}

        {degradedWarning && (
          <div className="mt-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-2">
              <Icon name="warning" size={18} className="text-amber-600 mt-0.5" />
              <p className="text-xs text-amber-700 font-body leading-relaxed">
                Travel time estimates are approximate due to limited routing data. Results may be less accurate than usual.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
