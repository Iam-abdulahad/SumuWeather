import { useState, useEffect } from "react";
import FetchWeatherData from "../hooks/FetchWeatherData";
import {
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiSnow,
  WiStrongWind,
} from "react-icons/wi";
import axios from "axios";
import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";

const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      const fetchData = async () => {
        const data = await FetchWeatherData(latitude, longitude, "auto");
        setWeatherData(data);
      };
      fetchData();
    }
  }, [latitude, longitude]);

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

  const getDayNightStatus = () => {
    if (!weatherData) return true; // Default to day mode if no data

    const now = new Date().getTime();
    const sunrise = new Date(weatherData?.daily?.sunrise?.[0]).getTime();
    const sunset = new Date(weatherData?.daily?.sunset?.[0]).getTime();

    return now >= sunrise && now < sunset; // Returns true for day, false for night
  };

  const getWeatherIcon = (condition, isDaytime) => {
    const lowerCaseCondition = condition.toLowerCase();
    if (
      lowerCaseCondition.includes("clear") ||
      lowerCaseCondition.includes("sun")
    ) {
      return isDaytime ? (
        <WiDaySunny className="text-yellow-400 text-6xl" />
      ) : (
        <WiCloudy className="text-gray-400 text-6xl" />
      );
    }
    if (lowerCaseCondition.includes("cloud")) {
      return <WiCloudy className="text-gray-500 text-6xl" />;
    }
    if (lowerCaseCondition.includes("rain")) {
      return <WiRain className="text-blue-500 text-6xl" />;
    }
    if (lowerCaseCondition.includes("snow")) {
      return <WiSnow className="text-blue-300 text-6xl" />;
    }
    if (
      lowerCaseCondition.includes("wind") ||
      lowerCaseCondition.includes("storm")
    ) {
      return <WiStrongWind className="text-gray-700 text-6xl" />;
    }
    return <WiCloudy className="text-gray-500 text-6xl" />;
  };

  const formatDate = (date, options) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-GB", options).format(new Date(date));
  };

  const currentWeather = weatherData?.current || {};
  const dailyWeather = weatherData?.daily || {};
  const hourlyWeather = weatherData?.hourly || {};
  const isDaytime = getDayNightStatus();

  // Show only present and future hours
  const now = new Date();
  const upcomingHours =
    hourlyWeather.time
      ?.map((time, index) => ({ time, index }))
      .filter(({ time }) => new Date(time) >= now) || [];

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
              <p className="text-lg">
                Humidity: {weatherData?.current?.relative_humidity_2m}%
              </p>
              <p className="text-lg">
                Wind Speed: {weatherData?.current?.wind_speed_10m} m/s
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Hourly Weather */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Upcoming Hours</h2>
        <div className="flex overflow-x-auto space-x-4">
          {upcomingHours.map(({ time, index }) => (
            <div
              key={time}
              className="bg-white shadow rounded-lg p-3 min-w-[120px] text-center"
            >
              <p>{formatDate(time, { hour: "2-digit", minute: "2-digit" })}</p>
              {getWeatherIcon("cloud")}
              <p>{hourlyWeather.temperature_2m[index]}°C</p>
              <p className="text-xs">
                Rain: {hourlyWeather.rain?.[index] || 0} mm
              </p>
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
              <th className="border border-gray-300 p-2">Rain/Snow %</th>
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
                  {dailyWeather.rain_sum?.[index] || 0}% /{" "}
                  {dailyWeather.snowfall_sum?.[index] || 0}%
                </td>
                <td className="border border-gray-300 p-2">
                  {getWeatherIcon("cloud")}
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
