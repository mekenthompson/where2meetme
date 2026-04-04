"use client";

import type { SearchResult, VenueType } from "./types";

const STORAGE_KEY = "w2m-recent-spots";
const MAX_RECENT_SPOTS = 5;

export interface RecentSpot {
  shortCode: string;
  venueType: VenueType;
  participantNames: string[];
  topVenueName: string;
  topVenuePhoto: string | null;
  timestamp: number;
}

export function saveRecentSpot(result: SearchResult): void {
  if (typeof window === "undefined") return;

  try {
    const recentSpots = getRecentSpots();

    // Extract data from result
    const newSpot: RecentSpot = {
      shortCode: result.shortCode,
      venueType: result.venueType,
      participantNames: result.participants.map((p) => p.label),
      topVenueName: result.venues[0]?.name ?? "Unknown",
      topVenuePhoto: result.venues[0]?.photoReference ?? null,
      timestamp: Date.now(),
    };

    // Remove existing entry with same shortCode
    const filtered = recentSpots.filter((spot) => spot.shortCode !== result.shortCode);

    // Add to front, limit to MAX_RECENT_SPOTS
    const updated = [newSpot, ...filtered].slice(0, MAX_RECENT_SPOTS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save recent spot:", error);
  }
}

export function getRecentSpots(): RecentSpot[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load recent spots:", error);
    return [];
  }
}

export function clearRecentSpots(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear recent spots:", error);
  }
}
