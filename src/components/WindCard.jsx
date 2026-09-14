import { Wind, Navigation } from 'lucide-react';
import GlassCard from './GlassCard';
import { convertSpeed, getWindDirection } from '../services/weatherUtils';

/**
 * Wind speed + direction card with a rotated arrow.
 */
export default function WindCard({ weather, unit }) {
  if (!weather?.current) return null;

  const speed = convertSpeed(weather.current.wind_speed_10m, unit);
  const direction = getWindDirection(weather.current.wind_direction_10m);
  const degrees = weather.current.wind_direction_10m;
  const speedUnit = unit === 'metric' ? 'km/h' : 'mph';

  return (
    <GlassCard className="flex flex-col gap-3 p-4 md:p-5" id="wind-card">
      <div className="flex items-center gap-2">
        <Wind size={16} className="text-cloud-white/75" aria-hidden="true" />
        <h2 className="font-body text-micro font-medium uppercase tracking-wider text-cloud-white/75">
          Wind
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Direction arrow */}
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
          aria-hidden="true"
        >
          <Navigation
            size={20}
            className="text-cloud-white/85"
            style={{ transform: `rotate(${degrees + 180}deg)` }}
          />
        </div>

        <div>
          <p className="font-display text-2xl font-bold text-cloud-white">
            {speed}
            <span className="ml-1 font-body text-micro font-medium text-cloud-white/75">
              {speedUnit}
            </span>
          </p>
          <p className="font-body text-micro text-cloud-white/75">
            {direction}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
