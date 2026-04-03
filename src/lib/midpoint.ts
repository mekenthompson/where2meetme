import type { Coordinates, TravelMode } from "./types";

interface ParticipantInput {
  id: string;
  lat: number;
  lng: number;
  travelMode: TravelMode;
}

interface MidpointResult {
  midpoint: Coordinates;
  travelTimes: Record<string, number>; // participantId -> seconds
  iterations: number;
}

/**
 * Calculate the geographic centroid of a set of coordinates.
 * This is the initial seed for the iterative algorithm.
 */
function centroid(points: Coordinates[]): Coordinates {
  const sum = points.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
    { lat: 0, lng: 0 }
  );
  return {
    lat: sum.lat / points.length,
    lng: sum.lng / points.length,
  };
}

/**
 * Map our travel mode to the Google Distance Matrix API travel mode string.
 */
function toGoogleMode(mode: TravelMode): string {
  switch (mode) {
    case "driving":
      return "driving";
    case "transit":
      return "transit";
    case "walking":
      return "walking";
    case "bicycling":
      return "bicycling";
  }
}

/**
 * Map our travel mode to Mapbox profile string.
 */
function toMapboxProfile(mode: TravelMode): string {
  switch (mode) {
    case "driving":
      return "mapbox/driving";
    case "walking":
      return "mapbox/walking";
    case "bicycling":
      return "mapbox/cycling";
    case "transit":
      return ""; // Transit not supported by Mapbox
  }
}

/**
 * Fetch travel times from origins to a destination.
 * Uses Mapbox for driving/walking/cycling, Google for transit.
 */
async function getTravelTimes(
  participants: ParticipantInput[],
  destination: Coordinates
): Promise<Record<string, number>> {
  const times: Record<string, number> = {};

  // Group participants by whether they need Google (transit) or Mapbox
  const transitParticipants = participants.filter((p) => p.travelMode === "transit");
  const mapboxParticipants = participants.filter((p) => p.travelMode !== "transit");

  // Mapbox batch: group by travel mode
  const byMode = new Map<string, ParticipantInput[]>();
  for (const p of mapboxParticipants) {
    const profile = toMapboxProfile(p.travelMode);
    if (!byMode.has(profile)) byMode.set(profile, []);
    byMode.get(profile)!.push(p);
  }

  const mapboxToken = process.env.MAPBOX_SECRET_TOKEN;
  for (const [profile, group] of byMode) {
    // Mapbox Matrix API: coordinates as semicolon-separated lng,lat pairs
    // Sources are the participant origins, destination is appended last
    const coords = [
      ...group.map((p) => `${p.lng},${p.lat}`),
      `${destination.lng},${destination.lat}`,
    ].join(";");

    const sources = group.map((_, i) => i).join(";");
    const destinations = String(group.length); // Last coordinate index

    try {
      const url = `https://api.mapbox.com/directions-matrix/v1/${profile}/${coords}?sources=${sources}&destinations=${destinations}&annotations=duration&access_token=${mapboxToken}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.durations) {
          for (let i = 0; i < group.length; i++) {
            const duration = data.durations[i]?.[0];
            if (duration != null) {
              times[group[i].id] = Math.round(duration);
            }
          }
        }
      }
    } catch {
      // Fallback: estimate based on straight-line distance
      for (const p of group) {
        times[p.id] = estimateTravelTime(p, destination, p.travelMode);
      }
    }
  }

  // Google Distance Matrix for transit participants
  if (transitParticipants.length > 0) {
    const googleKey = process.env.GOOGLE_MAPS_API_KEY;
    const origins = transitParticipants
      .map((p) => `${p.lat},${p.lng}`)
      .join("|");
    const dest = `${destination.lat},${destination.lng}`;

    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${dest}&mode=transit&key=${googleKey}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.rows) {
          for (let i = 0; i < transitParticipants.length; i++) {
            const element = data.rows[i]?.elements?.[0];
            if (element?.status === "OK" && element.duration) {
              times[transitParticipants[i].id] = element.duration.value;
            } else {
              // Fallback for transit
              times[transitParticipants[i].id] = estimateTravelTime(
                transitParticipants[i],
                destination,
                "transit"
              );
            }
          }
        }
      }
    } catch {
      for (const p of transitParticipants) {
        times[p.id] = estimateTravelTime(p, destination, "transit");
      }
    }
  }

  return times;
}

/**
 * Haversine distance in meters.
 */
function haversineDistance(a: Coordinates, b: Coordinates): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Rough travel time estimate as fallback (seconds).
 */
function estimateTravelTime(
  origin: { lat: number; lng: number },
  dest: Coordinates,
  mode: TravelMode
): number {
  const dist = haversineDistance(origin, dest);
  // Rough speeds in m/s
  const speeds: Record<TravelMode, number> = {
    driving: 13.9, // ~50 km/h
    transit: 8.3, // ~30 km/h
    walking: 1.4, // ~5 km/h
    bicycling: 4.2, // ~15 km/h
  };
  return Math.round(dist / speeds[mode]);
}

/**
 * Iterative fair midpoint algorithm.
 *
 * Strategy: minimax — minimize the maximum travel time.
 * 1. Start at geographic centroid
 * 2. Get real travel times for all participants
 * 3. If max delta < tolerance, done
 * 4. Shift midpoint toward the person with the longest travel time
 * 5. Repeat (max 5 iterations, step size halves each time)
 */
export async function calculateFairMidpoint(
  participants: ParticipantInput[],
  maxIterations = 5,
  toleranceSeconds = 120
): Promise<MidpointResult> {
  let midpoint = centroid(participants.map((p) => ({ lat: p.lat, lng: p.lng })));
  let travelTimes: Record<string, number> = {};
  let iteration = 0;

  for (; iteration < maxIterations; iteration++) {
    travelTimes = await getTravelTimes(participants, midpoint);

    // Check if all participants have travel times
    const allHaveTimes = participants.every((p) => travelTimes[p.id] != null);
    if (!allHaveTimes) break;

    const times = participants.map((p) => ({
      id: p.id,
      time: travelTimes[p.id]!,
      lat: p.lat,
      lng: p.lng,
    }));

    const maxTime = Math.max(...times.map((t) => t.time));
    const minTime = Math.min(...times.map((t) => t.time));

    // Check tolerance
    if (maxTime - minTime < toleranceSeconds) break;

    // Find the person with the longest travel time
    const slowest = times.find((t) => t.time === maxTime)!;

    // Shift midpoint toward the slowest person's origin
    // Step size decreases each iteration
    const stepFactor = 0.3 / Math.pow(2, iteration);

    midpoint = {
      lat: midpoint.lat + (slowest.lat - midpoint.lat) * stepFactor,
      lng: midpoint.lng + (slowest.lng - midpoint.lng) * stepFactor,
    };
  }

  return {
    midpoint,
    travelTimes,
    iterations: iteration,
  };
}
