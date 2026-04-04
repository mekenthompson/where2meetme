"use client";

import { useRouter } from "next/navigation";
import { useSearchStore } from "@/store/search";
import { TravelerCard } from "@/components/TravelerCard";
import { VenueTypeSelector } from "@/components/VenueTypeSelector";
import { Icon } from "@/components/Icon";

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

  const handleSearch = async () => {
    if (!canSearch()) return;

    setSearching(true);
    setError(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participants, venueType }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Search failed");
      }

      const result = await res.json();
      setResult(result);
      router.push(`/results/${result.shortCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSearching(false);
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
          Where2Meet.Me
        </h2>
        <button className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
          <Icon name="person" size={20} className="text-on-primary" />
        </button>
      </header>

      {/* Hero */}
      <section className="px-5 pt-4 pb-6">
        <h1 className="text-[3.5rem] font-extrabold font-headline text-on-surface leading-[1.1] tracking-[-0.02em]">
          Equality in{" "}
          <span className="text-primary italic">every mile</span>
          <span className="text-secondary">.Me</span>
        </h1>
        <p className="text-sm text-on-surface-variant mt-2 font-body leading-relaxed">
          Input your locations to find the mathematically perfect meeting spot.
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
        <h3 className="text-xs font-medium text-on-surface-variant uppercase tracking-wider font-body">
          Select Venue Type
        </h3>
        <VenueTypeSelector selected={venueType} onSelect={setVenueType} />
      </section>

      {/* Search CTA */}
      <section className="px-5 pt-6 pb-8">
        <button
          onClick={handleSearch}
          disabled={!allLocationsSet || isSearching}
          className="btn-primary w-full py-5 flex items-center justify-center gap-2 text-lg font-semibold font-headline disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSearching ? (
            <>
              <Icon name="progress_activity" size={20} className="animate-spin" />
              Finding fair midpoint...
            </>
          ) : (
            <>
              Find the Fair Midpoint
              <Icon name="arrow_forward" size={20} />
            </>
          )}
        </button>

        {error && (
          <p className="text-sm text-parity-bad text-center mt-3 font-body">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
