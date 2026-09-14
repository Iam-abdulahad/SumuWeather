import { Droplets } from 'lucide-react';
import GlassCard from './GlassCard';

/**
 * Humidity card with percentage and a simple progress bar.
 */
export default function HumidityCard({ weather }) {
  if (!weather?.current) return null;

  const humidity = weather.current.relative_humidity_2m;

  // Comfort level
  let comfort = 'Comfortable';
  if (humidity < 30) comfort = 'Dry';
  else if (humidity > 70) comfort = 'Humid';

  return (
    <GlassCard className="flex flex-col gap-3 p-4 md:p-5" id="humidity-card">
      <div className="flex items-center gap-2">
        <Droplets size={16} className="text-cloud-white/75" aria-hidden="true" />
        <h2 className="font-body text-micro font-medium uppercase tracking-wider text-cloud-white/75">
          Humidity
        </h2>
      </div>

      <div>
        <p className="font-display text-2xl font-bold text-cloud-white">
          {humidity}
          <span className="ml-0.5 font-body text-micro font-medium text-cloud-white/75">
            %
          </span>
        </p>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-storm-violet to-amber-flare transition-all duration-500"
            style={{ width: `${humidity}%` }}
            role="progressbar"
            aria-valuenow={humidity}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Humidity ${humidity}%`}
          />
        </div>

        <p className="mt-1.5 font-body text-micro text-cloud-white/75">
          {comfort}
        </p>
      </div>
    </GlassCard>
  );
}
