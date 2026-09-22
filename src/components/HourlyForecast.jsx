import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudFog,
  CloudDrizzle, CloudSun, Snowflake, Droplets, Wind
} from 'lucide-react';
import GlassCard from './GlassCard';
import BottomSheet from './BottomSheet';
import useReducedMotion from '../hooks/useReducedMotion';
import {
  getNext24Hours, formatHour, convertTemp, getConditionLabel,
} from '../services/weatherUtils';

function WeatherIcon({ code, size = 24 }) {
  const iconProps = { size, strokeWidth: 1.5 };
  const c = Number(code);
  if (c >= 95) return <CloudLightning {...iconProps} />;
  if (c >= 80 && c <= 82) return <CloudRain {...iconProps} />;
  if (c === 85 || c === 86 || (c >= 71 && c <= 77)) return <CloudSnow {...iconProps} />;
  if ((c >= 56 && c <= 57) || (c >= 66 && c <= 67)) return <Snowflake {...iconProps} />;
  if (c >= 61 && c <= 65) return <CloudRain {...iconProps} />;
  if (c >= 51 && c <= 55) return <CloudDrizzle {...iconProps} />;
  if (c === 45 || c === 48) return <CloudFog {...iconProps} />;
  if (c === 2 || c === 3) return <Cloud {...iconProps} />;
  if (c === 1) return <CloudSun {...iconProps} />;
  if (c === 0) return <Sun {...iconProps} />;
  return <Cloud {...iconProps} />;
}

export default function HourlyForecast({ weather, unit }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  if (!weather?.hourly) return null;

  const hours = getNext24Hours(weather.hourly, weather.utc_offset_seconds);
  if (hours.length === 0) return null;

  const tempUnit = unit === 'metric' ? '°' : '°';

  const handleHourClick = (i) => {
    if (window.innerWidth < 768) {
      setExpandedIndex(i);
      setIsSheetOpen(true);
    } else {
      setExpandedIndex(expandedIndex === i ? null : i);
    }
  };

  const selectedHour = expandedIndex !== null ? {
    time: formatHour(hours[expandedIndex].time),
    temp: convertTemp(hours[expandedIndex].temp, unit),
    condition: getConditionLabel(hours[expandedIndex].weatherCode),
    precipProbability: hours[expandedIndex].precipProbability,
    weatherCode: hours[expandedIndex].weatherCode
  } : null;

  return (
    <>
      <GlassCard className="p-4 md:p-5" id="hourly-forecast">
        <h2 className="mb-3 font-body text-section-head font-medium text-cloud-white">
          24-Hour Forecast
        </h2>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin snap-x snap-mandatory">
          {hours.map((hour, i) => {
            const isExpanded = expandedIndex === i && !isSheetOpen;
            const temp = convertTemp(hour.temp, unit);

            return (
              <motion.button
                key={hour.time}
                onClick={() => handleHourClick(i)}
                className={`flex flex-shrink-0 snap-start flex-col items-center gap-1.5 rounded-[16px] border border-white/15 px-3 py-3 transition-colors
                  ${isExpanded ? 'bg-white/20' : 'bg-white/8 hover:bg-white/12'}
                `}
                style={{ minWidth: '72px', minHeight: '44px' }}
                layout={!prefersReducedMotion}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 400, damping: 30 }
                }
                aria-expanded={isExpanded}
                aria-label={`${formatHour(hour.time)}: ${temp}${tempUnit}, ${getConditionLabel(hour.weatherCode)}`}
              >
                <span className="font-body text-micro text-cloud-white/75">
                  {i === 0 ? 'Now' : formatHour(hour.time)}
                </span>

                <span className="text-cloud-white/85" aria-hidden="true">
                  <WeatherIcon code={hour.weatherCode} size={20} />
                </span>

                <span className="font-display text-base font-bold text-cloud-white">
                  {temp}{tempUnit}
                </span>

                {/* Expanded detail for desktop */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 400, damping: 30 }
                      }
                      className="flex items-center gap-1 overflow-hidden"
                    >
                      <Droplets size={12} className="text-storm-violet" aria-hidden="true" />
                      <span className="font-body text-micro text-cloud-white/80">
                        {hour.precipProbability}%
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </GlassCard>

      {/* Bottom Sheet for Mobile */}
      <BottomSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)}
        title={selectedHour ? selectedHour.time : 'Forecast'}
      >
        {selectedHour && (
          <div className="flex flex-col gap-6 text-cloud-white py-4">
            <div className="text-center">
              <p className="font-display text-6xl font-bold mb-2">
                {selectedHour.temp}{tempUnit}
              </p>
              <div className="flex items-center justify-center gap-3">
                <WeatherIcon code={selectedHour.weatherCode} size={32} />
                <p className="font-body text-xl text-cloud-white/80">{selectedHour.condition}</p>
              </div>
            </div>
            
            <div className="mt-4 rounded-2xl bg-white/5 p-4 text-center border border-white/10 w-full max-w-xs mx-auto">
              <p className="font-body text-sm text-cloud-white/75 mb-1">Precipitation Chance</p>
              <div className="flex items-center justify-center gap-2">
                <Droplets size={24} className="text-storm-violet" />
                <p className="font-display text-2xl font-bold">{selectedHour.precipProbability}%</p>
              </div>
            </div>
          </div>
        )}
      </BottomSheet>
    </>
  );
}
