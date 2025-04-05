import { useState, useEffect } from "react";
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
  WiCloudy,
  WiStrongWind,
} from "react-icons/wi";
import axios from "axios";
import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";

const weatherIcons = {
  0: <WiDaySunny size={80} />, // Clear sky
  1: <WiDayCloudy size={80} />, // Mainly clear
  2: <WiCloud size={80} />, // Partly cloudy
  3: <WiCloud size={80} />, // Overcast
  45: <WiFog size={80} />, // Fog
  48: <WiFog size={80} />, // Depositing rime fog
  51: <WiShowers size={80} />, // Light drizzle
  53: <WiShowers size={80} />, // Moderate drizzle
  55: <WiShowers size={80} />, // Dense drizzle
  56: <WiSleet size={80} />, // Light freezing drizzle
  57: <WiSleet size={80} />, // Dense freezing drizzle
  61: <WiRain size={80} />, // Slight rain
  63: <WiRain size={80} />, // Moderate rain
  65: <WiRain size={80} />, // Heavy rain
  66: <WiSleet size={80} />, // Light freezing rain
  67: <WiSleet size={80} />, // Heavy freezing rain
  71: <WiSnow size={80} />, // Slight snowfall
  73: <WiSnow size={80} />, // Moderate snowfall
  75: <WiSnow size={80} />, // Heavy snowfall
  77: <WiSnow size={80} />, // Snow grains
  80: <WiShowers size={80} />, // Slight rain showers
  81: <WiShowers size={80} />, // Moderate rain showers
  82: <WiThunderstorm size={80} />, // Violent rain showers
  85: <WiSnow size={80} />, // Slight snow showers
  86: <WiSnow size={80} />, // Heavy snow showers
  95: <WiThunderstorm size={80} />, // Thunderstorm
  96: <WiThunderstorm size={80} />, // Thunderstorm with slight hail
  99: <WiThunderstorm size={80} />, // Thunderstorm with heavy hail
};

const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
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
        rain: hourlyWeather.rain?.[index] || 0,
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
      <div className="relative flex justify-center items-center h-96">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-lg p-6 bg-white bg-opacity-20 rounded-xl shadow-lg backdrop-blur-lg"
        >
          <div className="max-w-md mx-auto">
            <div className="flex space-x-2 mb-4">
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
                    : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
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
            {error && <p className="text-red-500 text-sm">{error.massage}</p>}
          </div>

          {currentWeather && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-4 p-8 bg-white/30 backdrop-blur-md rounded-lg shadow-lg relative z-10"
            >
              <h2 className="text-3xl font-bold">{weatherData?.timezone}</h2>
              <div className="flex justify-center items-center space-x-4">
                <p className="text-6xl font-bold">
                  {weatherData?.current?.temperature_2m}°C
                </p>
              </div>
              <div className="flex justify-center items-center space-x-4">
                {weatherIcons[currentWeather?.weather_code] || (
                  <WiCloud size={80} />
                )}
              </div>
              <p className="text-lg">
                Humidity: {weatherData?.current?.relative_humidity_2m}%
              </p>
              <p className="text-lg">
                Wind Speed: {currentWeather?.wind_speed_10m}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Hourly Weather */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Upcoming Hours</h2>
        <div className="flex overflow-x-auto space-x-4">
          {upcomingHours.map(({ time, temp, rain, weatherCode }) => (
            <div
              key={time}
              className="bg-white shadow rounded-lg p-3 min-w-[120px] text-center"
            >
              <p>{formatDate(time, { hour: "2-digit", minute: "2-digit" })}</p>

              {/* Corrected weather icon mapping */}
              <div>{weatherIcons[weatherCode] || <WiCloud size={50} />}</div>

              <p>{temp}°C</p>
              <p className="text-xs">Rain: {rain} mm</p>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Weather Forecast */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold">7-Day Forecast</h2>
        <table className="w-full border-collapse border border-gray-200 text-center">
          <thead className="bg-blue-100">
            <tr>
              <th className="border border-gray-300 p-2">Date</th>
              <th className="border border-gray-300 p-2">Temp (°C)</th>
              <th className="border border-gray-300 p-2">Rain</th>
              <th className="border border-gray-300 p-2">Sky</th>
            </tr>
          </thead>
          <tbody>
            {dailyWeather.time?.map((date, index) => (
              <tr key={date} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2">
                  {formatDate(date, {
                    weekday: "short",
                    day: "numeric",
                    month: "numeric",
                  })}
                </td>
                <td className="border border-gray-300 p-2">
                  {dailyWeather.temperature_2m_max?.[index]}° /{" "}
                  {dailyWeather.temperature_2m_min?.[index]}°
                </td>
                <td className="border border-gray-300 p-2">
                  {dailyWeather.rain_sum?.[index] || 0}%
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {/* Correctly mapped weather code */}
                  {weatherIcons[dailyWeather.weather_code?.[index]] || (
                    <WiCloud size={50} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeatherDashboard;
