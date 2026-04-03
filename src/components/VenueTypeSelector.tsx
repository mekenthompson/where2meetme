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
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
      {venueTypes.map(({ type, icon, label }) => {
        const isSelected = selected === type;
        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
              isSelected
                ? "bg-primary text-on-primary"
                : "bg-surface-lowest text-on-surface-variant hover:bg-surface-high"
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
