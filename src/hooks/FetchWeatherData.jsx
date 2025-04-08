import axios from "axios";

const FetchWeatherData = async (latitude, longitude, timezone) => {
  try {
    const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude,
        longitude,
        current:
          "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,precipitation,apparent_temperature",
        hourly: "temperature_2m,precipitation,snowfall,relative_humidity_2m,weather_code",
        daily:
          "temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,weather_code",
        air_quality: "pm10,pm2_5,carbon_monoxide,nitrogen_dioxide",
        timezone: timezone || "Asia/Dhaka",
      },
    });
    console.log(response.data)
    return response.data;
    
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    return null;
  }
};

export default FetchWeatherData;
