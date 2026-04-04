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
}

export function TravelerCard({
  participant,
  index,
  canRemove,
  onUpdate,
  onRemove,
}: TravelerCardProps) {
  const [isEditingLabel, setIsEditingLabel] = useState(false);

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

  return (
    <div className="bg-surface-lowest rounded-2xl p-5 shadow-ambient space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary font-headline">
              {participant.label.charAt(0).toUpperCase()}
            </span>
          </div>
          {isEditingLabel ? (
            <input
              type="text"
              value={participant.label}
              onChange={handleLabelChange}
              onBlur={handleLabelBlur}
              onKeyDown={(e) => e.key === "Enter" && handleLabelBlur()}
              autoFocus
              className="text-xs uppercase tracking-widest font-semibold text-on-surface bg-transparent outline-none border-b border-primary/30 font-headline"
            />
          ) : (
            <button
              onClick={() => setIsEditingLabel(true)}
              className="text-xs uppercase tracking-widest font-semibold text-on-surface font-headline hover:text-primary transition-colors"
            >
              {participant.label}
            </button>
          )}
        </div>
        {canRemove && (
          <button
            onClick={() => onRemove(participant.id)}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <Icon name="close" size={20} />
          </button>
        )}
      </div>

      <div className="space-y-1 relative">
        <label className="text-[10px] font-medium text-on-surface-variant uppercase tracking-widest font-body">
          Origin
        </label>
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
