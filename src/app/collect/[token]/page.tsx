"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { LocationInput } from "@/components/LocationInput";
import { TravelModeChips } from "@/components/TravelModeChips";
import { createClient } from "@/lib/supabase";
import type { TravelMode } from "@/lib/types";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function CollectPage({ params }: PageProps) {
  const [token, setToken] = useState<string>("");
  const [participantLabel, setParticipantLabel] = useState<string>("");
  const [venueType, setVenueType] = useState<string>("");
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [originDisplayName, setOriginDisplayName] = useState("");
  const [originLat, setOriginLat] = useState<number | null>(null);
  const [originLng, setOriginLng] = useState<number | null>(null);
  const [originPlaceId, setOriginPlaceId] = useState<string | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>("driving");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    params.then((resolvedParams) => {
      setToken(resolvedParams.token);
      loadParticipantData(resolvedParams.token);
    });
  }, [params]);

  const loadParticipantData = async (tokenValue: string) => {
    try {
      const supabase = createClient();

      const { data: participant, error: participantError } = await supabase
        .from("participants")
        .select("id, label, search_id, origin_lat, travel_mode")
        .eq("collect_token", tokenValue)
        .single();

      if (participantError || !participant) {
        setError("Invalid or expired invite link");
        setIsLoading(false);
        return;
      }

      if (participant.origin_lat != null) {
        setError("This invite has already been used");
        setIsLoading(false);
        return;
      }

      setParticipantLabel(participant.label);
      setTravelMode(participant.travel_mode);

      const { data: search, error: searchError } = await supabase
        .from("searches")
        .select("venue_type")
        .eq("id", participant.search_id)
        .single();

      if (searchError || !search) {
        setError("Could not load search details");
        setIsLoading(false);
        return;
      }

      setVenueType(search.venue_type);

      const { data: allParticipants, error: allParticipantsError } =
        await supabase
          .from("participants")
          .select("label")
          .eq("search_id", participant.search_id)
          .neq("id", participant.id);

      if (!allParticipantsError && allParticipants) {
        setGroupMembers(allParticipants.map((p) => p.label));
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load participant data:", err);
      setError("Failed to load invite details");
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (place: {
    placeId: string;
    displayName: string;
    lat: number;
    lng: number;
  }) => {
    setOriginPlaceId(place.placeId);
    setOriginDisplayName(place.displayName);
    setOriginLat(place.lat);
    setOriginLng(place.lng);
  };

  const handleLocationClear = () => {
    setOriginPlaceId(null);
    setOriginDisplayName("");
    setOriginLat(null);
    setOriginLng(null);
  };

  const handleSubmit = async () => {
    if (originLat == null || originLng == null) {
      setError("Please select your starting location");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/collect/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          originLat,
          originLng,
          originDisplayName,
          originPlaceId,
          travelMode,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to submit location");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit location");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <Icon name="progress_activity" size={24} className="animate-spin" />
          <span className="font-body">Loading invite...</span>
        </div>
      </div>
    );
  }

  if (error && !isSubmitted) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface-lowest rounded-2xl p-8 shadow-ambient text-center space-y-4">
          <Icon name="error" size={48} className="text-on-surface-variant mx-auto" />
          <h1 className="text-xl font-bold text-on-surface font-headline">
            {error}
          </h1>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface-lowest rounded-2xl p-8 shadow-ambient text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-fairness-green/10 flex items-center justify-center mx-auto">
            <Icon name="check_circle" size={32} className="text-fairness-green" filled />
          </div>
          <h1 className="text-2xl font-bold text-on-surface font-headline">
            Location Submitted!
          </h1>
          <p className="text-on-surface-variant font-body">
            Thanks for sharing your location. The organizer will share the fair meeting point results when everyone has submitted.
          </p>
        </div>
      </div>
    );
  }

  const venueTypeLabels: Record<string, string> = {
    cafe: "Cafe",
    restaurant: "Restaurant",
    bar: "Bar",
    park: "Park",
    library: "Library",
    coworking: "Coworking Space",
  };

  return (
    <div className="min-h-screen bg-surface p-4">
      <div className="max-w-lg mx-auto py-8 space-y-6">
        <div className="bg-surface-lowest rounded-2xl p-6 shadow-ambient space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="share_location" size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-on-surface font-headline">
                Share Your Location
              </h1>
              <p className="text-sm text-on-surface-variant font-body">
                {participantLabel}
              </p>
            </div>
          </div>

          <div className="bg-surface-low rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-on-surface-variant text-sm">
              <Icon name="group" size={18} />
              <span className="font-body font-medium">Meeting with</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {groupMembers.map((member, i) => (
                <div
                  key={i}
                  className="bg-surface-high px-3 py-1 rounded-lg text-sm text-on-surface font-body"
                >
                  {member}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-low rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-on-surface-variant text-sm">
              <Icon name="search" size={18} />
              <span className="font-body font-medium">Looking for</span>
            </div>
            <div className="text-on-surface font-body">
              {venueTypeLabels[venueType] ?? venueType}
            </div>
          </div>
        </div>

        <div className="bg-surface-lowest rounded-2xl p-6 shadow-ambient space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider font-body">
              Your Starting Point
            </label>
            <LocationInput
              value={originDisplayName}
              onChange={handleLocationSelect}
              onClear={handleLocationClear}
              placeholder="Enter your location..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider font-body">
              Travel Mode
            </label>
            <TravelModeChips selected={travelMode} onSelect={setTravelMode} />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 rounded-xl p-4 flex items-start gap-3">
            <Icon name="error" size={20} className="text-red-500 mt-0.5" />
            <p className="text-sm text-red-500 font-body">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || originLat == null || originLng == null}
          className="w-full bg-gradient-to-br from-primary to-[#1a237e] text-on-primary font-semibold font-headline rounded-xl px-6 py-4 shadow-ambient hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit Location"}
        </button>
      </div>
    </div>
  );
}
