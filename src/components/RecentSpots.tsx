"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRecentSpots, clearRecentSpots, type RecentSpot } from "@/lib/recent-spots";
import { Icon } from "./Icon";
import type { VenueType } from "@/lib/types";

const venueTypeIcons: Record<VenueType, string> = {
  cafe: "coffee",
  restaurant: "restaurant",
  bar: "local_bar",
  park: "park",
  coworking: "work",
  library: "local_library",
};

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

export function RecentSpots() {
  const router = useRouter();
  const [spots, setSpots] = useState<RecentSpot[]>([]);

  useEffect(() => {
    setSpots(getRecentSpots());
  }, []);

  const handleClear = () => {
    clearRecentSpots();
    setSpots([]);
  };

  const handleSpotClick = (shortCode: string) => {
    router.push(`/m/${shortCode}`);
  };

  if (spots.length === 0) return null;

  return (
    <section className="px-5 pt-6 pb-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-on-surface-variant uppercase tracking-wider font-body">
          Recent
        </h3>
        <button
          onClick={handleClear}
          className="text-xs font-medium text-on-surface-variant hover:text-primary transition-colors font-body"
        >
          Clear
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {spots.map((spot) => (
          <button
            key={spot.shortCode}
            onClick={() => handleSpotClick(spot.shortCode)}
            className="flex flex-col items-start gap-2 px-4 py-3 rounded-2xl bg-surface-lowest hover:bg-surface-high transition-all shrink-0 min-w-[140px]"
          >
            <div className="flex items-center gap-2 w-full">
              <Icon
                name={venueTypeIcons[spot.venueType]}
                size={18}
                className="text-primary"
              />
              <span className="text-[10px] text-on-surface-variant font-medium font-body">
                {spot.participantNames.length} people
              </span>
            </div>

            <div className="flex flex-col items-start gap-1 w-full">
              <span className="text-sm font-medium text-on-surface font-body line-clamp-1 w-full text-left">
                {spot.topVenueName}
              </span>
              <span className="text-[10px] text-on-surface-variant font-body">
                {formatRelativeTime(spot.timestamp)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
