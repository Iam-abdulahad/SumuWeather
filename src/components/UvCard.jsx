import { Sun } from 'lucide-react';
import GlassCard from './GlassCard';
import { getUvLabel, getScalePercentage } from '../services/weatherUtils';

export default function UvCard({ weather }) {
  if (!weather?.daily?.uv_index_max?.[0]) return null;

  const uv = Math.round(weather.daily.uv_index_max[0]);
  const { label, color } = getUvLabel(uv);
  const percentage = getScalePercentage(uv, 11);

  return (
    <GlassCard className="flex flex-col gap-3 p-4 md:p-5" id="uv-card">
      <div className="flex items-center gap-2">
        <Sun size={16} className="text-cloud-white/75" aria-hidden="true" />
        <h2 className="font-body text-micro font-medium uppercase tracking-wider text-cloud-white/75">
          UV Index
        </h2>
      </div>

      <div>
        <p className="font-display text-2xl font-bold text-cloud-white">
          {uv}
        </p>
        <p className="font-body text-micro text-cloud-white/80" style={{ color }}>
          {label}
        </p>

        {/* Gradient bar */}
        <div className="relative mt-3 h-2 w-full rounded-full bg-gradient-to-r from-green-400 via-amber-400 to-purple-500">
          {/* Marker */}
          <div
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-transparent shadow-sm"
            style={{ left: `${percentage}%` }}
            aria-label={`UV Index marker at ${uv}`}
          />
        </div>
      </div>
    </GlassCard>
  );
}
