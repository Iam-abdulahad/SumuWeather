import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

/**
 * Severe alerts banner based on NWS API data.
 * Renders only if real alert data exists.
 * Signal Red per style.md, dismissible.
 */
export default function AlertBanner({ alerts }) {
  const [dismissed, setDismissed] = useState(false);

  if (!alerts || alerts.length === 0 || dismissed) {
    return null;
  }

  // Get the most severe/first alert
  const primaryAlert = alerts[0].properties;

  return (
    <div className="mb-4 w-full">
      <div className="glass-card flex items-start gap-3 bg-[#FF6B6B]/20 border-[#FF6B6B]/40 p-4 shadow-lg shadow-red-950/20 backdrop-blur-xl">
        <div className="mt-0.5 flex-shrink-0 text-[#FF6B6B]">
          <AlertTriangle size={20} aria-hidden="true" />
        </div>
        
        <div className="flex-1">
          <h2 className="font-body text-body font-bold text-cloud-white">
            {primaryAlert.event}
          </h2>
          <p className="mt-1 font-body text-micro text-cloud-white/90 line-clamp-2">
            {primaryAlert.headline || primaryAlert.description}
          </p>
          {alerts.length > 1 && (
            <p className="mt-2 font-body text-micro font-medium text-[#FF6B6B]">
              + {alerts.length - 1} more active alert(s)
            </p>
          )}
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 rounded-full p-1 text-cloud-white/60 transition-colors hover:bg-white/20 hover:text-cloud-white"
          aria-label="Dismiss alert"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
