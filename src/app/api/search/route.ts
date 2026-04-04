import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { calculateFairMidpoint } from "@/lib/midpoint";
import { supabaseServer } from "@/lib/supabase-server";
import type { Participant, VenueType, VenueResult } from "@/lib/types";

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY ?? "";

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
  radius = 3000
): Promise<VenueResult[]> {
  const type = venueTypeToGoogleType[venueType];
  const keyword = venueTypeKeyword[venueType];

  let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`;
  if (keyword) {
    url += `&keyword=${encodeURIComponent(keyword)}`;
  }

  const res = await fetch(url);
  if (!res.ok) return [];

  const data = await res.json();
  if (data.status !== "OK" || !data.results) return [];

  return data.results.slice(0, 15).map(
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

    // Step 2: Search for venues near the midpoint
    let venues = await searchNearbyVenues(
      midpointResult.midpoint.lat,
      midpointResult.midpoint.lng,
      venueType
    );

    // Step 3: Calculate travel times from each participant to each venue
    // (We reuse the midpoint travel times for venues very close to the midpoint,
    //  and calculate new ones for venues further away)
    const MAPBOX_TOKEN = process.env.MAPBOX_SECRET_TOKEN ?? "";

    for (const venue of venues) {
      const venueTimes: Record<string, number> = {};

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

    const searchId = crypto.randomUUID();

    const result = {
      id: searchId,
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

    // Store in Supabase (gracefully handle failures)
    try {
      // Insert search record
      const { error: searchError } = await supabaseServer
        .from("searches")
        .insert({
          id: searchId,
          short_code: shortCode,
          venue_type: venueType,
          status: "complete",
          midpoint_lat: midpointResult.midpoint.lat,
          midpoint_lng: midpointResult.midpoint.lng,
        });

      if (searchError) {
        console.error("Failed to insert search:", searchError);
      } else {
        // Insert participants
        const participantRows = result.participants.map((p) => ({
          search_id: searchId,
          label: p.label,
          origin_place_id: p.originPlaceId,
          origin_lat: p.originLat,
          origin_lng: p.originLng,
          origin_display_name: p.originDisplayName,
          travel_mode: p.travelMode,
          travel_time_seconds: p.travelTimeSeconds,
        }));

        const { error: participantsError } = await supabaseServer
          .from("participants")
          .insert(participantRows);

        if (participantsError) {
          console.error("Failed to insert participants:", participantsError);
        }

        // Insert venues
        const venueRows = venues.map((v) => ({
          search_id: searchId,
          place_id: v.placeId,
          name: v.name,
          address: v.address,
          short_address: v.shortAddress,
          lat: v.lat,
          lng: v.lng,
          rating: v.rating,
          user_ratings_total: v.userRatingsTotal,
          photo_reference: v.photoReference,
          fairness_score: v.fairnessScore,
          travel_times: v.travelTimes,
        }));

        const { error: venuesError } = await supabaseServer
          .from("venues")
          .insert(venueRows);

        if (venuesError) {
          console.error("Failed to insert venues:", venuesError);
        }
      }
    } catch (dbError) {
      // DB is down or misconfigured — log but don't fail the request
      console.error("Database error:", dbError);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json(
      { error: "Failed to calculate meeting point" },
      { status: 500 }
    );
  }
}
