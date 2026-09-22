import { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import GlassCard from './GlassCard';
import BottomSheet from './BottomSheet';
import { formatDayName, convertTemp, getConditionLabel } from '../services/weatherUtils';
import useReducedMotion from '../hooks/useReducedMotion';
import { motion, AnimatePresence } from 'framer-motion';

export default function DailyForecast({ weather, unit }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  if (!weather?.daily?.time) return null;

  const { daily } = weather;
  const tempUnit = unit === 'metric' ? '°' : '°';

  // The API returns 10 days now, but this is a 7-day forecast component
  const timeArray = daily.time.slice(0, 7);

  const handleRowClick = (i) => {
    // If we're on mobile (window width < 768px), open bottom sheet. Otherwise inline expand.
    if (window.innerWidth < 768) {
      setExpandedIndex(i);
      setIsSheetOpen(true);
    } else {
      setExpandedIndex(expandedIndex === i ? null : i);
    }
  };

  const selectedDay = expandedIndex !== null ? {
    date: timeArray[expandedIndex],
    hi: convertTemp(daily.temperature_2m_max[expandedIndex], unit),
    lo: convertTemp(daily.temperature_2m_min[expandedIndex], unit),
    condition: getConditionLabel(daily.weather_code[expandedIndex]),
    precip: daily.precipitation_sum[expandedIndex],
    wind: Math.round(daily.wind_speed_10m_max[expandedIndex])
  } : null;

  return (
    <>
      <GlassCard className="flex flex-col p-4 md:p-5" id="daily-forecast">
        <h2 className="mb-3 font-body text-section-head font-medium text-cloud-white">
          7-Day Forecast
        </h2>

        <div className="flex flex-col divide-y divide-white/10">
          {timeArray.map((date, i) => {
            const isExpanded = expandedIndex === i && !isSheetOpen;
            const hi = convertTemp(daily.temperature_2m_max[i], unit);
            const lo = convertTemp(daily.temperature_2m_min[i], unit);
            const condition = getConditionLabel(daily.weather_code[i]);

            return (
              <div key={date} className="flex flex-col border-white/10 transition-colors hover:bg-white/5">
                <button
                  onClick={() => handleRowClick(i)}
                  className="flex w-full items-center justify-between py-3 text-left focus:outline-none focus:ring-2 focus:ring-amber-flare focus:ring-inset"
                  aria-expanded={isExpanded}
                >
                  <span className="w-1/4 font-body text-body font-medium text-cloud-white">
                    {formatDayName(date, weather.utc_offset_seconds)}
                  </span>

                  <span className="flex-1 text-center font-body text-sm text-cloud-white/85">
                    {condition}
                  </span>

                  <div className="flex w-1/4 justify-end gap-3 text-right">
                    <span className="font-display font-medium text-cloud-white">
                      {hi}{tempUnit}
                    </span>
                    <span className="font-display text-cloud-white/75">
                      {lo}{tempUnit}
                    </span>
                  </div>

                  {/* Desktop chevron icon */}
                  <div className="ml-2 hidden text-cloud-white/75 md:block">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* Inline Expansion (Desktop Only) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: prefersReducedMotion ? 1 : 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: prefersReducedMotion ? 1 : 0 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center justify-around rounded-b-xl bg-black/10 p-4 text-center font-body text-sm text-cloud-white/80">
                        <div>
                          <p className="text-cloud-white/75">Precipitation</p>
                          <p className="font-medium text-amber-flare">{daily.precipitation_sum[i]} mm</p>
                        </div>
                        <div>
                          <p className="text-cloud-white/75">Max Wind</p>
                          <p className="font-medium">{Math.round(daily.wind_speed_10m_max[i])} {unit === 'metric' ? 'km/h' : 'mph'}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Bottom Sheet for Mobile */}
      <BottomSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)}
        title={selectedDay ? formatDayName(selectedDay.date, weather.utc_offset_seconds) : 'Forecast'}
      >
        {selectedDay && (
          <div className="flex flex-col gap-6 text-cloud-white py-4">
            <div className="text-center">
              <p className="font-display text-5xl font-bold mb-2">
                {selectedDay.hi}{tempUnit} <span className="text-cloud-white/75 text-3xl">/ {selectedDay.lo}{tempUnit}</span>
              </p>
              <p className="font-body text-lg text-cloud-white/80">{selectedDay.condition}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/5 p-4 text-center border border-white/10">
                <p className="font-body text-sm text-cloud-white/75 mb-1">Precipitation</p>
                <p className="font-display text-xl text-amber-flare">{selectedDay.precip} mm</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 text-center border border-white/10">
                <p className="font-body text-sm text-cloud-white/75 mb-1">Max Wind</p>
                <p className="font-display text-xl">{selectedDay.wind} {unit === 'metric' ? 'km/h' : 'mph'}</p>
              </div>
            </div>
          </div>
        )}
      </BottomSheet>
    </>
  );
}
