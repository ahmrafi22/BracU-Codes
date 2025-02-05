"use client";

import { useState, useEffect } from 'react';
import { WeatherData, fetchWeatherData } from '@/lib/weather-service';

interface WeatherHookResult {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
}

export function useWeather(): WeatherHookResult {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const getWeather = async () => {
      try {
        if (!("geolocation" in navigator)) {
          throw new Error("Geolocation is not supported");
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        const data = await fetchWeatherData(latitude, longitude);
        
        if (mounted) {
          setWeather(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("Failed to fetch weather data");
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getWeather();

    return () => {
      mounted = false;
    };
  }, []);

  return { weather, loading, error };
}