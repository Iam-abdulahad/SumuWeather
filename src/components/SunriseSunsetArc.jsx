import { useMemo } from 'react';
import GlassCard from './GlassCard';
import { formatTime, getSunPosition } from '../services/weatherUtils';
import { Sunrise, Sunset, Moon } from 'lucide-react';

/**
 * Sunrise/sunset (day) or moonrise/moonset (night) SVG arc visualization.
 * Semicircle with a sun or moon marker positioned proportionally along the
 * current light/dark period, styled to match live weather conditions.
 */

// --- time helpers ------------------------------------------------------

// Open-Meteo returns daily sunrise/sunset as local ISO strings with no
// timezone suffix (e.g. "2026-09-22T06:12"), representing wall-clock time
// at the forecast location. To compare against "now" reliably regardless
// of the viewer's own timezone, parse the string as if its components were
// UTC, then shift by utc_offset_seconds to get the true UTC instant.
function localIsoToUtcMs(isoString, utcOffsetSeconds = 0) {
  if (!isoString) return null;
  const [datePart, timePart = '00:00'] = isoString.split('T');
  const [y, mo, d] = datePart.split('-').map(Number);
  const [h, mi] = timePart.split(':').map(Number);
  return Date.UTC(y, mo - 1, d, h, mi) - utcOffsetSeconds * 1000;
}

const DAY_MS = 24 * 60 * 60 * 1000;

// --- moon phase ----------------------------------------------------------

const SYNODIC_MONTH_DAYS = 29.53058867;
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0);

function getMoonPhase(nowMs) {
  const daysSince = (nowMs - KNOWN_NEW_MOON_UTC) / DAY_MS;
  let phase = (daysSince % SYNODIC_MONTH_DAYS) / SYNODIC_MONTH_DAYS;
  if (phase < 0) phase += 1;

  const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2; // 0..1
  const waxing = phase < 0.5;

  let name = 'New Moon';
  if (phase < 0.03 || phase > 0.97) name = 'New Moon';
  else if (phase < 0.22) name = 'Waxing Crescent';
  else if (phase < 0.28) name = 'First Quarter';
  else if (phase < 0.47) name = 'Waxing Gibbous';
  else if (phase < 0.53) name = 'Full Moon';
  else if (phase < 0.72) name = 'Waning Gibbous';
  else if (phase < 0.78) name = 'Last Quarter';
  else name = 'Waning Crescent';

  return { phase, illumination, waxing, name };
}

// --- weather condition -----------------------------------------------

// Maps common Open-Meteo WMO weather codes to a simple sky condition.
// Falls back gracefully to "clear" if the field isn't present on `weather`
// — adjust the optional-chain paths below if your API shape differs.
function getSkyCondition(weather) {
  const code =
    weather?.current?.weather_code ??
    weather?.current_weather?.weathercode ??
    weather?.daily?.weather_code?.[0];
  const cloudCover = weather?.current?.cloud_cover;

  if (code === undefined || code === null) {
    if (typeof cloudCover === 'number') {
      if (cloudCover < 20) return { type: 'clear', cloudiness: 0.05 };
      if (cloudCover < 60) return { type: 'partly-cloudy', cloudiness: 0.35 };
      return { type: 'overcast', cloudiness: 0.7 };
    }
    return { type: 'clear', cloudiness: 0.05 };
  }

  if (code === 0) return { type: 'clear', cloudiness: 0.05 };
  if (code <= 2) return { type: 'partly-cloudy', cloudiness: 0.3 };
  if (code === 3) return { type: 'overcast', cloudiness: 0.75 };
  if (code === 45 || code === 48) return { type: 'fog', cloudiness: 0.6 };
  if (code >= 51 && code <= 67) return { type: 'rain', cloudiness: 0.7 };
  if (code >= 71 && code <= 77) return { type: 'snow', cloudiness: 0.65 };
  if (code >= 80 && code <= 82) return { type: 'rain', cloudiness: 0.7 };
  if (code >= 85 && code <= 86) return { type: 'snow', cloudiness: 0.65 };
  if (code >= 95) return { type: 'storm', cloudiness: 0.85 };
  return { type: 'clear', cloudiness: 0.05 };
}

// Stable star field so it doesn't reshuffle on every re-render.
function useStarField(count = 22) {
  return useMemo(() => {
    // simple deterministic PRNG so stars are stable across renders
    let seed = 42;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    return Array.from({ length: count }, () => ({
      x: 10 + rand() * 180,
      y: 8 + rand() * 68,
      r: 0.5 + rand() * 1,
      delay: rand() * 3,
      opacity: 0.35 + rand() * 0.5,
    }));
  }, [count]);
}

