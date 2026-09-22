/**
 * Map WMO weather codes to sky gradient keys.
 * These keys correspond to the 6 dynamic sky states from style.md.
 */

const SKY_GRADIENTS = {
  'clear-day': { from: '#4FA8E0', to: '#8FD3F4', needsScrim: true },
  'clear-night': { from: '#0B1526', to: '#1B2A4A', needsScrim: false },
  'cloudy': { from: '#6B7B8C', to: '#9AA7B0', needsScrim: true },
  'rain': { from: '#33465A', to: '#56707E', needsScrim: false },
  'storm': { from: '#241B3A', to: '#443A66', needsScrim: false },
  'snow': { from: '#B9CBDA', to: '#E7F0F7', needsScrim: true },
};

/**
 * Determine sky gradient key from WMO weather code + is_day flag.
 */
export function getSkyGradient(weatherCode, isDay = true) {
  const code = Number(weatherCode);

  // Thunderstorm
  if (code >= 95) return SKY_GRADIENTS['storm'];

  // Snow / freezing
  if ((code >= 71 && code <= 77) || code === 85 || code === 86 || code === 56 || code === 57 || code === 66 || code === 67) {
    return SKY_GRADIENTS['snow'];
  }

  // Rain / drizzle / showers
  if ((code >= 51 && code <= 55) || (code >= 61 && code <= 65) || (code >= 80 && code <= 82)) {
    return SKY_GRADIENTS['rain'];
  }

  // Fog
  if (code === 45 || code === 48) return SKY_GRADIENTS['cloudy'];

  // Overcast / cloudy
  if (code === 2 || code === 3) return SKY_GRADIENTS['cloudy'];

  // Clear / mainly clear
  if (code === 0 || code === 1) {
    return isDay ? SKY_GRADIENTS['clear-day'] : SKY_GRADIENTS['clear-night'];
  }

  // Default fallback
  return isDay ? SKY_GRADIENTS['clear-day'] : SKY_GRADIENTS['clear-night'];
}

/**
 * WMO weather code → human-readable condition label.
 */
const CONDITION_LABELS = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

export function getConditionLabel(weatherCode) {
  return CONDITION_LABELS[Number(weatherCode)] || 'Unknown';
}

/**
 * Temperature conversion.
 */
export function convertTemp(celsius, unit = 'metric') {
  if (unit === 'imperial') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

/**
 * Wind speed conversion (Open-Meteo returns km/h).
 */
export function convertSpeed(kmh, unit = 'metric') {
  if (unit === 'imperial') {
    return Math.round(kmh * 0.621371);
  }
  return Math.round(kmh);
}

/**
 * Pressure conversion (hPa → inHg for imperial).
 */
export function convertPressure(hpa, unit = 'metric') {
  if (unit === 'imperial') {
    return (hpa * 0.02953).toFixed(2);
  }
  return Math.round(hpa);
}

/**
 * Get wind direction label from degrees.
 */
export function getWindDirection(degrees) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return dirs[index];
}

/**
 * Compute "now" as a Date whose getTime() can be compared against
 * new Date(isoString) for wall-clock ISO strings (no offset) from Open-Meteo.
 *
 * Open-Meteo returns times like "2026-09-22T14:00" which new Date() parses
 * as browser-local. We shift "now" into that same frame using the location's
 * utc_offset_seconds so comparisons work for any timezone.
 */
export function getLocationNow(utcOffsetSeconds = 0) {
  const browserOffsetMs = new Date().getTimezoneOffset() * 60000; // negative for east of UTC
  return new Date(Date.now() + utcOffsetSeconds * 1000 + browserOffsetMs);
}

/**
 * Format hour string from ISO datetime.
 */
export function formatHour(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true,
  });
}

/**
 * Format day name from ISO date string.
 * Uses utcOffsetSeconds to determine "today" and "tomorrow" in the
 * searched location's local time, not the browser's.
 */
export function formatDayName(isoString, utcOffsetSeconds = 0) {
  const date = new Date(isoString);
  const today = getLocationNow(utcOffsetSeconds);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Format time from ISO datetime for sunrise/sunset display.
 */
export function formatTime(isoString) {
  if (!isoString) return '--:--';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Calculate sun position as a 0-1 fraction along the sunrise→sunset arc.
 * Returns null if before sunrise or after sunset.
 * Uses utcOffsetSeconds to compute "now" in the searched location's time.
 */
export function getSunPosition(sunrise, sunset, utcOffsetSeconds = 0) {
  if (!sunrise || !sunset) return null;

  const now = getLocationNow(utcOffsetSeconds);
  const sunriseDate = new Date(sunrise);
  const sunsetDate = new Date(sunset);

  if (now < sunriseDate || now > sunsetDate) return null;

  const total = sunsetDate - sunriseDate;
  const elapsed = now - sunriseDate;
  return Math.min(1, Math.max(0, elapsed / total));
}

/**
 * Get the next 24 hours of hourly data starting from the current hour.
 * Uses utcOffsetSeconds to find "now" in the searched location's time.
 */
export function getNext24Hours(hourlyData, utcOffsetSeconds = 0) {
  if (!hourlyData?.time) return [];

  const now = getLocationNow(utcOffsetSeconds);
  const currentHourIndex = hourlyData.time.findIndex((t) => {
    const hourDate = new Date(t);
    return hourDate >= now;
  });

  if (currentHourIndex === -1) return [];

  const hours = [];
  for (let i = currentHourIndex; i < Math.min(currentHourIndex + 24, hourlyData.time.length); i++) {
    hours.push({
      time: hourlyData.time[i],
      temp: hourlyData.temperature_2m[i],
      precipProbability: hourlyData.precipitation_probability?.[i] ?? 0,
      weatherCode: hourlyData.weather_code[i],
    });
  }
  return hours;
}

/**
 * AQI Label mapping (US AQI).
 */
export function getAqiLabel(aqi) {
  if (aqi <= 50) return { label: 'Good', color: '#4ADE80' }; // Green
  if (aqi <= 100) return { label: 'Moderate', color: '#FFB454' }; // Amber
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: '#FB923C' }; // Orange
  if (aqi <= 200) return { label: 'Unhealthy', color: '#FF6B6B' }; // Red
  if (aqi <= 300) return { label: 'Very Unhealthy', color: '#A78BFA' }; // Purple
  return { label: 'Hazardous', color: '#9D174D' }; // Maroon
}

/**
 * UV Index Label mapping.
 */
export function getUvLabel(uv) {
  if (uv <= 2) return { label: 'Low', color: '#4ADE80' };
  if (uv <= 5) return { label: 'Moderate', color: '#FACC15' };
  if (uv <= 7) return { label: 'High', color: '#FB923C' };
  if (uv <= 10) return { label: 'Very High', color: '#FF6B6B' };
  return { label: 'Extreme', color: '#A78BFA' };
}

/**
 * Calculate percentage for scale bars.
 */
export function getScalePercentage(value, max) {
  return Math.min(100, Math.max(0, (value / max) * 100));
}
