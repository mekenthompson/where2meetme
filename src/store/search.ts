"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Participant, TravelMode, VenueType, SearchResult } from "@/lib/types";

function createParticipant(index: number): Participant {
  const labels = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta"];
  return {
    id: nanoid(),
    label: labels[index] ?? `Traveler ${index + 1}`,
    originPlaceId: null,
    originLat: null,
    originLng: null,
    originDisplayName: "",
    travelMode: "driving",
    travelTimeSeconds: null,
  };
}

interface SearchState {
  participants: Participant[];
  venueType: VenueType;
  isSearching: boolean;
  result: SearchResult | null;
  error: string | null;

  setVenueType: (type: VenueType) => void;
  addParticipant: () => void;
  removeParticipant: (id: string) => void;
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  setTravelMode: (id: string, mode: TravelMode) => void;
  setSearching: (searching: boolean) => void;
  setResult: (result: SearchResult | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  canSearch: () => boolean;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  participants: [createParticipant(0), createParticipant(1)],
  venueType: "cafe",
  isSearching: false,
  result: null,
  error: null,

  setVenueType: (type) => set({ venueType: type }),

  addParticipant: () => {
    const { participants } = get();
    if (participants.length >= 6) return;
    set({ participants: [...participants, createParticipant(participants.length)] });
  },

  removeParticipant: (id) => {
    const { participants } = get();
    if (participants.length <= 2) return;
    set({ participants: participants.filter((p) => p.id !== id) });
  },

  updateParticipant: (id, updates) => {
    set({
      participants: get().participants.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    });
  },

  setTravelMode: (id, mode) => {
    set({
      participants: get().participants.map((p) =>
        p.id === id ? { ...p, travelMode: mode } : p
      ),
    });
  },

  setSearching: (searching) => set({ isSearching: searching }),
  setResult: (result) => set({ result }),
  setError: (error) => set({ error }),

  reset: () =>
    set({
      participants: [createParticipant(0), createParticipant(1)],
      venueType: "cafe",
      isSearching: false,
      result: null,
      error: null,
    }),

  canSearch: () => {
    const { participants, isSearching } = get();
    if (isSearching) return false;
    return participants.every(
      (p) => p.originLat !== null && p.originLng !== null
    );
  },
}));
