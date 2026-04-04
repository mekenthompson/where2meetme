"use client";

import { useState } from "react";
import { VenueCard } from "@/components/VenueCard";
import { VenueDetail } from "@/components/VenueDetail";
import type { VenueResult, Participant } from "@/lib/types";

interface SharedResultsClientProps {
  venues: VenueResult[];
  participants: Participant[];
  shortCode: string;
}

export function SharedResultsClient({
  venues,
  participants,
  shortCode,
}: SharedResultsClientProps) {
  const [selectedVenue, setSelectedVenue] = useState<VenueResult | null>(null);

  if (selectedVenue) {
    return (
      <VenueDetail
        venue={selectedVenue}
        participants={participants}
        shortCode={shortCode}
        onBack={() => setSelectedVenue(null)}
      />
    );
  }

  if (venues.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-5 text-center">
        <div>
          <p className="text-sm text-on-surface-variant font-body">
            No venues found for this search.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 px-5 py-5 space-y-4 overflow-y-auto">
      {venues.map((venue, index) => (
        <VenueCard
          key={venue.placeId}
          venue={venue}
          participants={participants}
          onSelect={setSelectedVenue}
          rank={index + 1}
        />
      ))}
    </main>
  );
}
