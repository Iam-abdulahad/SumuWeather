import React, { useState, useEffect } from "react";
import FetchWeatherData from "../hooks/FetchWeatherData";
import {
  WiDaySunny,
  WiCloud,
  WiFog,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiShowers,
  WiDayCloudy,
  WiSleet,
  WiStrongWind,
  WiHumidity,
  WiSunrise,
  WiSunset,
  WiThermometer,
  WiDirectionUp,
  WiDirectionDown,
  WiRaindrops,
} from "react-icons/wi";
import axios from "axios";
import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";

const weatherIcons = {
  0: <WiDaySunny size={80} color="#FFD166" />,
  1: <WiDayCloudy size={80} color="#FACC15" />,
  2: <WiCloud size={80} color="#93C5FD" />,
  3: <WiCloud size={80} color="#64748B" />,
  45: <WiFog size={80} color="#CBD5E1" />,
  48: <WiFog size={80} color="#CBD5E1" />,
  51: <WiShowers size={80} color="#67E8F9" />,
  53: <WiShowers size={80} color="#38BDF8" />,
  55: <WiShowers size={80} color="#0284C7" />,
  56: <WiSleet size={80} color="#7DD3FC" />,
  57: <WiSleet size={80} color="#22D3EE" />,
  61: <WiRain size={80} color="#38BDF8" />,
  63: <WiRain size={80} color="#2563EB" />,
  65: <WiRain size={80} color="#1E3A8A" />,
  66: <WiSleet size={80} color="#14B8A6" />,
  67: <WiSleet size={80} color="#0F766E" />,
  71: <WiSnow size={80} color="#E0F2FE" />,
  73: <WiSnow size={80} color="#BAE6FD" />,
  75: <WiSnow size={80} color="#7DD3FC" />,
  77: <WiSnow size={80} color="#A5F3FC" />,
  80: <WiShowers size={80} color="#67E8F9" />,
  81: <WiShowers size={80} color="#0EA5E9" />,
  82: <WiThunderstorm size={80} color="#A78BFA" />,
  85: <WiSnow size={80} color="#BAE6FD" />,
  86: <WiSnow size={80} color="#7DD3FC" />,
  95: <WiThunderstorm size={80} color="#FB7185" />,
  96: <WiThunderstorm size={80} color="#F97316" />,
  99: <WiThunderstorm size={80} color="#EA580C" />,
};

const renderMetricCard = (icon, label, value) => (
  <div className="rounded-2xl border border-white/25 bg-white/15 p-4 text-left shadow-lg shadow-slate-950/10 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/25">
    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-3xl text-cyan-100">
      {icon}
    </div>
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/80">
      {label}
    </p>
    <p className="mt-1 text-lg font-bold text-white">{value || "N/A"}</p>
  </div>
);

