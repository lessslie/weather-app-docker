import React from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, Zap, LucideIcon } from 'lucide-react';

interface Temperature {
  day: number;
  min: number;
  max: number;
}

interface Weather {
  main: string;
  description: string;
}

interface ForecastData {
  dayName: string;
  temperature: Temperature;
  weather: Weather;
  humidity: number;
  windSpeed: number;
}

interface ForecastCardProps {
  forecast: ForecastData;
}

const ForecastCard: React.FC<ForecastCardProps> = ({ forecast }) => {
  // Función para obtener el icono según el clima
  const getWeatherIcon = (main: string): LucideIcon => {
    const iconMap: Record<string, LucideIcon> = {
      'Clear': Sun,
      'Clouds': Cloud,
      'Rain': CloudRain,
      'Drizzle': CloudRain,
      'Snow': CloudSnow,
      'Thunderstorm': Zap,
      'Mist': Cloud,
      'Fog': Cloud,
    };
    return iconMap[main] || Cloud;
  };

  // Función para formatear el nombre del día
  const formatDayName = (dayName: string): string => {
    // Capitalizar primera letra y mostrar solo las primeras 3 letras
    return dayName.charAt(0).toUpperCase() + dayName.slice(1, 3);
  };

  return (
    <div className="glass rounded-xl p-4 flex flex-col items-center">
      <p className="text-white/80 font-medium mb-2">{formatDayName(forecast.dayName)}</p>
      
      {React.createElement(getWeatherIcon(forecast.weather.main), {
        className: "h-8 w-8 text-white mb-2"
      })}
      
      <p className="text-white font-bold text-xl mb-1">{forecast.temperature.day}°</p>
      
      <div className="flex justify-between w-full text-xs">
        <span className="text-blue-300">{forecast.temperature.min}°</span>
        <span className="text-red-300">{forecast.temperature.max}°</span>
      </div>
      
      <p className="text-white/60 text-xs mt-2 text-center capitalize">
        {forecast.weather.description}
      </p>
      
      <div className="mt-2 w-full border-t border-white/10 pt-2">
        <div className="flex justify-between text-xs text-white/60">
          <span>💧 {forecast.humidity}%</span>
          <span>💨 {forecast.windSpeed}m/s</span>
        </div>
      </div>
    </div>
  );
};

export default ForecastCard;
