import { useState, useEffect, useCallback, useRef } from "react";

import {
  fetchWeather,
  searchLocations,
  reverseGeocode,
  fetchAirQuality,
  fetchAlerts,
} from "../services/weatherApi";

const STORAGE_KEY = "sumo-weather-locations-v2";

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
    // Ignore localStorage errors.
  }
}

function getLocationErrorMessage(error) {
  if (!error) {
    return "Unable to determine your location.";
  }

  switch (error.code) {
    case 1:
      return "Location access was denied. You can search for a city instead.";

    case 2:
      return "Your location is currently unavailable. You can search for a city instead.";

    case 3:
      return "Location detection timed out. You can search for a city instead.";

    default:
      return "Couldn't determine your location. You can search for a city instead.";
  }
}

export default function useWeather() {
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [location, setLocation] = useState(null);

  const [savedLocations, setSavedLocations] = useState(loadSavedLocations());

  /*
   * IMPORTANT:
   *
   * loading = weather API loading
   * locating = browser GPS loading
   *
   * They are intentionally separate.
   */
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const [error, setError] = useState(null);
  const [geoError, setGeoError] = useState(null);

  const [geoStatus, setGeoStatus] = useState("idle");
  // idle | pending | granted | denied | unavailable | timeout

  const lastAttemptRef = useRef(null);

  /*
   * ============================================================
   * LOAD WEATHER
   * ============================================================
   */
  const loadWeather = useCallback(
    async (lat, lon, timezone = "auto", cityName = null) => {
      lastAttemptRef.current = {
        lat,
        lon,
        timezone,
        cityName,
      };

      setLoading(true);
      setError(null);

      try {
        const [weatherRes, aqiRes, alertsRes] = await Promise.allSettled([
          fetchWeather(lat, lon, timezone),
          fetchAirQuality(lat, lon, timezone),
          fetchAlerts(lat, lon),
        ]);

        if (weatherRes.status === "rejected") {
          throw weatherRes.reason;
        }

        const data = weatherRes.value;

        /*
         * IMPORTANT:
         *
         * Do NOT wait for reverse geocoding before
         * displaying weather.
         */
        const temporaryName = cityName || "Your Location";

        const locId = `${lat.toFixed(4)},${lon.toFixed(4)}`;

        const loc = {
          id: locId,
          name: temporaryName,
          latitude: lat,
          longitude: lon,
          timezone: data.timezone || timezone,
        };

        /*
         * Show weather immediately.
         */
        setWeather(data);

        setAqi(aqiRes.status === "fulfilled" ? aqiRes.value : null);

        setAlerts(alertsRes.status === "fulfilled" ? alertsRes.value : null);

        setLocation(loc);

        /*
         * Save first location.
         */
        setSavedLocations((prev) => {
          if (prev.length === 0) {
            const newSaved = [loc];

            saveLocations(newSaved);

            return newSaved;
          }

          return prev;
        });

        /*
         * Reverse geocoding happens AFTER weather
         * is already visible.
         */
        if (!cityName) {
          reverseGeocode(lat, lon)
            .then((name) => {
              if (!name) return;

              setLocation((current) => {
                if (!current) return current;

                return {
                  ...current,
                  name,
                };
              });
            })
            .catch(() => {
              /*
               * Weather is already working.
               *
               * Reverse geocoding failure should NOT
               * break the weather dashboard.
               */
            });
        }
      } catch (err) {
        console.error("Weather loading failed:", err);

        if (!navigator.onLine) {
          setError(
            "You appear to be offline. Please check your internet connection.",
          );
        } else {
          setError("Unable to load weather data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /*
   * ============================================================
   * LOCATION
   * ============================================================
   */
  const locateCurrentUser = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        const message =
          "Location is not supported by this browser. Search for a city instead.";

        setGeoStatus("unavailable");
        setGeoError(message);
        setLocating(false);

        reject(new Error(message));
        return;
      }

      /*
       * IMPORTANT:
       *
       * This is GPS loading, NOT weather loading.
       *
       * Therefore we do NOT call:
       *
       * setLoading(true)
       */
      setLocating(true);
      setGeoStatus("pending");
      setGeoError(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            setGeoStatus("granted");
            setGeoError(null);

            setLocating(false);

            /*
             * NOW weather loading starts.
             */
            await loadWeather(latitude, longitude, "auto");

            resolve(position);
          } catch (err) {
            setLocating(false);

            setError(
              "Your location was found, but weather data could not be loaded.",
            );

            reject(err);
          }
        },

        (err) => {
          console.warn("Geolocation failed:", err);

          setLocating(false);

          if (err.code === 1) {
            setGeoStatus("denied");
          } else if (err.code === 2) {
            setGeoStatus("unavailable");
          } else if (err.code === 3) {
            setGeoStatus("timeout");
          }

          /*
           * IMPORTANT:
           *
           * Do NOT set loading=true.
           *
           * Do NOT block the search.
           */
          setGeoError(getLocationErrorMessage(err));

          /*
           * If user has previously selected/saved a city,
           * load that instead.
           */
          const saved = loadSavedLocations();

          if (saved.length > 0) {
            const first = saved[0];

            loadWeather(
              first.latitude,
              first.longitude,
              first.timezone || "auto",
              first.name,
            );
          }

          /*
           * Resolve instead of leaving the app hanging.
           *
           * The search bar remains available.
           */
          resolve(null);
        },

        {
          enableHighAccuracy: false,

          /*
           * Don't wait forever.
           */
          timeout: 8000,

          /*
           * Cached location up to 1 minute is acceptable.
           */
          maximumAge: 60000,
        },
      );
    });
  }, [loadWeather]);

  /*
   * ============================================================
   * SEARCH LOCATION
   * ============================================================
   */
  const addLocation = useCallback((loc) => {
    setSavedLocations((prev) => {
      const exists = prev.some(
        (item) =>
          item.id === loc.id ||
          (Math.abs(item.latitude - loc.latitude) < 0.01 &&
            Math.abs(item.longitude - loc.longitude) < 0.01),
      );

      if (exists) {
        return prev;
      }

      const newSaved = [...prev, loc];

      saveLocations(newSaved);

      return newSaved;
    });
  }, []);

  const removeLocation = useCallback((id) => {
    setSavedLocations((prev) => {
      const newSaved = prev.filter((item) => item.id !== id);

      saveLocations(newSaved);

      return newSaved;
    });
  }, []);

  const selectLocation = useCallback(
    (loc) => {
      const locId =
        loc.id || `${loc.latitude.toFixed(4)},${loc.longitude.toFixed(4)}`;

      const fullLoc = {
        ...loc,
        id: locId,
      };

      /*
       * User selected a city.
       *
       * GPS is no longer relevant.
       */
      setGeoError(null);

      addLocation(fullLoc);

      loadWeather(
        fullLoc.latitude,
        fullLoc.longitude,
        fullLoc.timezone || "auto",
        fullLoc.name,
      );
    },
    [loadWeather, addLocation],
  );

  /*
   * ============================================================
   * REFRESH
   * ============================================================
   */
  const refreshWeather = useCallback(() => {
    if (location) {
      loadWeather(
        location.latitude,
        location.longitude,
        location.timezone || "auto",
        location.name,
      );

      return;
    }

    if (lastAttemptRef.current) {
      const { lat, lon, timezone, cityName } = lastAttemptRef.current;

      loadWeather(lat, lon, timezone, cityName);
    }
  }, [location, loadWeather]);

  /*
   * ============================================================
   * INITIAL LOCATION DETECTION
   * ============================================================
   */
  useEffect(() => {
    /*
     * Search should ALWAYS be usable immediately.
     *
     * Therefore we don't set loading=true here.
     */

    const saved = loadSavedLocations();

    /*
     * If we already have a saved city,
     * use it immediately.
     */
    if (saved.length > 0) {
      const first = saved[0];

      loadWeather(
        first.latitude,
        first.longitude,
        first.timezone || "auto",
        first.name,
      );
    }

    /*
     * Try location in background.
     *
     * This no longer blocks the search bar.
     */
    locateCurrentUser();

    // Run only once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearGeoError = useCallback(() => {
    setGeoError(null);
  }, []);

  return {
    weather,
    aqi,
    alerts,
    location,

    /*
     * Weather loading.
     */
    loading,

    /*
     * GPS loading.
     */
    locating,

    error,

    geoStatus,
    geoError,

    clearGeoError,

    savedLocations,

    addLocation,
    removeLocation,

    selectLocation,
    refreshWeather,

    locateCurrentUser,
  };
}
