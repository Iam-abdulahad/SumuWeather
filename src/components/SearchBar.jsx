import { useState, useEffect, useRef, useCallback, useId } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { searchLocations } from "../services/weatherApi";
import GlassCard from "./GlassCard";

/**
 * Pill-shaped glass search bar with live autocomplete dropdown.
 * - Debounced search (300ms)
 * - "Use my location" button
 * - Keyboard navigable (arrow keys, Enter, Escape)
 */
export default function SearchBar({
  onSelectLocation,
  onUseMyLocation,
  loading: externalLoading,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const searchId = useId();
  const inputId = `${searchId}-input`;
  const resultsId = `${searchId}-results`;
  const inputRef = useRef(null);
  const rootRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);
  const [searchError, setSearchError] = useState(null);

  // Debounced search
  const doSearch = useCallback(async (q) => {
    if (q.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      setSearchError(null);
      return;
    }

    setSearching(true);
    setSearchError(null);

    try {
      const locs = await searchLocations(q);

      setResults(locs);
      setIsOpen(true);
      setFocusIndex(-1);

      if (locs.length === 0) {
        setSearchError(`No cities found for "${q.trim()}".`);
      }
    } catch (error) {
      console.error("Location search failed:", error);

      setResults([]);
      setIsOpen(true);

      if (!navigator.onLine) {
        setSearchError(
          "You appear to be offline. Check your internet connection.",
        );
      } else {
        setSearchError(
          "Unable to search locations right now. Please try again.",
        );
      }
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => doSearch(query), 300);
    } else {
      setResults([]);
      setIsOpen(false);
    }
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setIsOpen(false);
        setFocusIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (loc) => {
    onSelectLocation(loc);
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "Enter" && query.trim().length >= 2) {
        doSearch(query);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (focusIndex >= 0 && results[focusIndex]) {
          handleSelect(results[focusIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setFocusIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={rootRef} className="relative z-30 w-full max-w-xl">
      <div className="glass-card flex items-center gap-2 px-4 py-2 focus-within:border-amber-flare focus-within:ring-2 focus-within:ring-amber-flare/70">
        {/* Search icon / spinner */}
        <span className="flex-shrink-0 text-cloud-white/60" aria-hidden="true">
          {searching || externalLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}
        </span>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search city…"
          className="min-h-[44px] min-w-0 flex-1 appearance-none rounded-none border-0 bg-transparent font-body text-body text-cloud-white caret-amber-flare outline-none placeholder:text-cloud-white/75 focus:border-0 focus:outline-none focus:ring-0"
          aria-label="Search for a city"
          aria-expanded={isOpen}
          aria-controls={resultsId}
          aria-autocomplete="list"
          role="combobox"
          disabled={externalLoading}
          id={inputId}
        />

        {/* Use my location */}
        <button
          onClick={onUseMyLocation}
          className="flex-shrink-0 rounded-full p-2 text-cloud-white/60 transition-colors hover:bg-white/10 hover:text-amber-flare"
          aria-label="Use my current location"
          title="Use my location"
          type="button"
        >
          <MapPin size={18} />
        </button>
      </div>

      {/* Autocomplete dropdown */}
      {isOpen && (
        <GlassCard
          ref={dropdownRef}
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[80] max-h-[45vh] overflow-y-auto py-1 shadow-2xl"
          id={resultsId}
          role="listbox"
        >
          {searchError ? (
            <div className="px-4 py-5 text-center">
              <p className="font-body text-sm text-cloud-white/80">
                {searchError}
              </p>

              <button
                type="button"
                onClick={() => doSearch(query)}
                className="mt-3 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-cloud-white hover:bg-white/15"
              >
                Try again
              </button>
            </div>
          ) : (
            results.map((loc, index) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => handleSelect(loc)}
                onMouseEnter={() => setFocusIndex(index)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                  focusIndex === index
                    ? "bg-white/15 text-cloud-white"
                    : "text-cloud-white/90 hover:bg-white/10"
                }`}
                role="option"
                aria-selected={focusIndex === index}
                id={`${resultsId}-${index}`}
              >
                <MapPin
                  size={16}
                  className="mt-0.5 flex-shrink-0 text-amber-flare"
                />

                <div>
                  <p className="font-body text-body font-semibold">
                    {loc.name}
                  </p>

                  <p className="font-body text-micro text-cloud-white/75">
                    {[loc.admin1, loc.country].filter(Boolean).join(", ")}
                  </p>
                </div>
              </button>
            ))
          )}
        </GlassCard>
      )}
    </div>
  );
}
