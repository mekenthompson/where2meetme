"use client";

export type FilterType = "all" | "topRated" | "closest" | "bestMatch";

interface FilterChip {
  type: FilterType;
  label: string;
}

const filters: FilterChip[] = [
  { type: "all", label: "All" },
  { type: "topRated", label: "Top Rated" },
  { type: "closest", label: "Closest" },
  { type: "bestMatch", label: "Best Match" },
];

interface FilterChipsProps {
  selected: FilterType;
  onSelect: (type: FilterType) => void;
}

export function FilterChips({ selected, onSelect }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
      {filters.map(({ type, label }) => {
        const isSelected = selected === type;
        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
              isSelected
                ? "bg-primary text-on-primary"
                : "bg-surface-lowest text-on-surface-variant hover:bg-surface-high"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
