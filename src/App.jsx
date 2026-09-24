import { useMemo } from "react";
import useWeather from "./hooks/useWeather";
import useUnits from "./hooks/useUnits";
import { getSkyGradient } from "./services/weatherUtils";

import SkyBackground from "./components/SkyBackground";
import SearchBar from "./components/SearchBar";
import UnitToggle from "./components/UnitToggle";
import HeroCard from "./components/HeroCard";
import HourlyForecast from "./components/HourlyForecast";
import DailyForecast from "./components/DailyForecast";
import SunriseSunsetArc from "./components/SunriseSunsetArc";
import WindCard from "./components/WindCard";
import HumidityCard from "./components/HumidityCard";
import Footer from "./components/Footer";
import GlassCard from "./components/GlassCard";

import { MapPin, Search, CloudOff, Loader2, X } from "lucide-react";

import AlertBanner from "./components/AlertBanner";
import UvCard from "./components/UvCard";
import AqiCard from "./components/AqiCard";
import PrecipChart from "./components/PrecipChart";
import TempTrendChart from "./components/TempTrendChart";
import MapCard from "./components/MapCard";

import BottomNav from "./components/BottomNav";
import ShareButton from "./components/ShareButton";
import InstallPrompt from "./components/InstallPrompt";

function App() {
  const {
    weather,
    aqi,
    alerts,
    location,
    loading,
    error,
    geoError,
    clearGeoError,
    selectLocation,
    refreshWeather,
    locateCurrentUser,
  } = useWeather();

  const { unit, setMetric, setImperial } = useUnits();

  // Determine sky gradient from current weather
  const skyGradient = useMemo(() => {
    if (!weather?.current) {
      return {
        from: "#0B1526",
        to: "#1B2A4A",
        needsScrim: false,
      };
    }

    return getSkyGradient(
      weather.current.weather_code,
      Boolean(weather.current.is_day),
    );
  }, [weather?.current?.weather_code, weather?.current?.is_day]);

  // "Use my location" handler
  const handleUseMyLocation = async () => {
    try {
      await locateCurrentUser();
    } catch {
      // Error is already handled inside useWeather
    }
  };

  // Select searched location
  const handleSelectLocation = (loc) => {
    selectLocation(loc);
  };

  return (
    <div className="relative flex min-h-screen flex-col" id="app-dashboard">
      {/* Dynamic weather background */}
      <SkyBackground gradient={skyGradient} />

      {/* PWA install prompt */}
      <InstallPrompt />

      {/* =========================================================
          DESKTOP HEADER
          ========================================================= */}
      <header
        className="
          relative
          z-40
          mx-auto
          hidden
          w-full
          max-w-7xl
          flex-wrap
          items-center
          gap-3
          px-4
          pt-6
          pb-2
          md:flex
          sm:flex-nowrap
        "
      >
        {/* Website name */}
        <h1 className="mr-auto font-display text-xl font-bold text-cloud-white">
          SuMo Weather
        </h1>

        {/* Desktop Search */}
        <SearchBar
          onSelectLocation={handleSelectLocation}
          onUseMyLocation={handleUseMyLocation}
          loading={loading}
        />

        {/* Unit toggle */}
        <UnitToggle
          unit={unit}
          onSetMetric={setMetric}
          onSetImperial={setImperial}
        />

        {/* Share */}
        {weather && <ShareButton targetId="app-dashboard" />}
      </header>

      {/* =========================================================
    MOBILE HEADER
    Website name is sticky.
    Search is NOT sticky.
    ========================================================= */}

      {/* Sticky Website Name */}
      <div
        className="
    sticky
    top-0
    z-[80]
    flex
    h-14
    items-center
    justify-center
    border-b
    border-white/10
    bg-deep-atmosphere/90
    backdrop-blur-xl
    md:hidden
  "
      >
        <h1 className="font-display text-xl font-bold text-cloud-white">
          SuMo Weather
        </h1>
      </div>

      {/* Mobile Search - NOT sticky */}
      <div className="px-3 py-3 md:hidden">
        <SearchBar
          onSelectLocation={handleSelectLocation}
          onUseMyLocation={handleUseMyLocation}
          loading={loading}
        />
      </div>

      {/* =========================================================
          MAIN CONTENT
          ========================================================= */}
      <main
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-7xl
          flex-1
          px-0
          py-4
          pb-[88px]
          md:px-4
          md:pb-4
        "
      >
        {/* =====================================================
            GEOLOCATION ERROR
            ===================================================== */}
        {geoError && (
          <div
            className="
              mx-4
              mb-4
              flex
              items-center
              justify-between
              rounded-2xl
              border
              border-amber-flare/30
              bg-amber-flare/10
              px-4
              py-3
              backdrop-blur-sm
              md:mx-0
            "
          >
            <p className="font-body text-sm text-cloud-white/90">{geoError}</p>

            <button
              onClick={clearGeoError}
              className="
                ml-3
                flex-shrink-0
                rounded-full
                p-1
                text-cloud-white/60
                transition-colors
                hover:bg-white/10
                hover:text-cloud-white
              "
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* =====================================================
            LOADING STATE
            ===================================================== */}
        {loading && !weather && (
          <div className="flex flex-col items-center justify-center gap-4 py-32">
            <Loader2 size={40} className="animate-spin text-cloud-white/80" />

            <p className="font-body text-body text-cloud-white/80">
              Loading weather data…
            </p>
          </div>
        )}

        {/* =====================================================
            ERROR STATE
            ===================================================== */}
        {error && !weather && (
          <div className="flex items-center justify-center px-4 py-32 md:px-0">
            <GlassCard className="flex max-w-md flex-col items-center gap-4 p-8 text-center">
              <CloudOff size={48} className="text-cloud-white/75" />

              <p className="font-body text-body text-cloud-white/80">{error}</p>

              <button
                onClick={refreshWeather}
                className="
                  rounded-glass
                  bg-amber-flare
                  px-6
                  py-2
                  font-body
                  text-body
                  font-semibold
                  text-deep-atmosphere
                  transition-colors
                  hover:bg-amber-flare/80
                "
              >
                Try Again
              </button>
            </GlassCard>
          </div>
        )}

        {/* =====================================================
            NO LOCATION STATE
            ===================================================== */}
        {!loading && !error && !weather && (
          <div className="flex items-center justify-center px-4 py-32 md:px-0">
            <GlassCard className="flex max-w-md flex-col items-center gap-4 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                <Search size={28} className="text-amber-flare" />
              </div>

              <h2 className="font-body text-section-head font-semibold text-cloud-white">
                Search for a city
              </h2>

              <p className="font-body text-body text-cloud-white/80">
                Type a city name or allow location access to see your local
                weather.
              </p>

              {/* Extra search only for desktop empty state */}
              <button
                onClick={handleUseMyLocation}
                className="
                  hidden
                  items-center
                  gap-2
                  rounded-glass
                  bg-white/10
                  px-5
                  py-2.5
                  font-body
                  text-body
                  font-medium
                  text-cloud-white
                  transition-colors
                  hover:bg-white/20
                  md:flex
                "
              >
                <MapPin size={16} className="text-amber-flare" />
                Use my location
              </button>
            </GlassCard>
          </div>
        )}

        {/* =====================================================
            WEATHER DASHBOARD
            ===================================================== */}
        {weather && (
          <div>
            {/* Alerts */}
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

              {/* Sunrise / Sunset */}
              <div className="lg:col-span-1">
                <SunriseSunsetArc weather={weather} />
              </div>

              {/* Small Cards */}
              <div
                className="
                  grid
                  min-w-0
                  grid-cols-1
                  gap-4
                  md:grid-cols-2
                  md:gap-5
                  lg:col-span-3
                  lg:grid-cols-4
                "
              >
                <WindCard weather={weather} unit={unit} />

                <HumidityCard weather={weather} />

                <UvCard weather={weather} />

                <div className="md:col-span-2 lg:col-span-1">
                  <AqiCard aqiData={aqi} />
                </div>
              </div>

              {/* Precipitation Chart */}
              <div className="lg:col-span-2">
                <PrecipChart weather={weather} />
              </div>

              {/* Temperature Trend */}
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

      {/* Footer */}
      <Footer />

      {/* =========================================================
          MOBILE BOTTOM NAV
          
          IMPORTANT:
          Search has been removed from the bottom navigation.
          ========================================================= */}
      <BottomNav
        onLocationClick={handleUseMyLocation}
        onShareClick={() => {
          const shareBtn = document.querySelector(
            'button[aria-label="Share snapshot"]',
          );

          if (shareBtn) {
            shareBtn.click();
          }
        }}
        unit={unit}
        setMetric={setMetric}
        setImperial={setImperial}
      />
    </div>
  );
}

export default App;