export default function SunriseSunsetArc({ weather }) {
  const stars = useStarField();

  if (!weather?.daily?.sunrise?.[0] || !weather?.daily?.sunset?.[0]) return null;

  const sunrise = weather.daily.sunrise[0];
  const sunset = weather.daily.sunset[0];
  const utcOffset = weather.utc_offset_seconds ?? 0;
  const sky = getSkyCondition(weather);

  // Arc geometry: semicircle from left to right
  const arcStartX = 20;
  const arcEndX = 180;
  const arcY = 90;
  const arcPeakY = 15;

  const pointOnArc = (t) => ({
    x: arcStartX + t * (arcEndX - arcStartX),
    y: arcY - 4 * (arcY - arcPeakY) * t * (1 - t),
  });

  // Daytime position (unchanged sun-position logic from before)
  const sunPosition = getSunPosition(sunrise, sunset, utcOffset);
  const isDaytime = sunPosition !== null;

  // Nighttime window + moon position
  const nowMs = Date.now();
  const sunriseTodayMs = localIsoToUtcMs(sunrise, utcOffset);
  const sunsetTodayMs = localIsoToUtcMs(sunset, utcOffset);

  let moonProgress = null;
  let moonriseLabel = null;
  let moonsetLabel = null;

  if (!isDaytime && sunriseTodayMs !== null && sunsetTodayMs !== null) {
    let nightStartMs;
    let nightEndMs;

    if (nowMs < sunriseTodayMs) {
      // Small hours before today's sunrise — night began at "yesterday's"
      // sunset. We only have today's sunset, so approximate the previous
      // one as 24h earlier (close enough day-to-day for the arc visual).
      nightEndMs = sunriseTodayMs;
      nightStartMs = sunsetTodayMs - DAY_MS;
    } else {
      // After today's sunset, heading toward tomorrow's sunrise.
      nightStartMs = sunsetTodayMs;
      const sunriseTomorrow = weather.daily.sunrise?.[1];
      nightEndMs = sunriseTomorrow
        ? localIsoToUtcMs(sunriseTomorrow, utcOffset)
        : sunriseTodayMs + DAY_MS;
    }

    moonProgress = Math.min(1, Math.max(0, (nowMs - nightStartMs) / (nightEndMs - nightStartMs)));
    moonriseLabel = formatTime(new Date(nightStartMs).toISOString());
    moonsetLabel = formatTime(new Date(nightEndMs).toISOString());
  }

  const sunPoint = isDaytime ? pointOnArc(sunPosition) : null;
  const moonPoint = moonProgress !== null ? pointOnArc(moonProgress) : null;
  const moon = getMoonPhase(nowMs);

  // Weather-reactive styling
  const cloudy = sky.cloudiness > 0.25;
  const veryOvercast = sky.cloudiness > 0.6;
  const sunGlowOpacity = Math.max(0.12, 0.35 - sky.cloudiness * 0.3);
  const sunBodyOpacity = Math.max(0.45, 1 - sky.cloudiness * 0.7);
  const moonGlowOpacity = Math.max(0.08, 0.28 - sky.cloudiness * 0.25);
  const moonBodyOpacity = Math.max(0.4, 1 - sky.cloudiness * 0.6);
  const showStars = !isDaytime && sky.cloudiness < 0.55;

  const heading = isDaytime
    ? 'Sunrise & Sunset'
    : moonProgress !== null
      ? `Moonrise & Moonset · ${moon.name}`
      : 'Sunrise & Sunset';

  // Small cloud glyph drawn in front of the sun/moon when it's cloudy
  const CloudGlyph = ({ cx, cy }) => (
    <g opacity={Math.min(0.85, sky.cloudiness + 0.15)}>
      <ellipse cx={cx - 6} cy={cy + 4} rx="7" ry="4.5" fill="rgba(245,247,250,0.55)" />
      <ellipse cx={cx + 4} cy={cy + 5} rx="8" ry="5" fill="rgba(245,247,250,0.55)" />
      <ellipse cx={cx - 1} cy={cy + 2} rx="9" ry="5.5" fill="rgba(245,247,250,0.6)" />
    </g>
  );

  return (
    <GlassCard className="flex flex-col items-center p-4 md:p-5" id="sunrise-sunset">
      <h2 className="mb-2 w-full font-body text-section-head font-medium text-cloud-white">
        {heading}
      </h2>

      <svg
        viewBox="0 0 200 110"
        className="w-full max-w-[280px]"
        aria-label={
          isDaytime
            ? `Sunrise at ${formatTime(sunrise)}, sunset at ${formatTime(sunset)}, currently daytime, sky ${sky.type}`
            : `Moonrise at ${moonriseLabel}, moonset at ${moonsetLabel}, currently nighttime, ${moon.name}, sky ${sky.type}`
        }
        role="img"
      >
        {/* Night sky: stars */}
        {showStars &&
          stars.map((s, i) => (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill="#F5F7FA"
              opacity={s.opacity}
            >
              <animate
                attributeName="opacity"
                values={`${s.opacity};${s.opacity * 0.25};${s.opacity}`}
                dur="3s"
                begin={`${s.delay}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}

        {/* Horizon line */}
        <line
          x1={arcStartX}
          y1={arcY}
          x2={arcEndX}
          y2={arcY}
          stroke="rgba(245,247,250,0.15)"
          strokeWidth="1"
        />

        {/* Arc path (dashed, full track) */}
        <path
          d={`M ${arcStartX} ${arcY} Q 100 ${arcPeakY - 10} ${arcEndX} ${arcY}`}
          fill="none"
          stroke="rgba(245,247,250,0.2)"
          strokeWidth="2"
          strokeDasharray="4 3"
        />

        {/* Traveled arc (solid, up to current position) */}
        {isDaytime && (
          <path
            d={`M ${arcStartX} ${arcY} Q 100 ${arcPeakY - 10} ${arcEndX} ${arcY}`}
            fill="none"
            stroke="#FFB454"
            strokeWidth="2"
            strokeDasharray={`${sunPosition * 220} 999`}
            opacity={cloudy ? 0.35 : 0.7}
          />
        )}
        {moonProgress !== null && (
          <path
            d={`M ${arcStartX} ${arcY} Q 100 ${arcPeakY - 10} ${arcEndX} ${arcY}`}
            fill="none"
            stroke="#B9C2E6"
            strokeWidth="2"
            strokeDasharray={`${moonProgress * 220} 999`}
            opacity={cloudy ? 0.3 : 0.6}
          />
        )}

        {/* Sun marker */}
        {isDaytime && sunPoint && (
          <>
            {!veryOvercast && (
              <>
                <circle cx={sunPoint.x} cy={sunPoint.y} r="14" fill="#FFB454" opacity={sunGlowOpacity} />
                <circle cx={sunPoint.x} cy={sunPoint.y} r="8" fill="#FFB454" opacity={sunGlowOpacity * 0.7} />
              </>
            )}
            <circle cx={sunPoint.x} cy={sunPoint.y} r="6" fill="#FFB454" opacity={sunBodyOpacity} />
            {cloudy && <CloudGlyph cx={sunPoint.x} cy={sunPoint.y} />}
          </>
        )}

        {/* Moon marker */}
        {moonProgress !== null && moonPoint && (
          <>
            {!veryOvercast && (
              <circle cx={moonPoint.x} cy={moonPoint.y} r="12" fill="#DCE3F7" opacity={moonGlowOpacity} />
            )}
            {/* Moon disc with a phase-shaped shadow overlay */}
            <g opacity={moonBodyOpacity}>
              <circle cx={moonPoint.x} cy={moonPoint.y} r="6" fill="#F1F4FC" />
              <circle
                cx={moon.waxing ? moonPoint.x - 6 * (1 - moon.illumination) * 2 + 6 : moonPoint.x + 6 * (1 - moon.illumination) * 2 - 6}
                cy={moonPoint.y}
                r="6"
                fill="#1B1F30"
                opacity={1 - moon.illumination}
              />
            </g>
            {cloudy && <CloudGlyph cx={moonPoint.x} cy={moonPoint.y} />}
          </>
        )}

        {/* Start label */}
        <text
          x={arcStartX}
          y={arcY + 16}
          textAnchor="start"
          fill="rgba(245,247,250,0.75)"
          fontSize="9"
          fontFamily="Inter, sans-serif"
        >
          {isDaytime ? formatTime(sunrise) : moonriseLabel ?? formatTime(sunrise)}
        </text>

        {/* End label */}
        <text
          x={arcEndX}
          y={arcY + 16}
          textAnchor="end"
          fill="rgba(245,247,250,0.75)"
          fontSize="9"
          fontFamily="Inter, sans-serif"
        >
          {isDaytime ? formatTime(sunset) : moonsetLabel ?? formatTime(sunset)}
        </text>
      </svg>

      {/* Labels below */}
      <div className="mt-2 flex w-full max-w-[280px] justify-between">
        {isDaytime ? (
          <>
            <div className="flex items-center gap-1.5 font-body text-micro text-cloud-white/80">
              <Sunrise size={14} className="text-amber-flare" aria-hidden="true" />
              <span>Sunrise</span>
            </div>
            <div className="flex items-center gap-1.5 font-body text-micro text-cloud-white/80">
              <Sunset size={14} className="text-storm-violet" aria-hidden="true" />
              <span>Sunset</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 font-body text-micro text-cloud-white/80">
              <Moon size={14} className="text-storm-violet" aria-hidden="true" />
              <span>Moonrise</span>
            </div>
            <div className="flex items-center gap-1.5 font-body text-micro text-cloud-white/80">
              <Moon size={14} className="text-storm-violet" aria-hidden="true" />
              <span>Moonset</span>
            </div>
          </>
        )}
      </div>

      {!isDaytime && (
        <p className="mt-1 font-body text-micro text-cloud-white/60">
          {moon.name} · {Math.round(moon.illumination * 100)}% illuminated
        </p>
      )}
    </GlassCard>
  );
}
