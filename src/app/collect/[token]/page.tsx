"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LocationInput } from "@/components/LocationInput";
import { TravelModeChips } from "@/components/TravelModeChips";
import { Icon } from "@/components/Icon";
import type { TravelMode } from "@/lib/types";

export default function CollectPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shortCode, setShortCode] = useState<string | null>(null);

  const [originLat, setOriginLat] = useState<number | null>(null);
  const [originLng, setOriginLng] = useState<number | null>(null);
  const [originDisplayName, setOriginDisplayName] = useState("");
  const [travelMode, setTravelMode] = useState<TravelMode>("driving");

  const handleLocationSelect = (place: {
    placeId: string;
    displayName: string;
    lat: number;
    lng: number;
  }) => {
    setOriginLat(place.lat);
    setOriginLng(place.lng);
    setOriginDisplayName(place.displayName);
    setError(null);
  };

  const handleLocationClear = () => {
    setOriginLat(null);
    setOriginLng(null);
    setOriginDisplayName("");
  };

  const handleSubmit = async () => {
    if (!originLat || !originLng || !originDisplayName) {
      setError("Please select your starting location");
      return;
    }

    setIsLoading(true);
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
          travelMode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit response");
        return;
      }

      setSuccess(true);
      setShortCode(data.shortCode);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-6 px-5">
        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
          <Icon name="check_circle" size={40} className="text-secondary" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold font-headline text-on-surface">
            Response Submitted!
          </h1>
          <p className="text-sm text-on-surface-variant font-body max-w-md">
            Thanks for sharing your location. Results will be shared when everyone
            responds.
          </p>
        </div>
        {shortCode && (
          <button
            onClick={() => router.push(`/m/${shortCode}`)}
            className="btn-primary px-6 py-3 text-sm font-semibold font-headline"
          >
            View Results
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="px-5 pt-4 pb-2">
        <h2 className="text-lg font-bold font-headline text-primary">
          Where2Meet.Me
        </h2>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-20">
        <div className="w-full max-w-md space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="location_on" size={32} className="text-primary" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold font-headline text-on-surface">
              Share Your Location
            </h1>
            <p className="text-sm text-on-surface-variant font-body">
              Help find the fairest meeting spot by sharing where you'll be
              traveling from.
            </p>
          </div>

          {/* Form */}
          <div className="bg-surface-lowest rounded-2xl p-5 shadow-ambient space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-on-surface-variant uppercase tracking-widest font-body">
                Your Starting Point
              </label>
              <LocationInput
                value={originDisplayName}
                onChange={handleLocationSelect}
                onClear={handleLocationClear}
                placeholder="Enter your address..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-medium text-on-surface-variant uppercase tracking-widest font-body">
                Travel Method
              </label>
              <TravelModeChips selected={travelMode} onSelect={setTravelMode} />
            </div>

            {error && (
              <div className="bg-red-500/10 border-l-4 border-red-500 rounded-lg p-3 flex items-center gap-2">
                <Icon name="error" size={20} className="text-red-500" />
                <p className="text-sm text-red-500 font-body">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isLoading || !originLat || !originLng}
              className="btn-primary w-full py-3 text-sm font-semibold font-headline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Icon name="progress_activity" size={18} className="animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit Response"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
