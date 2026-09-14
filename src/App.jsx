import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useWeather from './hooks/useWeather';
import useUnits from './hooks/useUnits';
import { getSkyGradient } from './services/weatherUtils';

import SkyBackground from './components/SkyBackground';
import SearchBar from './components/SearchBar';
import UnitToggle from './components/UnitToggle';
import HeroCard from './components/HeroCard';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import SunriseSunsetArc from './components/SunriseSunsetArc';
import WindCard from './components/WindCard';
import HumidityCard from './components/HumidityCard';
import Footer from './components/Footer';
import GlassCard from './components/GlassCard';
import { MapPin, Search, CloudOff, Loader2, X } from 'lucide-react';

import AlertBanner from './components/AlertBanner';
import UvCard from './components/UvCard';
import AqiCard from './components/AqiCard';
import PrecipChart from './components/PrecipChart';
import TempTrendChart from './components/TempTrendChart';
import MapCard from './components/MapCard';

import BottomNav from './components/BottomNav';
import ShareButton from './components/ShareButton';
import InstallPrompt from './components/InstallPrompt';

function App() {
  const {
    weather, aqi, alerts, location, loading, error, selectLocation, refreshWeather
  } = useWeather();
  const { unit, setMetric, setImperial } = useUnits();
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Determine sky gradient from current weather
  const skyGradient = useMemo(() => {
    if (!weather?.current) return { from: '#0B1526', to: '#1B2A4A', needsScrim: false };
    return getSkyGradient(weather.current.weather_code, Boolean(weather.current.is_day));
  }, [weather?.current?.weather_code, weather?.current?.is_day]);

  // "Use my location" handler
  const handleUseMyLocation = () => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        selectLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          name: null,
        });
        setShowMobileSearch(false);
      },
      () => {},
      { timeout: 10000 }
    );
  };

  const handleSelectLocation = (loc) => {
    selectLocation(loc);
    setShowMobileSearch(false);
  };

  return (
    <div className="relative flex min-h-screen flex-col" id="app-dashboard">
      <SkyBackground gradient={skyGradient} />
      <InstallPrompt />

      {/* Top bar (Desktop only) */}
      <header className="relative z-40 mx-auto hidden w-full max-w-7xl flex-wrap items-center gap-3 px-4 pt-6 pb-2 md:flex sm:flex-nowrap">
        <h1 className="mr-auto font-display text-xl font-bold text-cloud-white">
          SuMo
        </h1>

        <SearchBar
          onSelectLocation={handleSelectLocation}
          onUseMyLocation={handleUseMyLocation}
          loading={loading}
        />

        <UnitToggle
          unit={unit}
          onSetMetric={setMetric}
          onSetImperial={setImperial}
        />

        {weather && <ShareButton targetId="app-dashboard" />}
      </header>

      {/* Mobile Header Logo */}
      <header className="relative z-10 mx-auto flex w-full items-center px-4 pt-6 pb-2 md:hidden">
        <h1 className="mx-auto font-display text-xl font-bold text-cloud-white">
          SuMo
        </h1>
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-0 py-4 md:px-4">
        
        {/* Loading state */}
        {loading && !weather && (
          <div className="flex flex-col items-center justify-center gap-4 py-32">
            <Loader2 size={40} className="animate-spin text-cloud-white/80" />
            <p className="font-body text-body text-cloud-white/80">
              Loading weather data…
            </p>
          </div>
        )}

        {/* Error state */}
        {error && !weather && (
          <div className="flex items-center justify-center py-32 px-4 md:px-0">
            <GlassCard className="flex max-w-md flex-col items-center gap-4 p-8 text-center">
              <CloudOff size={48} className="text-cloud-white/75" />
              <p className="font-body text-body text-cloud-white/80">{error}</p>
              <button
                onClick={refreshWeather}
                className="rounded-glass bg-amber-flare px-6 py-2 font-body text-body font-semibold text-deep-atmosphere transition-colors hover:bg-amber-flare/80"
              >
                Try Again
              </button>
            </GlassCard>
          </div>
        )}

        {/* No location — search prompt */}
        {!loading && !error && !weather && (
          <div className="flex items-center justify-center py-32 px-4 md:px-0">
            <GlassCard className="flex max-w-md flex-col items-center gap-4 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                <Search size={28} className="text-amber-flare" />
              </div>
              <h2 className="font-body text-section-head font-semibold text-cloud-white">
                Search for a city
              </h2>
              <p className="font-body text-body text-cloud-white/80">
                Type a city name or allow location access to see your local weather.
              </p>
              <div className="md:hidden w-full max-w-[280px]">
                <SearchBar
                  onSelectLocation={handleSelectLocation}
                  onUseMyLocation={handleUseMyLocation}
                  loading={loading}
                />
              </div>
              <button
                onClick={handleUseMyLocation}
                className="hidden md:flex items-center gap-2 rounded-glass bg-white/10 px-5 py-2.5 font-body text-body font-medium text-cloud-white transition-colors hover:bg-white/20"
              >
                <MapPin size={16} className="text-amber-flare" />
                Use my location
              </button>
            </GlassCard>
          </div>
        )}

        {/* Dashboard */}
        {weather && (
          <div>
            <div className="mb-4">
              <AlertBanner alerts={alerts} />
            </div>
            
            <div className="grid min-w-0 grid-cols-1 gap-4 md:gap-5 lg:grid-cols-3">
              {/* Hero */}
              <div className="lg:col-span-2">
                <HeroCard weather={weather} location={location} unit={unit} />
              </div>

              {/* Daily */}
              <div className="lg:row-span-2">
                <DailyForecast weather={weather} unit={unit} />
              </div>

              {/* Hourly */}
              <div className="lg:col-span-1">
                <HourlyForecast weather={weather} unit={unit} />
              </div>

              {/* Sunrise/Sunset */}
              <div className="lg:col-span-1">
                <SunriseSunsetArc weather={weather} />
              </div>

              {/* Small Cards */}
              <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:col-span-3 lg:grid-cols-4">
                <WindCard weather={weather} unit={unit} />
                <HumidityCard weather={weather} />
                <UvCard weather={weather} />
                <div className="md:col-span-2 lg:col-span-1">
                  <AqiCard aqiData={aqi} />
                </div>
              </div>

              {/* Charts */}
              <div className="lg:col-span-2">
                <PrecipChart weather={weather} />
              </div>
              <div className="lg:col-span-1">
                <TempTrendChart weather={weather} unit={unit} />
              </div>

              {/* Map */}
              <div className="lg:col-span-3">
                <MapCard location={location} />
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-x-0 bottom-[env(safe-area-inset-bottom)] z-[60] max-h-[calc(100dvh-env(safe-area-inset-bottom)-1rem)] overflow-y-auto px-4 md:hidden"
          >
            <GlassCard className="flex flex-col gap-4 p-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-body text-sm font-semibold text-cloud-white">Search Location</h3>
                <button onClick={() => setShowMobileSearch(false)} className="text-cloud-white/75">
                  <X size={20} />
                </button>
              </div>
              <SearchBar
                onSelectLocation={handleSelectLocation}
                onUseMyLocation={handleUseMyLocation}
                loading={loading}
              />
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav (Mobile only) */}
      <BottomNav 
        isSearchOpen={showMobileSearch}
        onSearchClick={() => setShowMobileSearch(!showMobileSearch)}
        onLocationClick={handleUseMyLocation}
        onShareClick={() => {
          // Fallback share click for mobile if they click the nav button
          const shareBtn = document.querySelector('button[aria-label="Share snapshot"]');
          if (shareBtn) shareBtn.click();
        }}
        unit={unit}
        setMetric={setMetric}
        setImperial={setImperial}
      />
    </div>
  );
}

export default App;
