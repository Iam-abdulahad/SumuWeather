import {
  Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudFog,
  CloudDrizzle, CloudSun, Snowflake, Wind,
} from 'lucide-react';
import GlassCard from './GlassCard';
import {
  convertTemp, convertSpeed, convertPressure,
  getConditionLabel, getWindDirection,
} from '../services/weatherUtils';

// Map WMO codes to Lucide icons
function WeatherIcon({ code, size = 48, className = '' }) {
  const iconProps = { size, className, strokeWidth: 1.5 };
  const c = Number(code);

  if (c >= 95) return <CloudLightning {...iconProps} aria-hidden="true" />;
  if (c >= 80 && c <= 82) return <CloudRain {...iconProps} aria-hidden="true" />;
  if (c === 85 || c === 86 || (c >= 71 && c <= 77)) return <CloudSnow {...iconProps} aria-hidden="true" />;
  if ((c >= 56 && c <= 57) || (c >= 66 && c <= 67)) return <Snowflake {...iconProps} aria-hidden="true" />;
  if ((c >= 61 && c <= 65)) return <CloudRain {...iconProps} aria-hidden="true" />;
  if ((c >= 51 && c <= 55)) return <CloudDrizzle {...iconProps} aria-hidden="true" />;
  if (c === 45 || c === 48) return <CloudFog {...iconProps} aria-hidden="true" />;
  if (c === 2 || c === 3) return <Cloud {...iconProps} aria-hidden="true" />;
  if (c === 1) return <CloudSun {...iconProps} aria-hidden="true" />;
  if (c === 0) return <Sun {...iconProps} aria-hidden="true" />;

  return <Cloud {...iconProps} aria-hidden="true" />;
}

/**
 * Hero card — largest tile in the bento grid.
 * Shows: location, current temp (Space Grotesk 96px), condition, hi/lo, feels like, pressure.
 * Left-aligned content per style.md.
 */
export default function HeroCard({ weather, location, unit }) {
  if (!weather?.current) return null;

  const { current, daily } = weather;
  const conditionLabel = getConditionLabel(current.weather_code);
  const temp = convertTemp(current.temperature_2m, unit);
  const feelsLike = convertTemp(current.apparent_temperature, unit);
  const hi = daily?.temperature_2m_max?.[0] != null
    ? convertTemp(daily.temperature_2m_max[0], unit) : null;
  const lo = daily?.temperature_2m_min?.[0] != null
    ? convertTemp(daily.temperature_2m_min[0], unit) : null;
  const windSpeed = convertSpeed(current.wind_speed_10m, unit);
  const windDir = getWindDirection(current.wind_direction_10m);
  const pressure = convertPressure(current.surface_pressure, unit);
  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const speedUnit = unit === 'metric' ? 'km/h' : 'mph';
  const pressureUnit = unit === 'metric' ? 'hPa' : 'inHg';

  // Build local time
  const localTime = new Date().toLocaleString('en-US', {
    timeZone: weather.timezone || 'UTC',
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <GlassCard className="flex flex-col justify-between p-6 md:p-8" id="hero-card">
      {/* Top — location & time */}
      <div>
        <p className="font-body text-micro font-medium text-cloud-white/80">
          {localTime}
        </p>
        <h1 className="mt-1 font-body text-2xl font-bold text-cloud-white md:text-3xl">
          {location?.name || 'Your Location'}
        </h1>
      </div>

      {/* Center — temp & condition */}
      <div className="my-6 flex items-end gap-4 md:my-8">
        <span
          className="font-display text-hero-temp leading-none text-cloud-white"
          aria-label={`Current temperature ${temp}${tempUnit}`}
        >
          {temp}°
        </span>
        <div className="mb-2 flex flex-col gap-1">
          <WeatherIcon code={current.weather_code} size={40} className="text-cloud-white/80" />
          <span className="sr-only">{conditionLabel}</span>
          <p className="font-body text-body font-medium text-cloud-white/80">
            {conditionLabel}
          </p>
        </div>
      </div>

      {/* Bottom — details row */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 font-body text-micro text-cloud-white/80">
        {hi !== null && lo !== null && (
          <span>
            H:{hi}° L:{lo}°
          </span>
        )}
        <span>Feels like {feelsLike}{tempUnit}</span>
        <span className="flex items-center gap-1">
          <Wind size={14} aria-hidden="true" />
          {windSpeed} {speedUnit} {windDir}
        </span>
        <span>Pressure {pressure} {pressureUnit}</span>
        <span>Humidity {current.relative_humidity_2m}%</span>
      </div>
    </GlassCard>
  );
}
