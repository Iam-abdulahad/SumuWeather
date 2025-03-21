import axios from "axios";

const FetchWeatherData = async (latitude, longitude, timezone) => {
  try {
    const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude,
        longitude,
        current:
          "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation",
        hourly: "temperature_2m,rain,snowfall,relative_humidity_2m",
        daily:
          "temperature_2m_max,temperature_2m_min,rain_sum,snowfall_sum,weather_code",
        timezone: timezone || "auto",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    return null;
  }
};

export default FetchWeatherData;
