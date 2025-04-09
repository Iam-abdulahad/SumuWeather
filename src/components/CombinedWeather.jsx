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
  0: <WiDaySunny size={80} color="#FFD700" />, // Clear sky (golden yellow)
  1: <WiDayCloudy size={80} color="#FBC02D" />, // Mainly clear (sunshine yellow)
  2: <WiCloud size={80} color="#90A4AE" />, // Partly cloudy (light gray-blue)
  3: <WiCloud size={80} color="#607D8B" />, // Overcast (darker gray)
  45: <WiFog size={80} color="#B0BEC5" />, // Fog (soft gray)
  48: <WiFog size={80} color="#B0BEC5" />, // Depositing rime fog
  51: <WiShowers size={80} color="#4FC3F7" />, // Light drizzle (light blue)
  53: <WiShowers size={80} color="#29B6F6" />, // Moderate drizzle
  55: <WiShowers size={80} color="#0288D1" />, // Dense drizzle
  56: <WiSleet size={80} color="#81D4FA" />, // Light freezing drizzle
  57: <WiSleet size={80} color="#4FC3F7" />, // Dense freezing drizzle
  61: <WiRain size={80} color="#2196F3" />, // Slight rain (blue)
  63: <WiRain size={80} color="#1976D2" />, // Moderate rain
  65: <WiRain size={80} color="#0D47A1" />, // Heavy rain (dark blue)
  66: <WiSleet size={80} color="#00ACC1" />, // Light freezing rain (teal)
  67: <WiSleet size={80} color="#00838F" />, // Heavy freezing rain
  71: <WiSnow size={80} color="#E1F5FE" />, // Slight snowfall (light snow blue)
  73: <WiSnow size={80} color="#B3E5FC" />, // Moderate snowfall
  75: <WiSnow size={80} color="#81D4FA" />, // Heavy snowfall
  77: <WiSnow size={80} color="#B2EBF2" />, // Snow grains
  80: <WiShowers size={80} color="#4FC3F7" />, // Slight rain showers
  81: <WiShowers size={80} color="#0288D1" />, // Moderate rain showers
  82: <WiThunderstorm size={80} color="#673AB7" />, // Violent rain showers (deep purple)
  85: <WiSnow size={80} color="#B3E5FC" />, // Slight snow showers
  86: <WiSnow size={80} color="#81D4FA" />, // Heavy snow showers
  95: <WiThunderstorm size={80} color="#FF5722" />, // Thunderstorm (orange-red)
  96: <WiThunderstorm size={80} color="#E64A19" />, // Thunderstorm with slight hail
  99: <WiThunderstorm size={80} color="#D84315" />, // Thunderstorm with heavy hail
};

