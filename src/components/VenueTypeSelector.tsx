"use client";

import { Icon } from "./Icon";
import type { VenueType } from "@/lib/types";

const venueTypes: { type: VenueType; icon: string; label: string }[] = [
  { type: "cafe", icon: "coffee", label: "Coffee" },
  { type: "restaurant", icon: "restaurant", label: "Dining" },
  { type: "bar", icon: "local_bar", label: "Drinks" },
  { type: "park", icon: "park", label: "Parks" },
  { type: "coworking", icon: "work", label: "Coworking" },
  { type: "library", icon: "local_library", label: "Library" },
];

interface VenueTypeSelectorProps {
  selected: VenueType;
  onSelect: (type: VenueType) => void;
}

export function VenueTypeSelector({ selected, onSelect }: VenueTypeSelectorProps) {
  return (
    <div className="relative flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none scroll-fade-right md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-x-visible md:after:hidden" role="radiogroup" aria-label="Venue type">
      {venueTypes.map(({ type, icon, label }) => {
        const isSelected = selected === type;
        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            role="radio"
            aria-checked={isSelected}
            className={`flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 md:flex-col md:py-4 md:px-2 md:rounded-2xl md:gap-2 ${
              isSelected
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-surface-high text-on-surface-variant hover:bg-surface-highest"
            }`}
          >
            <Icon name={icon} size={18} filled={isSelected} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
