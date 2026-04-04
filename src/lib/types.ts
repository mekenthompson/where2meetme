export type TravelMode = "driving" | "transit" | "walking" | "bicycling";

export type VenueType =
  | "cafe"
  | "restaurant"
  | "bar"
  | "park"
  | "library"
  | "coworking";

export interface Participant {
  id: string;
  label: string;
  originPlaceId: string | null;
  originLat: number | null;
  originLng: number | null;
  originDisplayName: string;
  travelMode: TravelMode;
  travelTimeSeconds: number | null;
}

export interface VenueResult {
  placeId: string;
  name: string;
  address: string;
  shortAddress: string;
  lat: number;
  lng: number;
  rating: number | null;
  userRatingsTotal: number | null;
  photoReference: string | null;
  fairnessScore: number;
  travelTimes: Record<string, number>; // participantId -> seconds
}

export interface SearchResult {
  id: string;
  shortCode: string;
  venueType: VenueType;
  midpointLat: number;
  midpointLng: number;
  participants: Participant[];
  venues: VenueResult[];
  createdAt: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export type SearchErrorType = "NO_VENUES" | "API_ERROR" | "RATE_LIMITED" | "DEGRADED";

export interface SearchError {
  type: SearchErrorType;
  message: string;
}
