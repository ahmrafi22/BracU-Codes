export interface WeatherData {
  temp: number; // Temperature in Celsius
  condition: string; // Weather condition (e.g., Clear, Rain)
  aqi: number; // Air Quality Index (1-5)
  icon: string; // Icon code for weather condition
}

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

  if (!API_KEY) {
    throw new Error('Weather API key is not configured');
  }

  // Fetch weather data
  const weatherResponse = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  );

  if (!weatherResponse.ok) {
    throw new Error('Failed to fetch weather data');
  }

  // Fetch AQI data
  const aqiResponse = await fetch(
    `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );

  if (!aqiResponse.ok) {
    throw new Error('Failed to fetch AQI data');
  }

  const weatherData = await weatherResponse.json();
  const aqiData = await aqiResponse.json();

  const aqiValue = aqiData.list[0].main.aqi;

  return {
    temp: Math.round(weatherData.main.temp),
    condition: weatherData.weather[0].main,
    icon: weatherData.weather[0].icon,
    aqi: aqiValue, // Full AQI value
  };
}
