import { Search, MapPin, Share } from 'lucide-react';
import UnitToggle from './UnitToggle';

export default function BottomNav({ 
  isSearchOpen,
  onSearchClick, 
  onLocationClick, 
  onShareClick,
  unit,
  setMetric,
  setImperial
}) {
  return (
    <div
      aria-hidden={isSearchOpen}
      className={`fixed bottom-0 left-0 z-50 w-full border-t border-white/10 bg-deep-atmosphere/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl transition-opacity duration-200 md:hidden ${
        isSearchOpen ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex items-center justify-around px-4 py-3">
        <button 
          onClick={onSearchClick}
          className="flex flex-col items-center gap-1 text-cloud-white/85 transition-colors hover:text-amber-flare"
        >
          <Search size={24} />
          <span className="font-body text-[10px] font-medium uppercase tracking-wider">Search</span>
        </button>

        <button 
          onClick={onLocationClick}
          className="flex flex-col items-center gap-1 text-cloud-white/85 transition-colors hover:text-amber-flare"
        >
          <MapPin size={24} />
          <span className="font-body text-[10px] font-medium uppercase tracking-wider">Locate</span>
        </button>

        <div className="flex flex-col items-center gap-1">
          <UnitToggle 
            unit={unit} 
            onSetMetric={setMetric} 
            onSetImperial={setImperial} 
          />
          <span className="font-body text-[10px] font-medium uppercase tracking-wider text-cloud-white/85 mt-1">Units</span>
        </div>

        <button 
          onClick={onShareClick}
          className="flex flex-col items-center gap-1 text-cloud-white/85 transition-colors hover:text-amber-flare"
        >
          <Share size={24} />
          <span className="font-body text-[10px] font-medium uppercase tracking-wider">Share</span>
        </button>
      </div>
    </div>
  );
}
