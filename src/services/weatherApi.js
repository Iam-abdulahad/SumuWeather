import axios from 'axios';

const WEATHER_BASE = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1/search';
const AQI_BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const NWS_ALERTS_BASE = 'https://api.weather.gov/alerts/active';

/**
 * Fetch current + hourly (48h) + daily (10d) weather data.
 * Returns raw Open-Meteo response data.
 */
export async function fetchWeather(lat, lon, timezone = 'auto') {
  const { data } = await axios.get(WEATHER_BASE, {
    params: {
      latitude: lat,
      longitude: lon,
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'wind_speed_10m',
        'wind_direction_10m',
        'weather_code',
        'apparent_temperature',
        'surface_pressure',
        'is_day',
      ].join(','),
      hourly: [
        'temperature_2m',
        'precipitation_probability',
        'weather_code',
      ].join(','),
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'sunrise',
        'sunset',
        'precipitation_sum',
        'weather_code',
        'wind_speed_10m_max',
        'uv_index_max'
      ].join(','),
      timezone,
      forecast_days: 10,
    },
  });
  return data;
}

/**
 * Fetch Air Quality data.
 */
export async function fetchAirQuality(lat, lon, timezone = 'auto') {
  const { data } = await axios.get(AQI_BASE, {
    params: {
      latitude: lat,
      longitude: lon,
      current: [
        'us_aqi',
        'pm10',
        'pm2_5',
        'carbon_monoxide',
        'nitrogen_dioxide'
      ].join(','),
      timezone,
    },
  });
  return data;
}

/**
 * Fetch active alerts from US National Weather Service.
 * Silently returns null if the location is outside the US or the API fails.
 */
export async function fetchAlerts(lat, lon) {
  // Rough bounding box for US (including Alaska/Hawaii somewhat) to prevent 400 errors in console for international locations
  if (lat < 18 || lat > 72 || lon < -170 || lon > -65) {
    return null;
  }

  try {
    const { data } = await axios.get(NWS_ALERTS_BASE, {
      params: { point: `${lat},${lon}` },
      headers: {
        'Accept': 'application/geo+json'
      }
    });
    return data.features && data.features.length > 0 ? data.features : null;
  } catch {
    // Fails if NWS is down or returns error
    return null;
  }
}

/**
 * Search locations via Open-Meteo Geocoding API.
 * Returns array of { id, name, country, admin1, latitude, longitude }.
 */
export async function searchLocations(query, count = 6) {
  if (!query || query.trim().length < 2) return [];

  const { data } = await axios.get(GEOCODING_BASE, {
    params: { name: query.trim(), count, language: 'en', format: 'json' },
  });

  if (!data.results) return [];

  return data.results.map((r) => ({
    id: r.id,
    name: r.name,
    country: r.country || '',
    countryCode: r.country_code || '',
    admin1: r.admin1 || '',
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone || 'auto',
  }));
}

/**
 * Reverse-geocode coordinates to get a place name.
 * Uses Open-Meteo geocoding with a tight bounding box trick —
 * search for coords, take the closest result.
 * Falls back to "Your Location" if no match.
 */
export async function reverseGeocode(lat, lon) {
  try {
    // Open-Meteo doesn't have a true reverse endpoint, so we use
    // a Nominatim fallback for city name resolution.
    const { data } = await axios.get(
      `https://nominatim.openstreetmap.org/reverse`,
      {
        params: { lat, lon, format: 'json', zoom: 10 },
        headers: { 'Accept-Language': 'en' },
      }
    );

    return (
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      data.name ||
      'Your Location'
    );
  } catch {
    return 'Your Location';
  }
}
