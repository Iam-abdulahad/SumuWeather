import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplets } from 'lucide-react';
import GlassCard from './GlassCard';
import { getNext24Hours, formatHour } from '../services/weatherUtils';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/20 bg-deep-atmosphere/80 px-3 py-2 text-cloud-white shadow-lg backdrop-blur-md">
        <p className="font-body text-micro font-medium text-cloud-white/85">{label}</p>
        <p className="font-body text-sm font-bold text-storm-violet">
          {payload[0].value}% Chance
        </p>
      </div>
    );
  }
  return null;
};

export default function PrecipChart({ weather }) {
  if (!weather?.hourly) return null;

  const next24 = getNext24Hours(weather.hourly);
  if (!next24 || next24.length === 0) return null;

  const data = next24.map(h => ({
    time: formatHour(h.time),
    precip: h.precipProbability,
  }));

  return (
    <GlassCard className="flex min-h-[220px] h-full flex-col gap-3 p-4 md:p-5" id="precip-chart">
      <div className="flex items-center gap-2">
        <Droplets size={16} className="text-cloud-white/75" aria-hidden="true" />
        <h2 className="font-body text-micro font-medium uppercase tracking-wider text-cloud-white/75">
          Precipitation Chance
        </h2>
      </div>

      <div className="mt-2 h-40 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrecip" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C6FF0" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7C6FF0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: 'rgba(245, 247, 250, 0.75)', fontSize: 11, fontFamily: 'Inter' }}
              minTickGap={20}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              dataKey="precip" 
              stroke="#7C6FF0" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPrecip)" 
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
