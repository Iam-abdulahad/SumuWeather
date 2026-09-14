/**
 * Two-state pill switch for °C / °F.
 * Active segment highlighted with Amber Flare.
 * Accessible: role="radiogroup" with aria-checked.
 */
export default function UnitToggle({ unit, onSetMetric, onSetImperial }) {
  return (
    <div
      className="glass-card inline-flex items-center p-1"
      role="radiogroup"
      aria-label="Temperature unit"
    >
      <button
        onClick={onSetMetric}
        className={`min-h-[36px] min-w-[44px] rounded-[16px] px-3 py-1.5 font-display text-sm font-bold transition-all duration-200 ${
          unit === 'metric'
            ? 'bg-amber-flare text-deep-atmosphere shadow-md'
            : 'text-cloud-white/85 hover:text-cloud-white'
        }`}
        role="radio"
        aria-checked={unit === 'metric'}
        aria-label="Celsius"
        id="unit-celsius"
      >
        °C
      </button>
      <button
        onClick={onSetImperial}
        className={`min-h-[36px] min-w-[44px] rounded-[16px] px-3 py-1.5 font-display text-sm font-bold transition-all duration-200 ${
          unit === 'imperial'
            ? 'bg-amber-flare text-deep-atmosphere shadow-md'
            : 'text-cloud-white/85 hover:text-cloud-white'
        }`}
        role="radio"
        aria-checked={unit === 'imperial'}
        aria-label="Fahrenheit"
        id="unit-fahrenheit"
      >
        °F
      </button>
    </div>
  );
}
