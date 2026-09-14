import { Wind } from 'lucide-react';
import GlassCard from './GlassCard';
import { getAqiLabel, getScalePercentage } from '../services/weatherUtils';

export default function AqiCard({ aqiData }) {
  if (!aqiData?.current?.us_aqi) return null;

  const aqi = Math.round(aqiData.current.us_aqi);
  const pm25 = aqiData.current.pm2_5;
  const { label, color } = getAqiLabel(aqi);
  const percentage = getScalePercentage(aqi, 300); // 300+ is hazardous

  return (
    <GlassCard className="flex h-full flex-col justify-between gap-3 p-4 md:p-5" id="aqi-card">
      <div className="flex items-center gap-2">
        <Wind size={16} className="text-cloud-white/75" aria-hidden="true" />
        <h2 className="font-body text-micro font-medium uppercase tracking-wider text-cloud-white/75">
          Air Quality
        </h2>
      </div>

      <div>
        <div className="flex items-end justify-between">
          <div>
            <p className="font-display text-3xl font-bold text-cloud-white">
              {aqi}
            </p>
            <p className="font-body text-sm font-semibold" style={{ color }}>
              {label}
            </p>
          </div>
          {pm25 && (
            <div className="text-right">
              <p className="font-body text-micro text-cloud-white/75">Primary Pollutant</p>
              <p className="font-body text-sm font-medium text-cloud-white/80">PM2.5: {pm25} µg/m³</p>
            </div>
          )}
        </div>

        {/* AQI Gradient Bar */}
        <div className="relative mt-4 h-2 w-full rounded-full bg-gradient-to-r from-green-400 via-amber-400 via-red-500 to-purple-800">
          {/* Marker */}
          <div
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-transparent shadow-sm"
            style={{ left: `${percentage}%` }}
            aria-label={`AQI marker at ${aqi}`}
          />
        </div>
      </div>
    </GlassCard>
  );
}
