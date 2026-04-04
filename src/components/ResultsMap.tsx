"use client";

import { useEffect, useRef, useState } from "react";
import Map, { Marker, type MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Participant, VenueResult } from "@/lib/types";

interface ResultsMapProps {
  midpointLat: number;
  midpointLng: number;
  participants: Participant[];
  venues: VenueResult[];
}

// Participant marker colors (cycling through distinct colors)
const PARTICIPANT_COLORS = [
  "#000666", // Deep Navy (primary)
  "#e91e63", // Pink
  "#9c27b0", // Purple
  "#2196f3", // Blue
  "#009688", // Teal
  "#ff9800", // Orange
];

export function ResultsMap({
  midpointLat,
  midpointLng,
  participants,
  venues,
}: ResultsMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Fit bounds to show all markers when map loads
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const allLats: number[] = [midpointLat];
    const allLngs: number[] = [midpointLng];

    // Add participant origins
    participants.forEach((p) => {
      if (p.originLat != null && p.originLng != null) {
        allLats.push(p.originLat);
        allLngs.push(p.originLng);
      }
    });

    // Add venue locations
    venues.forEach((v) => {
      allLats.push(v.lat);
      allLngs.push(v.lng);
    });

    if (allLats.length > 1) {
      const bounds: [[number, number], [number, number]] = [
        [Math.min(...allLngs), Math.min(...allLats)],
        [Math.max(...allLngs), Math.max(...allLats)],
      ];

      mapRef.current.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: 40, right: 40 },
        duration: 1000,
      });
    }
  }, [mapLoaded, midpointLat, midpointLng, participants, venues]);

  // Show placeholder if token is not set
  if (!mapboxToken) {
    return (
      <div className="relative h-64 bg-surface-low rounded-2xl overflow-hidden flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-4xl">🗺️</div>
          <p className="text-xs text-on-surface-variant">
            Map unavailable (NEXT_PUBLIC_MAPBOX_TOKEN not set)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-64 rounded-2xl overflow-hidden">
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
        onLoad={() => setMapLoaded(true)}
      >
        {/* Participant origin markers */}
        {participants.map((participant, index) => {
          if (participant.originLat == null || participant.originLng == null) {
            return null;
          }

          const color = PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length];

          return (
            <Marker
              key={participant.id}
              latitude={participant.originLat}
              longitude={participant.originLng}
              anchor="bottom"
            >
              <div className="flex flex-col items-center gap-1">
                {/* Circle marker */}
                <div
                  className="w-5 h-5 rounded-full shadow-lg border-2 border-white"
                  style={{ backgroundColor: color }}
                />
                {/* Label */}
                <div className="bg-surface-lowest/95 backdrop-blur-sm text-xs px-2 py-0.5 rounded-full text-on-surface font-medium shadow-md whitespace-nowrap">
                  {participant.label}
                </div>
              </div>
            </Marker>
          );
        })}

        {/* Midpoint marker (pulsing green) */}
        <Marker
          latitude={midpointLat}
          longitude={midpointLng}
          anchor="center"
        >
          <div className="relative flex items-center justify-center">
            {/* Pulsing ring */}
            <div className="absolute w-8 h-8 rounded-full bg-secondary/30 animate-ping" />
            {/* Core circle */}
            <div className="relative w-4 h-4 rounded-full bg-secondary shadow-lg border-2 border-white" />
          </div>
        </Marker>

        {/* Venue markers (numbered pins) */}
        {venues.slice(0, 10).map((venue, index) => (
          <Marker
            key={venue.placeId}
            latitude={venue.lat}
            longitude={venue.lng}
            anchor="bottom"
          >
            <div className="flex flex-col items-center">
              {/* Numbered pin */}
              <div className="relative">
                {/* Pin shadow */}
                <div className="absolute inset-0 bg-primary/20 blur-sm rounded-full" />
                {/* Pin body */}
                <div className="relative bg-primary text-on-primary rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-2 border-white">
                  <span className="text-xs font-bold font-headline">
                    {index + 1}
                  </span>
                </div>
              </div>
              {/* Pin point */}
              <div
                className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary"
                style={{ marginTop: "-2px" }}
              />
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
