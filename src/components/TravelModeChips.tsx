"use client";

import { Icon } from "./Icon";
import type { TravelMode } from "@/lib/types";

const modes: { mode: TravelMode; icon: string; label: string }[] = [
  { mode: "driving", icon: "directions_car", label: "Car" },
  { mode: "transit", icon: "directions_bus", label: "Bus" },
  { mode: "walking", icon: "directions_walk", label: "Walk" },
  { mode: "bicycling", icon: "directions_bike", label: "Bike" },
];

interface TravelModeChipsProps {
  selected: TravelMode;
  onSelect: (mode: TravelMode) => void;
}

export function TravelModeChips({ selected, onSelect }: TravelModeChipsProps) {
  return (
    <div className="flex justify-between gap-2" role="radiogroup" aria-label="Travel mode">
      {modes.map(({ mode, icon, label }) => {
        const isSelected = selected === mode;
        return (
          <button
            key={mode}
            onClick={() => onSelect(mode)}
            role="radio"
            aria-checked={isSelected}
            className={`flex-1 md:flex-none py-1.5 sm:py-3 px-2 rounded-xl flex flex-row items-center justify-center gap-1.5 md:w-12 md:h-12 md:p-0 md:flex-col md:justify-center transition-all ${
              isSelected
                ? "bg-primary text-white"
                : "bg-surface-high text-on-surface-variant hover:bg-surface-highest"
            }`}
          >
            <Icon name={icon} size={18} filled={isSelected} />
            <span className="text-[10px] font-bold uppercase font-body md:sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
