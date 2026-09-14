import { useState, useCallback } from 'react';

const STORAGE_KEY = 'sumo-weather-unit';

function loadUnit() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'imperial' ? 'imperial' : 'metric';
  } catch {
    return 'metric';
  }
}

/**
 * Hook for unit preference (metric / imperial).
 * Persists choice to localStorage.
 */
export default function useUnits() {
  const [unit, setUnit] = useState(loadUnit);

  const toggleUnit = useCallback(() => {
    setUnit((prev) => {
      const next = prev === 'metric' ? 'imperial' : 'metric';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const setMetric = useCallback(() => {
    setUnit('metric');
    try { localStorage.setItem(STORAGE_KEY, 'metric'); } catch {}
  }, []);

  const setImperial = useCallback(() => {
    setUnit('imperial');
    try { localStorage.setItem(STORAGE_KEY, 'imperial'); } catch {}
  }, []);

  return { unit, toggleUnit, setMetric, setImperial };
}
