"use client";

import { useEffect, useRef, useState } from "react";
import Map, { Marker, type MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Participant } from "@/lib/types";
import { Icon } from "./Icon";

interface VenueMapProps {
  venueLat: number;
  venueLng: number;
  venueName: string;
  participants: Participant[];
}

const PARTICIPANT_COLORS = [
  "#e91e63", // pink
  "#9c27b0", // purple
  "#2196f3", // blue
  "#4caf50", // green
  "#ff9800", // orange
  "#f44336", // red
];

export function VenueMap({
  venueLat,
  venueLng,
  venueName,
  participants,
}: VenueMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Filter participants that have valid coordinates
  const validParticipants = participants.filter(
    (p) => p.originLat != null && p.originLng != null
  );

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // Auto-fit bounds to include venue and all participant origins
    const bounds: [[number, number], [number, number]] = [
      [venueLng, venueLat],
      [venueLng, venueLat],
    ];

    validParticipants.forEach((p) => {
      if (p.originLng! < bounds[0][0]) bounds[0][0] = p.originLng!;
      if (p.originLat! < bounds[0][1]) bounds[0][1] = p.originLat!;
      if (p.originLng! > bounds[1][0]) bounds[1][0] = p.originLng!;
      if (p.originLat! > bounds[1][1]) bounds[1][1] = p.originLat!;
    });

    mapRef.current.fitBounds(bounds, {
      padding: { top: 40, bottom: 40, left: 40, right: 40 },
      maxZoom: 14,
      duration: 0,
    });
  }, [mapLoaded, venueLat, venueLng, validParticipants]);

  // Graceful fallback if token not set
  if (!mapboxToken) {
    return (
      <div className="h-48 bg-surface-low flex items-center justify-center">
        <p className="text-sm text-on-surface-variant">
          Map unavailable (Mapbox token not configured)
        </p>
      </div>
    );
  }

  return (
    <div className="h-48 relative overflow-hidden rounded-2xl">
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          latitude: venueLat,
          longitude: venueLng,
          zoom: 12,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        onLoad={() => setMapLoaded(true)}
        dragPan={false}
        scrollZoom={false}
        doubleClickZoom={false}
        touchZoomRotate={false}
        dragRotate={false}
        keyboard={false}
        attributionControl={false}
      >
        {/* Venue marker */}
        <Marker
          latitude={venueLat}
          longitude={venueLng}
          anchor="bottom"
        >
          <div className="flex flex-col items-center">
            <div className="bg-primary text-on-primary rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
              <Icon name="location_on" size={20} filled />
            </div>
          </div>
        </Marker>

        {/* Participant origin markers */}
        {validParticipants.map((participant, index) => (
          <Marker
            key={participant.id}
            latitude={participant.originLat!}
            longitude={participant.originLng!}
            anchor="center"
          >
            <div className="flex flex-col items-center">
              <div
                className="rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold font-headline shadow-md"
                style={{
                  backgroundColor:
                    PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length],
                }}
              >
                {participant.label.charAt(0).toUpperCase()}
              </div>
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
