import GlassCard from './GlassCard';
import { formatTime, getSunPosition } from '../services/weatherUtils';
import { Sunrise, Sunset } from 'lucide-react';

/**
 * Sunrise/sunset SVG arc visualization.
 * Semicircle with a sun marker positioned proportionally between
 * sunrise → sunset based on current time.
 */
export default function SunriseSunsetArc({ weather }) {
  if (!weather?.daily?.sunrise?.[0] || !weather?.daily?.sunset?.[0]) return null;

  const sunrise = weather.daily.sunrise[0];
  const sunset = weather.daily.sunset[0];
  const sunPosition = getSunPosition(sunrise, sunset, weather.utc_offset_seconds);

  // Arc geometry: semicircle from left to right
  // SVG viewBox is 200x110, arc from (20,90) to (180,90) with peak at (100,15)
  const arcStartX = 20;
  const arcEndX = 180;
  const arcY = 90;
  const arcPeakY = 15;

  // Calculate sun position on the arc using parametric semicircle
  let sunX = arcStartX;
  let sunY = arcY;

  if (sunPosition !== null) {
    const t = sunPosition; // 0 to 1
    // Parametric arc: x goes from start to end, y follows a parabola
    sunX = arcStartX + t * (arcEndX - arcStartX);
    // Parabola: y = arcY - 4 * (arcY - arcPeakY) * t * (1 - t)
    sunY = arcY - 4 * (arcY - arcPeakY) * t * (1 - t);
  }

  const isDaytime = sunPosition !== null;

  return (
    <GlassCard className="flex flex-col items-center p-4 md:p-5" id="sunrise-sunset">
      <h2 className="mb-2 w-full font-body text-section-head font-medium text-cloud-white">
        Sunrise & Sunset
      </h2>

      <svg
        viewBox="0 0 200 110"
        className="w-full max-w-[280px]"
        aria-label={`Sunrise at ${formatTime(sunrise)}, sunset at ${formatTime(sunset)}${isDaytime ? ', currently daytime' : ', currently nighttime'}`}
        role="img"
      >
        {/* Horizon line */}
        <line
          x1={arcStartX}
          y1={arcY}
          x2={arcEndX}
          y2={arcY}
          stroke="rgba(245,247,250,0.15)"
          strokeWidth="1"
        />

        {/* Arc path (dashed, below current position) */}
        <path
          d={`M ${arcStartX} ${arcY} Q 100 ${arcPeakY - 10} ${arcEndX} ${arcY}`}
          fill="none"
          stroke="rgba(245,247,250,0.2)"
          strokeWidth="2"
          strokeDasharray="4 3"
        />

        {/* Traveled arc (solid, up to sun position) */}
        {isDaytime && (
          <path
            d={`M ${arcStartX} ${arcY} Q 100 ${arcPeakY - 10} ${arcEndX} ${arcY}`}
            fill="none"
            stroke="#FFB454"
            strokeWidth="2"
            strokeDasharray={`${sunPosition * 220} 999`}
            opacity="0.7"
          />
        )}

        {/* Sun marker */}
        {isDaytime && (
          <>
            {/* Glow */}
            <circle
              cx={sunX}
              cy={sunY}
              r="12"
              fill="#FFB454"
              opacity="0.2"
            />
            {/* Sun body */}
            <circle
              cx={sunX}
              cy={sunY}
              r="6"
              fill="#FFB454"
            />
          </>
        )}

        {/* Sunrise label */}
        <text
          x={arcStartX}
          y={arcY + 16}
          textAnchor="start"
          fill="rgba(245,247,250,0.75)"
          fontSize="9"
          fontFamily="Inter, sans-serif"
        >
          {formatTime(sunrise)}
        </text>

        {/* Sunset label */}
        <text
          x={arcEndX}
          y={arcY + 16}
          textAnchor="end"
          fill="rgba(245,247,250,0.75)"
          fontSize="9"
          fontFamily="Inter, sans-serif"
        >
          {formatTime(sunset)}
        </text>
      </svg>

      {/* Labels below */}
      <div className="mt-2 flex w-full max-w-[280px] justify-between">
        <div className="flex items-center gap-1.5 font-body text-micro text-cloud-white/80">
          <Sunrise size={14} className="text-amber-flare" aria-hidden="true" />
          <span>Sunrise</span>
        </div>
        <div className="flex items-center gap-1.5 font-body text-micro text-cloud-white/80">
          <Sunset size={14} className="text-storm-violet" aria-hidden="true" />
          <span>Sunset</span>
        </div>
      </div>
    </GlassCard>
  );
}
