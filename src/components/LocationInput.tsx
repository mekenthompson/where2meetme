"use client";

import { useState, useRef, useCallback } from "react";
import { Icon } from "./Icon";

interface LocationInputProps {
  value: string;
  onChange: (place: {
    placeId: string;
    displayName: string;
    lat: number;
    lng: number;
  }) => void;
  onClear: () => void;
  placeholder?: string;
}

interface Suggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  lat?: number;
  lng?: number;
}

export function LocationInput({
  value,
  onChange,
  onClear,
  placeholder = "Enter starting point...",
}: LocationInputProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/places/autocomplete?input=${encodeURIComponent(input)}`
      );
      if (!res.ok) throw new Error("Failed to fetch suggestions");
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
      setIsOpen(data.suggestions?.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSelect = async (suggestion: Suggestion) => {
    setQuery(suggestion.mainText);
    setIsOpen(false);
    setSuggestions([]);

    // Use coordinates from suggestion if available (preferred)
    if (suggestion.lat !== undefined && suggestion.lng !== undefined) {
      onChange({
        placeId: suggestion.placeId,
        displayName: suggestion.mainText,
        lat: suggestion.lat,
        lng: suggestion.lng,
      });
      return;
    }

    // Fallback to details endpoint if coordinates missing
    try {
      const res = await fetch(
        `/api/places/details?placeId=${encodeURIComponent(suggestion.placeId)}`
      );
      if (!res.ok) throw new Error("Failed to fetch place details");
      const data = await res.json();
      onChange({
        placeId: suggestion.placeId,
        displayName: suggestion.mainText,
        lat: data.lat,
        lng: data.lng,
      });
    } catch {
      // Unable to get coordinates
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    onClear();
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-surface-low rounded-xl px-3 py-2.5 input-glow transition-all">
        <Icon name="location_on" size={20} className="text-on-surface-variant shrink-0" />
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none font-body"
        />
        {isLoading && (
          <Icon name="progress_activity" size={18} className="text-on-surface-variant animate-spin" />
        )}
        {query && !isLoading && (
          <button onClick={handleClear} className="text-on-surface-variant hover:text-on-surface">
            <Icon name="close" size={18} />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface-lowest rounded-xl shadow-ambient overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s.placeId}
              onMouseDown={() => handleSelect(s)}
              className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-surface-low text-left transition-colors"
            >
              <Icon name="place" size={18} className="text-on-surface-variant mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-on-surface truncate">
                  {s.mainText}
                </div>
                <div className="text-xs text-on-surface-variant truncate">
                  {s.secondaryText}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
