import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import GlassCard from './GlassCard';
import { formatDayName, convertTemp } from '../services/weatherUtils';

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    const tempUnit = unit === 'metric' ? '°C' : '°F';
    return (
      <div className="rounded-lg border border-white/20 bg-deep-atmosphere/80 px-3 py-2 text-cloud-white shadow-lg backdrop-blur-md">
        <p className="font-body text-micro font-medium text-cloud-white/85">{label}</p>
        <p className="font-body text-sm font-bold text-amber-flare">
          High: {payload[0].value}{tempUnit}
        </p>
        <p className="font-body text-sm font-bold text-storm-violet">
          Low: {payload[1].value}{tempUnit}
        </p>
      </div>
    );
  }
  return null;
};

export default function TempTrendChart({ weather, unit }) {
  if (!weather?.daily) return null;

  const data = weather.daily.time.map((date, i) => ({
    date: formatDayName(date),
    high: convertTemp(weather.daily.temperature_2m_max[i], unit),
    low: convertTemp(weather.daily.temperature_2m_min[i], unit),
  }));

  // We want to show a 10-day trend. If the API returns fewer, it will just plot what's there.
  return (
    <GlassCard className="flex min-h-[220px] h-full flex-col gap-3 p-4 md:p-5" id="temp-trend-chart">
      <div className="flex items-center gap-2">
        <TrendingUp size={16} className="text-cloud-white/75" aria-hidden="true" />
        <h2 className="font-body text-micro font-medium uppercase tracking-wider text-cloud-white/75">
          Temperature Trend
        </h2>
      </div>

      <div className="mt-2 h-40 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <XAxis 
              dataKey="date" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: 'rgba(245, 247, 250, 0.75)', fontSize: 11, fontFamily: 'Inter' }}
              minTickGap={20}
            />
            {/* Hide YAxis but keep it for scale */}
            <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }} />
            
            <Line 
              type="monotone" 
              dataKey="high" 
              stroke="#FFB454" 
              strokeWidth={3}
              dot={{ r: 3, fill: '#FFB454', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              animationDuration={800}
            />
            <Line 
              type="monotone" 
              dataKey="low" 
              stroke="#7C6FF0" 
              strokeWidth={3}
              dot={{ r: 3, fill: '#7C6FF0', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
