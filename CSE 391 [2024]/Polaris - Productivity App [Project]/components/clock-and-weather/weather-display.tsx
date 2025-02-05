"use client";

import { Loader2 } from "lucide-react";
import { useWeather } from "@/hooks/use-weather";
import Image from "next/image";

function getAQILabel(aqi: number) {
  switch (aqi) {
    case 1: return { text: "Good", color: "text-green-500" };
    case 2: return { text: "Fair", color: "text-yellow-500" };
    case 3: return { text: "Moderate", color: "text-orange-500" };
    case 4: return { text: "Poor", color: "text-red-500" };
    case 5: return { text: "Very Poor", color: "text-purple-500" };
    default: return { text: "Unknown", color: "text-gray-500" };
  }
}

export function WeatherDisplay() {
  const { weather, loading, error } = useWeather();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading weather...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive text-sm">
        {error === "Weather API key is not configured" 
          ? "Weather service not configured"
          : error}
      </div>
    );
  }

  if (!weather) return null;

  const aqiInfo = getAQILabel(weather.aqi);

  return (
    <div className="flex flex-row gap-4">
      <div className="flex items-center gap-3">
        <Image
          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
          alt={weather.condition}
          width={40}
          height={40}
          className="dark:brightness-200"
        />
        <span className="text-xl font-semibold">{weather.temp}°C</span>
        <span className="text-muted-foreground">{weather.condition}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">AQI:</span>
        <span className={`${aqiInfo.color} font-bold`}> {aqiInfo.text}
        </span>
      </div>
    </div>
  );
}