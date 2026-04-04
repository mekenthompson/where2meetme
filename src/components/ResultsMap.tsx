"use client";

import { useEffect, useRef, useState } from "react";
import Map, { Marker, type MapRef } from "react-map-gl/mapbox";
import { Icon } from "./Icon";
import type { Participant, VenueResult } from "@/lib/types";
import "mapbox-gl/dist/mapbox-gl.css";

interface ResultsMapProps {
  midpointLat: number;
  midpointLng: number;
  participants: Participant[];
  venues: VenueResult[];
}

const PARTICIPANT_COLORS = [
  "#000666", // Deep Navy (primary)
  "#1b6d24", // Fairness Green (secondary)
  "#9c27b0", // Purple
  "#f57c00", // Orange
  "#0288d1", // Blue
  "#c2185b", // Pink
];

export function ResultsMap({
  midpointLat,
  midpointLng,
  participants,
  venues,
}: ResultsMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapError, setMapError] = useState(false);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapRef.current || !mapboxToken) return;

    // Auto-fit bounds to show all markers
    const bounds = [
      [midpointLng, midpointLat], // midpoint
      ...participants
        .filter((p) => p.originLat && p.originLng)
        .map((p) => [p.originLng!, p.originLat!]),
      ...venues.slice(0, 3).map((v) => [v.lng, v.lat]), // top 3 venues
    ] as [number, number][];

    if (bounds.length > 1) {
      const minLng = Math.min(...bounds.map((b) => b[0]));
      const maxLng = Math.max(...bounds.map((b) => b[0]));
      const minLat = Math.min(...bounds.map((b) => b[1]));
      const maxLat = Math.max(...bounds.map((b) => b[1]));

      mapRef.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        {
          padding: { top: 60, bottom: 60, left: 40, right: 40 },
          duration: 800,
        }
      );
    }
  }, [midpointLat, midpointLng, participants, venues, mapboxToken]);

  if (!mapboxToken) {
    return (
      <div className="h-64 bg-surface-low rounded-2xl flex items-center justify-center">
        <div className="text-center space-y-2">
          <Icon name="map_off" size={40} className="text-on-surface-variant/30" />
          <p className="text-xs text-on-surface-variant">
            Map requires NEXT_PUBLIC_MAPBOX_TOKEN
          </p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="h-64 bg-surface-low rounded-2xl flex items-center justify-center">
        <div className="text-center space-y-2">
          <Icon name="error" size={40} className="text-on-surface-variant/30" />
          <p className="text-xs text-on-surface-variant">Map failed to load</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 rounded-2xl overflow-hidden shadow-ambient">
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          latitude: midpointLat,
          longitude: midpointLng,
          zoom: 12,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        onError={() => setMapError(true)}
      >
        {/* Midpoint marker (pulsing green) */}
        <Marker latitude={midpointLat} longitude={midpointLng}>
          <div className="relative">
            <div className="w-5 h-5 bg-secondary rounded-full shadow-lg border-2 border-white animate-pulse" />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-[10px] font-bold text-secondary bg-white/90 px-2 py-0.5 rounded-full shadow-sm">
                Meeting area
              </span>
            </div>
          </div>
        </Marker>

        {/* Participant origin markers */}
        {participants.map((p, i) => {
          if (!p.originLat || !p.originLng) return null;
          const color = PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length];
          return (
            <Marker key={p.id} latitude={p.originLat} longitude={p.originLng}>
              <div className="relative">
                <div
                  className="w-8 h-8 rounded-full shadow-lg border-2 border-white flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  <span className="text-white text-xs font-bold font-headline">
                    {p.label.charAt(0)}
                  </span>
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-[10px] font-medium text-on-surface bg-white/90 px-2 py-0.5 rounded-full shadow-sm">
                    {p.label}
                  </span>
                </div>
              </div>
            </Marker>
          );
        })}

        {/* Venue pins (top 5) */}
        {venues.slice(0, 5).map((venue, i) => (
          <Marker key={venue.placeId} latitude={venue.lat} longitude={venue.lng}>
            <div className="relative">
              <div className="w-7 h-7 bg-primary rounded-full shadow-lg border-2 border-white flex items-center justify-center">
                <span className="text-white text-xs font-bold font-headline">
                  {i + 1}
                </span>
              </div>
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