const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [cityName, setCityName] = useState("");
  const [city, setCity] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timezone, setTimezone] = useState("Asia/Dhaka"); // Default to Dhaka
  const [localTime, setLocalTime] = useState("");
  const [weatherCode, setWeatherCode] = useState("");

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          // getCityName(latitude, longitude);

          // Fetch weather with the user's location
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
        },
        async (error) => {
          console.warn("Location access denied:", error.message);
          alert("Please enable location access for real-time weather updates.");

          // Default to Dhaka if user denies location access
          setLatitude(23.8103);
          setLongitude(90.4125);

          const data = await FetchWeatherData(23.8103, 90.4125, "Asia/Dhaka");
          if (data) {
            setWeatherData(data);
            setTimezone("Asia/Dhaka");
          }
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }, []);

  // console.log(latitude, longitude, timezone, localTime, weatherCode);

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

      console.log("Nearby City:", city);
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
    document.title = `SuMo Weather || ${cityName}`;
  }, [cityName]);

  // Update local time based on timezone
  useEffect(() => {
    const updateTime = () => {
      const date = new Date().toLocaleString("en-US", { timeZone: timezone });
      setLocalTime(date);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [timezone]);

  const handleSearch = async () => {
    if (!city) {
      setError("Please enter a Valid city name!");
      return;
    }
    if (!city.trim()) {
      setError("Please enter a city name!");
      return;
    }
    setLoading(true);
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
      }
    } catch (error) {
      setError(error.response.data);
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

  // Show only present and future hours
  const now = new Date();
  const upcomingHours =
    hourlyWeather?.time
      ?.map((time, index) => ({
        time,
        temp: hourlyWeather.temperature_2m?.[index] || "N/A",
        precipitation: hourlyWeather.precipitation?.[index] || 0,
        weatherCode: hourlyWeather.weather_code?.[index] || null, // Fetching weather code correctly
      }))
      .filter(({ time }) => new Date(time) >= now) || [];
  const upcomingHoursCount = Math.min(upcomingHours.length, 12); // Limit to 12 hours
  const upcomingHoursToShow = upcomingHours.slice(0, upcomingHoursCount);

  return (
    <div className="container mx-auto p-4 space-y-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "mirror",
        }}
        className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-30 blur-3xl"
      ></motion.div>

      {/* Search Bar */}
      <div className="relative flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-lg p-6  bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 bg-opacity-20 rounded-2xl shadow-2xl backdrop-blur-lg border border-white border-opacity-30"
        >
          <div className="max-w-md mx-auto">
            <div className="flex space-x-2 mb-6">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search city..."
                className="flex-1 p-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 shadow-sm"
                disabled={loading}
              />
              <button
                onClick={handleSearch}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-300 ease-in-out transform shadow-md ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 hover:bg-blue-700 hover:scale-105"
                } text-white`}
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FaSearch />
                    Search
                  </>
                )}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm">{error.message}</p>}
          </div>

          {currentWeather && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-4 p-6  bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300 backdrop-blur-md rounded-xl shadow-lg"
            >
              <h2 className="text-4xl font-extrabold text-white drop-shadow">
                {cityName}
              </h2>
              <p className="text-xl text-white opacity-90">
                {weatherData?.timezone}
              </p>

              <div className="text-6xl font-bold text-white drop-shadow">
                {weatherData?.current?.temperature_2m}°C
              </div>
              <div className="flex justify-center items-center text-white">
                {weatherIcons[currentWeather?.weather_code] || (
                  <WiCloud size={80} />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-white text-sm mt-6">
                <div className="flex items-center space-x-2">
                  <WiHumidity className="text-xl" />
                  <span>
                    Humidity: {weatherData?.current?.relative_humidity_2m}%
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <WiStrongWind className="text-xl" />
                  <span>Wind: {currentWeather?.wind_speed_10m} km/h</span>
                </div>
                <div className="flex items-center space-x-2">
                  <WiSunrise className="text-xl" />
                  <span>
                    Sunrise: {weatherData?.daily?.sunrise?.[0]?.slice(11)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <WiSunset className="text-xl" />
                  <span>
                    Sunset: {weatherData?.daily?.sunset?.[0]?.slice(11)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <WiThermometer className="text-xl" />
                  <span>
                    Feels Like: {currentWeather?.apparent_temperature}°C
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <WiDirectionUp className="text-xl" />
                  <span>
                    Max: {weatherData?.daily?.temperature_2m_max?.[0]}°C
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <WiDirectionDown className="text-xl" />
                  <span>
                    Min: {weatherData?.daily?.temperature_2m_min?.[0]}°C
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <WiRaindrops className="text-xl" />
                  <span>
                    Precipitation: {weatherData?.daily?.precipitation_sum?.[0]}{" "}
                    mm
                  </span>
                </div>
              </div>

              <p className="text-white text-xs mt-6 opacity-80">
                Last Updated: {new Date().toLocaleTimeString()}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Hourly Weather */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-transparent bg-clip-text tracking-wide mt-10 mb-6">
          Upcoming Hours
        </h2>
        <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
          {upcomingHours.map(({ time, temp, precipitation, weatherCode }) => (
            <div
              key={time}
              className="bg-gradient-to-b from-white to-gray-50 shadow-md rounded-2xl px-4 py-5 min-w-[110px] flex flex-col items-center justify-center transition-transform hover:scale-105 duration-200 ease-in-out"
            >
              <p className="text-sm font-medium text-gray-500">
                {formatDate(time, { hour: "2-digit", minute: "2-digit" })}
              </p>

              {/* Icon Container with fixed size */}
              <div className="w-12 h-12 flex items-center justify-center my-2 text-blue-400">
                {/* Ensure all icons have the same size */}
                {React.cloneElement(weatherIcons[weatherCode] || <WiCloud />, {
                  size: 42,
                })}
              </div>

              <p className="text-lg font-semibold text-gray-700">{temp}°C</p>
              <p className="text-xs text-blue-500 mt-1 text-center">
                Precipitation <br /> {precipitation} mm
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Weather Forecast */}
      <div className="space-y-4 font-sans">
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-transparent bg-clip-text tracking-wide mt-10 mb-6">
          7-Days Forecast
        </h2>
        <div className="overflow-hidden rounded-2xl shadow-lg border border-gray-200">
          <table className="w-full text-center">
            <thead className="bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 text-gray-700 text-sm uppercase tracking-wide">
              <tr>
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Temp (°C)</th>
                <th className="p-2.5">Precipitation</th>
                <th className="p-2.5">Sky</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {dailyWeather.time?.map((date, index) => (
                <tr
                  key={date}
                  className="hover:bg-gray-50 transition duration-200 ease-in-out"
                >
                  <td className="p-2.5 font-medium">
                    {formatDate(date, {
                      weekday: "short",
                      day: "numeric",
                      month: "numeric",
                    })}
                  </td>
                  <td className="p-2.5">
                    <span className="font-semibold">
                      {dailyWeather.temperature_2m_max?.[index]}°
                    </span>{" "}
                    /{" "}
                    <span className="text-gray-500">
                      {dailyWeather.temperature_2m_min?.[index]}°
                    </span>
                  </td>
                  <td className="p-2.5">
                    {dailyWeather.precipitation_sum?.[index] || 0} mm
                  </td>
                  <td className="p-2.5">
                    <div className="flex justify-center items-center">
                      {weatherIcons[dailyWeather.weather_code?.[index]] || (
                        <WiCloud size={32} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;