const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [cityName, setCityName] = useState("");
  const [city, setCity] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timezone, setTimezone] = useState("Asia/Dhaka");
  const [localTime, setLocalTime] = useState("");
  const [weatherCode, setWeatherCode] = useState("");

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);

          try {
            const data = await FetchWeatherData(
              position.coords.latitude,
              position.coords.longitude,
              "auto"
            );

            if (data) {
              setWeatherData(data);
              setTimezone(data.timezone);
              setWeatherCode(data?.current?.weather_code);
            }
          } catch (error) {
            console.warn(error.message);
            Swal.fire({
              icon: "error",
              title: "Failed to fetch weather data",
              text: "Something went wrong while fetching weather information.",
            });
          }
        },
        async (error) => {
          console.warn("Location access denied:", error.message);

          await Swal.fire({
            icon: "warning",
            title: "Location Access Denied",
            text: "Defaulting to Dhaka for weather data. Please enable location access for better accuracy.",
          });

          setLatitude(23.8103);
          setLongitude(90.4125);

          try {
            const data = await FetchWeatherData(23.8103, 90.4125, "Asia/Dhaka");
            if (data) {
              setWeatherData(data);
              setTimezone("Asia/Dhaka");
              setWeatherCode(data?.current?.weather_code);
            }
          } catch (error) {
            console.warn(error.message);
            Swal.fire({
              icon: "error",
              title: "Failed to load default weather data",
              text: "We couldn't fetch weather information for Dhaka either.",
            });
          }
        }
      );
    } else {
      Swal.fire({
        icon: "info",
        title: "Geolocation Not Supported",
        text: "Your browser does not support geolocation.",
      });
    }
  }, []);

  const getCityName = async (latitude, longitude) => {
    if (latitude == null || longitude == null) return null;

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );

      const cityName =
        response.data.address.city ||
        response.data.address.town ||
        response.data.address.village ||
        response.data.address.hamlet;
      setCityName(cityName);
    } catch (error) {
      console.error("Failed to get city name:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch city from the location service.",
      });
      return null;
    }
  };

  useEffect(() => {
    if (latitude && longitude) {
      getCityName(latitude, longitude);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    document.title = `SuMo Weather || ${cityName || "Weather"}`;
  }, [cityName]);

  useEffect(() => {
    const updateTime = () => {
      const date = new Date().toLocaleString("en-US", { timeZone: timezone });
      setLocalTime(date);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [timezone]);

  const handleSearch = async () => {
    if (!city || !city.trim()) {
      setError("Please enter a valid city name!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const geoResponse = await axios.get(
        "https://geocoding-api.open-meteo.com/v1/search",
        {
          params: { name: city, count: 1 },
        }
      );

      if (geoResponse.data.results?.length > 0) {
        const { latitude, longitude } = geoResponse.data.results[0];
        setLatitude(latitude);
        setLongitude(longitude);
        const data = await FetchWeatherData(latitude, longitude, "auto");
        setWeatherData(data);
        setTimezone(data?.timezone || "auto");
        setWeatherCode(data?.current?.weather_code);
      } else {
        setError("No city found. Try another place.");
      }
    } catch (error) {
      setError(error.response?.data?.reason || "Failed to search this city.");
    } finally {
      setLoading(false);
      setCity("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatDate = (date, options) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-GB", options).format(new Date(date));
  };

  const currentWeather = weatherData?.current || {};
  const hourlyWeather = weatherData?.hourly || {};
  const dailyWeather = weatherData?.daily || {};

  const now = new Date();
  const upcomingHours =
    hourlyWeather?.time
      ?.map((time, index) => ({
        time,
        temp: hourlyWeather.temperature_2m?.[index] || "N/A",
        precipitation: hourlyWeather.precipitation?.[index] || 0,
        weatherCode: hourlyWeather.weather_code?.[index] || null,
      }))
      .filter(({ time }) => new Date(time) >= now) || [];
  const upcomingHoursToShow = upcomingHours.slice(0, 12);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#38bdf8_0,#0f172a_34%,#111827_68%,#020617_100%)] px-4 py-8 text-slate-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.28, scale: 1 }}
        transition={{ duration: 12, repeat: Infinity, repeatType: "mirror" }}
        className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-cyan-300 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0.15, y: 0 }}
        animate={{ opacity: 0.35, y: 28 }}
        transition={{ duration: 9, repeat: Infinity, repeatType: "mirror" }}
        className="absolute right-0 top-40 h-80 w-80 rounded-full bg-rose-400/70 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-6xl space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-4 shadow-2xl shadow-cyan-950/40 backdrop-blur-2xl md:p-6"
        >
          <div className="mx-auto mb-6 max-w-2xl">
            <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-slate-950/35 p-3 shadow-inner shadow-black/20 sm:flex-row">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search city..."
                className="min-h-12 flex-1 rounded-xl border border-white/10 bg-white/95 px-4 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/25"
                disabled={loading}
              />
              <button
                onClick={handleSearch}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 font-bold text-white shadow-lg transition-all duration-300 ${
                  loading
                    ? "cursor-not-allowed bg-slate-500"
                    : "bg-gradient-to-r from-cyan-400 via-sky-500 to-fuchsia-500 shadow-cyan-950/30 hover:-translate-y-0.5 hover:shadow-xl"
                }`}
                disabled={loading}
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <FaSearch />
                    Search
                  </>
                )}
              </button>
            </div>
            {error && (
              <p className="mt-3 rounded-xl bg-rose-500/15 px-4 py-2 text-sm font-medium text-rose-100">
                {error}
              </p>
            )}
          </div>

          {currentWeather && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="grid gap-6 rounded-[1.5rem] bg-gradient-to-br from-sky-500/85 via-indigo-500/80 to-rose-500/85 p-5 shadow-2xl shadow-slate-950/30 md:grid-cols-[1.05fr_1.45fr] md:p-8"
            >
              <div className="flex flex-col justify-between rounded-[1.25rem] border border-white/25 bg-white/15 p-6 text-center shadow-xl shadow-slate-950/10 backdrop-blur-md md:text-left">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-100">
                    Live Weather
                  </p>
                  <h2 className="mt-3 text-4xl font-black text-white drop-shadow md:text-5xl">
                    {cityName || "Your Area"}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-white/75">
                    {weatherData?.timezone}
                  </p>
                </div>

                <div className="my-6 flex items-center justify-center gap-4 md:justify-start">
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/20 shadow-inner">
                    {weatherIcons[currentWeather?.weather_code || weatherCode] || (
                      <WiCloud size={86} />
                    )}
                  </div>
                  <div>
                    <div className="text-6xl font-black leading-none text-white drop-shadow-lg md:text-7xl">
                      {weatherData?.current?.temperature_2m}°C
                    </div>
                    <p className="mt-2 text-sm font-semibold text-cyan-50/80">
                      Feels like {currentWeather?.apparent_temperature}°C
                    </p>
                  </div>
                </div>

                <p className="rounded-full bg-slate-950/25 px-4 py-2 text-xs font-semibold text-white/75">
                  Local time: {localTime || "Updating..."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {renderMetricCard(
                  <WiHumidity />,
                  "Humidity",
                  `${weatherData?.current?.relative_humidity_2m}%`
                )}
                {renderMetricCard(
                  <WiStrongWind />,
                  "Wind",
                  `${currentWeather?.wind_speed_10m} km/h`
                )}
                {renderMetricCard(
                  <WiSunrise />,
                  "Sunrise",
                  weatherData?.daily?.sunrise?.[0]?.slice(11)
                )}
                {renderMetricCard(
                  <WiSunset />,
                  "Sunset",
                  weatherData?.daily?.sunset?.[0]?.slice(11)
                )}
                {renderMetricCard(
                  <WiDirectionUp />,
                  "High",
                  `${weatherData?.daily?.temperature_2m_max?.[0]}°C`
                )}
                {renderMetricCard(
                  <WiDirectionDown />,
                  "Low",
                  `${weatherData?.daily?.temperature_2m_min?.[0]}°C`
                )}
                {renderMetricCard(
                  <WiRaindrops />,
                  "Rainfall",
                  `${weatherData?.daily?.precipitation_sum?.[0]} mm`
                )}
                {renderMetricCard(
                  <WiThermometer />,
                  "Updated",
                  new Date().toLocaleTimeString()
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        <section className="space-y-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-200">
              Next 12 Hours
            </p>
            <h2 className="text-3xl font-black text-white">Hourly Forecast</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto rounded-[1.5rem] border border-white/15 bg-white/10 p-4 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
            {upcomingHoursToShow.map(
              ({ time, temp, precipitation, weatherCode }) => (
                <div
                  key={time}
                  className="flex min-w-[128px] flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/90 px-4 py-5 text-slate-800 shadow-lg shadow-slate-950/10 transition duration-300 hover:-translate-y-1 hover:bg-cyan-50"
                >
                  <p className="text-sm font-bold text-slate-500">
                    {formatDate(time, { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <div className="my-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-500">
                    {React.cloneElement(
                      weatherIcons[weatherCode] || <WiCloud />,
                      { size: 46 }
                    )}
                  </div>
                  <p className="text-2xl font-black text-slate-900">{temp}°C</p>
                  <p className="mt-2 rounded-full bg-cyan-100 px-3 py-1 text-center text-xs font-bold text-cyan-700">
                    {precipitation} mm rain
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        <section className="space-y-4 font-sans">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-rose-200">
              This Week
            </p>
            <h2 className="text-3xl font-black text-white">7-Day Forecast</h2>
          </div>
          <div className="overflow-hidden rounded-[1.5rem] border border-white/15 bg-white/95 shadow-xl shadow-slate-950/20">
            <table className="w-full text-center">
              <thead className="bg-gradient-to-r from-cyan-500 via-sky-500 to-fuchsia-500 text-sm uppercase tracking-wide text-white">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Temp (°C)</th>
                  <th className="p-3">Precipitation</th>
                  <th className="p-3">Sky</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-700">
                {dailyWeather.time?.map((date, index) => (
                  <tr
                    key={date}
                    className="border-b border-slate-100 transition duration-200 last:border-b-0 hover:bg-cyan-50"
                  >
                    <td className="p-3 font-bold text-slate-800">
                      {formatDate(date, {
                        weekday: "short",
                        day: "numeric",
                        month: "numeric",
                      })}
                    </td>
                    <td className="p-3">
                      <span className="font-black text-rose-500">
                        {dailyWeather.temperature_2m_max?.[index]}°
                      </span>{" "}
                      /{" "}
                      <span className="font-bold text-sky-500">
                        {dailyWeather.temperature_2m_min?.[index]}°
                      </span>
                    </td>
                    <td className="p-3 font-semibold">
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-700">
                        {dailyWeather.precipitation_sum?.[index] || 0} mm
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center">
                        {React.cloneElement(
                          weatherIcons[dailyWeather.weather_code?.[index]] || (
                            <WiCloud />
                          ),
                          { size: 38 }
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WeatherDashboard;
