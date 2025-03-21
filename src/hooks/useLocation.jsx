import { useState, useEffect } from 'react';

const useWeather = (location) => {
          const [weather, setWeather] = useState(null);
          const [loading, setLoading] = useState(true);
          const [error, setError] = useState(null);

          useEffect(() => {
                    if (location.latitude && location.longitude) {
                              const fetchWeather = async () => {
                                        try {
                                                  const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
                                                            params: {
                                                                      lat: location.latitude,
                                                                      lon: location.longitude,
                                                                      appid: 'YOUR_API_KEY', // Replace with your OpenWeatherMap API key
                                                                      units: 'metric'
                                                            }
                                                  });
                                                  setWeather(response.data);
                                        } catch (err) {
                                                  setError('Failed to fetch weather data');
                                        } finally {
                                                  setLoading(false);
                                        }
                              };

                              fetchWeather();
                    }
          }, [location]);

          return { weather, loading, error };
};

export default useWeather;