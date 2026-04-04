"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { TravelModeChips } from "./TravelModeChips";
import { LocationInput } from "./LocationInput";
import type { Participant, TravelMode } from "@/lib/types";

interface TravelerCardProps {
  participant: Participant;
  index: number;
  canRemove: boolean;
  onUpdate: (id: string, updates: Partial<Participant>) => void;
  onRemove: (id: string) => void;
  collectToken?: string;
}

export function TravelerCard({
  participant,
  index,
  canRemove,
  onUpdate,
  onRemove,
  collectToken,
}: TravelerCardProps) {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const handleLocationSelect = (place: {
    placeId: string;
    displayName: string;
    lat: number;
    lng: number;
  }) => {
    onUpdate(participant.id, {
      originPlaceId: place.placeId,
      originDisplayName: place.displayName,
      originLat: place.lat,
      originLng: place.lng,
    });
  };

  const handleLocationClear = () => {
    onUpdate(participant.id, {
      originPlaceId: null,
      originDisplayName: "",
      originLat: null,
      originLng: null,
    });
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(participant.id, { label: e.target.value });
  };

  const handleLabelBlur = () => {
    setIsEditingLabel(false);
    if (!participant.label.trim()) {
      const labels = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta"];
      onUpdate(participant.id, { label: labels[index] ?? `Traveler ${index + 1}` });
    }
  };

  const handleInvite = async () => {
    if (!collectToken) return;

    const inviteUrl = `${window.location.origin}/collect/${collectToken}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Where2Meet.Me — Share Your Location",
          text: `Help us find a great spot to meet! Share your location:`,
          url: inviteUrl,
        });
      } else {
        await navigator.clipboard.writeText(inviteUrl);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      }
    } catch (err) {
      // Share cancelled or failed
    }
  };

  return (
    <div className="bg-surface-lowest rounded-2xl p-3 sm:p-5 shadow-ambient space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-primary rounded-full" />
          {isEditingLabel ? (
            <input
              type="text"
              value={participant.label}
              onChange={handleLabelChange}
              onBlur={handleLabelBlur}
              onKeyDown={(e) => e.key === "Enter" && handleLabelBlur()}
              autoFocus
              className="text-xs uppercase tracking-widest font-bold text-primary/60 bg-transparent outline-none border-b border-primary/30 font-headline"
            />
          ) : (
            <button
              onClick={() => setIsEditingLabel(true)}
              className="text-xs uppercase tracking-widest font-bold text-primary/60 font-headline hover:text-primary transition-colors"
            >
              {participant.label}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canRemove && (
            <button
              onClick={() => onRemove(participant.id)}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label={`Remove traveler ${participant.label}`}
            >
              <Icon name="close" size={18} />
            </button>
          )}
          <Icon name="person" size={22} className="text-primary-container" />
        </div>
      </div>

      <div className="space-y-1 relative">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-medium text-on-surface-variant uppercase tracking-widest font-body">
            Origin
          </label>
          {collectToken && !participant.originLat && !participant.originLng && (
            <button
              onClick={handleInvite}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors font-body"
            >
              <Icon name="share" size={16} />
              {showCopied ? "Copied!" : "Invite"}
            </button>
          )}
        </div>
        <LocationInput
          value={participant.originDisplayName}
          onChange={handleLocationSelect}
          onClear={handleLocationClear}
          placeholder="Enter starting point..."
        />
      </div>

      <TravelModeChips
        selected={participant.travelMode}
        onSelect={(mode: TravelMode) =>
          onUpdate(participant.id, { travelMode: mode })
        }
      />
    </div>
  );
}
