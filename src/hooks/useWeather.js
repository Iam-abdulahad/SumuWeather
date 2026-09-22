import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchWeather, searchLocations, reverseGeocode, fetchAirQuality, fetchAlerts } from '../services/weatherApi';

const STORAGE_KEY = 'sumo-weather-locations-v2';

function loadSavedLocations() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocations(locations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

/**
 * Central data hook for weather state.
 *
 * Exposes: weather, aqi, alerts, location, loading, error, geoStatus,
 * selectLocation, refreshWeather, savedLocations, addLocation, removeLocation
 */
export default function useWeather() {
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [location, setLocation] = useState(null); // { name, latitude, longitude, timezone, id }
  
  const [savedLocations, setSavedLocations] = useState(loadSavedLocations());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [geoStatus, setGeoStatus] = useState('pending'); // 'pending' | 'granted' | 'denied' | 'unavailable'

  // Track the last-attempted coordinates so retry works even if the first fetch failed
  const lastAttemptRef = useRef(null);

  // Fetch weather for given coords
  const loadWeather = useCallback(async (lat, lon, timezone = 'auto', cityName = null) => {
    lastAttemptRef.current = { lat, lon, timezone, cityName };
    setLoading(true);
    setError(null);

    try {
      const [weatherRes, aqiRes, alertsRes] = await Promise.allSettled([
        fetchWeather(lat, lon, timezone),
        fetchAirQuality(lat, lon, timezone),
        fetchAlerts(lat, lon)
      ]);

      if (weatherRes.status === 'rejected') {
        throw new Error('Weather fetch failed');
      }

      const data = weatherRes.value;

      // If no city name provided, reverse geocode
      let name = cityName;
      if (!name) {
        name = await reverseGeocode(lat, lon);
      }

      const locId = `${lat.toFixed(4)},${lon.toFixed(4)}`;
      const loc = {
        id: locId,
        name,
        latitude: lat,
        longitude: lon,
        timezone: data.timezone || timezone,
      };

      setWeather(data);
      setAqi(aqiRes.status === 'fulfilled' ? aqiRes.value : null);
      setAlerts(alertsRes.status === 'fulfilled' ? alertsRes.value : null);
      setLocation(loc);

      // Add to saved locations if it's the first time and array is empty
      setSavedLocations(prev => {
        if (prev.length === 0) {
          const newSaved = [loc];
          saveLocations(newSaved);
          return newSaved;
        }
        return prev;
      });

    } catch (err) {
      console.error('Weather fetch failed:', err);
      setError('Unable to fetch weather data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const addLocation = useCallback((loc) => {
    setSavedLocations(prev => {
      // Avoid duplicates
      if (prev.some(l => l.id === loc.id || (Math.abs(l.latitude - loc.latitude) < 0.01 && Math.abs(l.longitude - loc.longitude) < 0.01))) {
        return prev;
      }
      const newSaved = [...prev, loc];
      saveLocations(newSaved);
      return newSaved;
    });
  }, []);

  const removeLocation = useCallback((id) => {
    setSavedLocations(prev => {
      const newSaved = prev.filter(l => l.id !== id);
      saveLocations(newSaved);
      return newSaved;
    });
  }, []);

  // Select a location from search results or carousel
  const selectLocation = useCallback(
    (loc) => {
      const locId = loc.id || `${loc.latitude.toFixed(4)},${loc.longitude.toFixed(4)}`;
      const fullLoc = { ...loc, id: locId };
      addLocation(fullLoc);
      loadWeather(fullLoc.latitude, fullLoc.longitude, fullLoc.timezone || 'auto', fullLoc.name);
    },
    [loadWeather, addLocation]
  );

  // Refresh current location's weather
  const refreshWeather = useCallback(() => {
    if (location) {
      loadWeather(location.latitude, location.longitude, location.timezone, location.name);
    } else if (lastAttemptRef.current) {
      const { lat, lon, timezone, cityName } = lastAttemptRef.current;
      loadWeather(lat, lon, timezone, cityName);
    }
  }, [location, loadWeather]);

  // Init: geolocation → saved location → search prompt
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGeoStatus('unavailable');
      const saved = loadSavedLocations();
      if (saved && saved.length > 0) {
        const first = saved[0];
        loadWeather(first.latitude, first.longitude, first.timezone, first.name);
      } else {
        setLoading(false);
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoStatus('granted');
        loadWeather(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setGeoStatus('denied');
        const saved = loadSavedLocations();
        if (saved && saved.length > 0) {
          const first = saved[0];
          loadWeather(first.latitude, first.longitude, first.timezone, first.name);
        } else {
          setLoading(false);
        }
      },
      { timeout: 10000 }
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    weather,
    aqi,
    alerts,
    location,
    loading,
    error,
    geoStatus,
    savedLocations,
    addLocation,
    removeLocation,
    selectLocation,
    refreshWeather,
  };
}
