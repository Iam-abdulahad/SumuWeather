import { MapPin, Share } from "lucide-react";
import UnitToggle from "./UnitToggle";

export default function BottomNav({
  onLocationClick,
  onShareClick,
  unit,
  setMetric,
  setImperial,
  isLocating = false,
}) {
  return (
    <nav
      className="mobile-bottom-nav fixed bottom-0 left-0 z-50 w-full md:hidden"
      aria-label="Weather controls"
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-3">
        {/* Locate */}
        <button
          type="button"
          onClick={onLocationClick}
          disabled={isLocating}
          className="bottom-nav-button"
          aria-label="Use my current location"
        >
          <MapPin
            size={23}
            className={isLocating ? "animate-pulse text-amber-flare" : ""}
          />

          <span>{isLocating ? "Locating…" : "Locate"}</span>
        </button>

        {/* Units */}
        <div className="flex flex-col items-center gap-1">
          <UnitToggle
            unit={unit}
            onSetMetric={setMetric}
            onSetImperial={setImperial}
          />

          <span className="bottom-nav-label">Units</span>
        </div>

        {/* Share */}
        <button
          type="button"
          onClick={onShareClick}
          className="bottom-nav-button"
          aria-label="Share weather snapshot"
        >
          <Share size={23} />

          <span>Share</span>
        </button>
      </div>
    </nav>
  );
}
