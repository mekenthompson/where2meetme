"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { TravelModeChips } from "./TravelModeChips";
import { LocationInput } from "./LocationInput";
import type { Participant, TravelMode, VenueType } from "@/lib/types";

interface TravelerCardProps {
  participant: Participant;
  index: number;
  canRemove: boolean;
  onUpdate: (id: string, updates: Partial<Participant>) => void;
  onRemove: (id: string) => void;
  venueType?: VenueType;
  allParticipants?: Participant[];
}

export function TravelerCard({
  participant,
  index,
  canRemove,
  onUpdate,
  onRemove,
  venueType,
  allParticipants,
}: TravelerCardProps) {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);

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
    if (!venueType || !allParticipants) {
      alert("Unable to create invite link");
      return;
    }

    setIsCreatingInvite(true);

    try {
      const res = await fetch("/api/collect/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participants: allParticipants.map((p) => ({
            label: p.label,
            travelMode: p.travelMode,
          })),
          venueType,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create collection");
      }

      const data = await res.json();
      const participantData = data.participantTokens.find(
        (pt: { label: string; token: string }) => pt.label === participant.label
      );

      if (!participantData) {
        throw new Error("Could not find participant token");
      }

      const inviteUrl = `${window.location.origin}/collect/${participantData.token}`;
      setInviteToken(participantData.token);

      if (navigator.share) {
        await navigator.share({
          title: "Where2Meet.Me - Share Your Location",
          text: `${participant.label}, share your location for our meetup!`,
          url: inviteUrl,
        });
      } else {
        await navigator.clipboard.writeText(inviteUrl);
        alert("Invite link copied to clipboard!");
      }
    } catch (err) {
      console.error("Failed to create invite:", err);
      alert("Failed to create invite link");
    } finally {
      setIsCreatingInvite(false);
    }
  };

  const hasOrigin = participant.originLat !== null && participant.originLng !== null;

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
              className="text-sm font-semibold text-on-surface bg-transparent outline-none border-b border-primary/30 font-headline"
            />
          ) : (
            <button
              onClick={() => setIsEditingLabel(true)}
              className="text-sm font-semibold text-on-surface font-headline hover:text-primary transition-colors"
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

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider font-body">
            Origin
          </label>
          {!hasOrigin && venueType && allParticipants && (
            <button
              onClick={handleInvite}
              disabled={isCreatingInvite}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
            >
              <Icon name="share" size={16} />
              <span className="font-body">
                {isCreatingInvite ? "Creating..." : "Invite"}
              </span>
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
