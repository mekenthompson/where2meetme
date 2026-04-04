import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { calculateFairMidpoint } from "@/lib/midpoint";
import type { Participant, VenueType, VenueResult } from "@/lib/types";
import { LRUCache } from "@/lib/cache";

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY ?? "";

// Cache for venue search results (5 min TTL, 100 entries max)
const venueCache = new LRUCache<VenueResult[]>(100, 5 * 60 * 1000);

const venueTypeToGoogleType: Record<VenueType, string> = {
  cafe: "cafe",
  restaurant: "restaurant",
  bar: "bar",
  park: "park",
  library: "library",
  coworking: "cafe", // No direct Google type; search cafes with keyword
};

const venueTypeKeyword: Record<VenueType, string | undefined> = {
  cafe: undefined,
  restaurant: undefined,
  bar: undefined,
  park: undefined,
  library: undefined,
  coworking: "coworking",
};

async function searchNearbyVenues(
  lat: number,
  lng: number,
  venueType: VenueType,
  radius = 3000,
  apiCallCounter?: { count: number }
): Promise<VenueResult[]> {
  // Create cache key: round lat/lng to 3 decimals (~100m precision)
  const roundedLat = Math.round(lat * 1000) / 1000;
  const roundedLng = Math.round(lng * 1000) / 1000;
  const cacheKey = `venues:${roundedLat},${roundedLng}:${venueType}:${radius}`;

  // Check cache first
  const cached = venueCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const type = venueTypeToGoogleType[venueType];
  const keyword = venueTypeKeyword[venueType];

  let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`;
  if (keyword) {
    url += `&keyword=${encodeURIComponent(keyword)}`;
  }

  if (apiCallCounter) apiCallCounter.count++;
  const res = await fetch(url);
  if (!res.ok) return [];

  const data = await res.json();
  if (data.status !== "OK" || !data.results) return [];

  const venues = data.results.slice(0, 15).map(
    (place: {
      place_id: string;
      name: string;
      vicinity: string;
      formatted_address?: string;
      geometry: { location: { lat: number; lng: number } };
      rating?: number;
      user_ratings_total?: number;
      photos?: { photo_reference: string }[];
    }): VenueResult => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address ?? place.vicinity,
      shortAddress: place.vicinity,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      rating: place.rating ?? null,
      userRatingsTotal: place.user_ratings_total ?? null,
      photoReference: place.photos?.[0]?.photo_reference ?? null,
      fairnessScore: 0, // Calculated later
      travelTimes: {},
    })
  );

  // Cache the results
  venueCache.set(cacheKey, venues);

  return venues;
}

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      sinLng *
      sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function calculateFairnessScore(travelTimes: Record<string, number>): number {
  const times = Object.values(travelTimes);
  if (times.length < 2) return 100;

  const max = Math.max(...times);
  const min = Math.min(...times);
  const deltaMins = (max - min) / 60;

  // 100% if delta is 0, decreases as delta grows
  // 0 delta = 100, 5min delta = ~85, 10min delta = ~70, 20min = ~40
  return Math.max(0, Math.round(100 * Math.exp(-deltaMins / 15)));
}

export async function POST(req: NextRequest) {
  try {
    // API call counter for monitoring
    const apiCallCounter = { count: 0 };

    const body = await req.json();
    const {
      participants,
      venueType,
    }: { participants: Participant[]; venueType: VenueType } = body;

    if (!participants || participants.length < 2) {
      return NextResponse.json(
        { error: "At least 2 participants required" },
        { status: 400 }
      );
    }

    // Validate all participants have coordinates
    const validParticipants = participants.filter(
      (p) => p.originLat != null && p.originLng != null
    );

    if (validParticipants.length < 2) {
      return NextResponse.json(
        { error: "At least 2 participants must have locations set" },
        { status: 400 }
      );
    }

    // Step 1: Calculate fair midpoint
    const midpointResult = await calculateFairMidpoint(
      validParticipants.map((p) => ({
        id: p.id,
        lat: p.originLat!,
        lng: p.originLng!,
        travelMode: p.travelMode,
      }))
    );

    // Count midpoint calculation API calls
    // Each iteration calls getTravelTimes which may batch API calls by mode
    apiCallCounter.count += midpointResult.iterations;

    // Step 2: Search for venues near the midpoint
    let venues = await searchNearbyVenues(
      midpointResult.midpoint.lat,
      midpointResult.midpoint.lng,
      venueType,
      3000,
      apiCallCounter
    );

    // Step 3: Calculate travel times from each participant to each venue
    // Skip distance matrix calls for venues < 500m from midpoint (use midpoint times)
    const MAPBOX_TOKEN = process.env.MAPBOX_SECRET_TOKEN ?? "";

    for (const venue of venues) {
      const venueTimes: Record<string, number> = {};

      // Check if venue is very close to midpoint (< 500m)
      const distanceToMidpoint = haversineDistance(
        midpointResult.midpoint.lat,
        midpointResult.midpoint.lng,
        venue.lat,
        venue.lng
      );

      // If venue is within 500m of midpoint, reuse midpoint travel times
      if (distanceToMidpoint < 500) {
        for (const p of validParticipants) {
          if (midpointResult.travelTimes[p.id]) {
            venueTimes[p.id] = midpointResult.travelTimes[p.id];
          }
        }
        venue.travelTimes = venueTimes;
        venue.fairnessScore = calculateFairnessScore(venueTimes);
        continue;
      }

      // Group by transit vs non-transit
      const transitP = validParticipants.filter((p) => p.travelMode === "transit");
      const otherP = validParticipants.filter((p) => p.travelMode !== "transit");

      // Mapbox for non-transit
      const byMode = new Map<string, typeof otherP>();
      for (const p of otherP) {
        const profile =
          p.travelMode === "driving"
            ? "mapbox/driving"
            : p.travelMode === "walking"
              ? "mapbox/walking"
              : "mapbox/cycling";
        if (!byMode.has(profile)) byMode.set(profile, []);
        byMode.get(profile)!.push(p);
      }

      for (const [profile, group] of byMode) {
        const coords = [
          ...group.map((p) => `${p.originLng},${p.originLat}`),
          `${venue.lng},${venue.lat}`,
        ].join(";");
        const sources = group.map((_, i) => i).join(";");
        const destinations = String(group.length);

        try {
          const url = `https://api.mapbox.com/directions-matrix/v1/${profile}/${coords}?sources=${sources}&destinations=${destinations}&annotations=duration&access_token=${MAPBOX_TOKEN}`;
          apiCallCounter.count++;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (data.durations) {
              for (let i = 0; i < group.length; i++) {
                const d = data.durations[i]?.[0];
                if (d != null) venueTimes[group[i].id] = Math.round(d);
              }
            }
          }
        } catch {
          // Use midpoint travel times as fallback
          for (const p of group) {
            if (midpointResult.travelTimes[p.id]) {
              venueTimes[p.id] = midpointResult.travelTimes[p.id];
            }
          }
        }
      }

      // Google for transit
      if (transitP.length > 0) {
        const origins = transitP.map((p) => `${p.originLat},${p.originLng}`).join("|");
        const dest = `${venue.lat},${venue.lng}`;
        try {
          const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${dest}&mode=transit&key=${GOOGLE_API_KEY}`;
          apiCallCounter.count++;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (data.rows) {
              for (let i = 0; i < transitP.length; i++) {
                const el = data.rows[i]?.elements?.[0];
                if (el?.status === "OK" && el.duration) {
                  venueTimes[transitP[i].id] = el.duration.value;
                }
              }
            }
          }
        } catch {
          for (const p of transitP) {
            if (midpointResult.travelTimes[p.id]) {
              venueTimes[p.id] = midpointResult.travelTimes[p.id];
            }
          }
        }
      }

      venue.travelTimes = venueTimes;
      venue.fairnessScore = calculateFairnessScore(venueTimes);
    }

    // Sort by fairness score (highest first)
    venues.sort((a, b) => b.fairnessScore - a.fairnessScore);
    venues = venues.slice(0, 9);

    const shortCode = nanoid(8);

    const result = {
      id: crypto.randomUUID(),
      shortCode,
      venueType,
      midpointLat: midpointResult.midpoint.lat,
      midpointLng: midpointResult.midpoint.lng,
      participants: validParticipants.map((p) => ({
        ...p,
        travelTimeSeconds: midpointResult.travelTimes[p.id] ?? null,
      })),
      venues,
      createdAt: new Date().toISOString(),
    };

    // Log API call count for monitoring
    console.log(`[Search API] External API calls: ${apiCallCounter.count}`);

    // TODO: Store in Supabase when configured

    return NextResponse.json(result);
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json(
      { error: "Failed to calculate meeting point" },
      { status: 500 }
    );
  }
}
