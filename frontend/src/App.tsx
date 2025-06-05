import React, { useState, useEffect, KeyboardEvent, FC } from 'react';
import { Search, MapPin, Droplets, Wind, Eye, Gauge, Sun, Moon, Cloud, CloudRain, CloudSnow, Zap, Loader } from 'lucide-react';
import { apiBaseUrl } from './config';

// Definición de interfaces para TypeScript
interface WeatherData {
  city: string;
  country: string;
  main: string;
  description: string;
  temperature: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  wind_speed: number;
  wind_deg: number;
  pressure: number;
  visibility: number;
  timestamp: number;
}

interface FeaturedCity {
  city: string;
  main: string;
  description: string;
  temperature: number;
  temp_min: number;
  temp_max: number;
}

// Definición de tipos para el mapa de iconos
type WeatherIconMap = {
  [key: string]: FC<{ className?: string }>;
};

const WeatherApp: FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [featuredCities, setFeaturedCities] = useState<FeaturedCity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchCity, setSearchCity] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // API Base URL - Configurada automáticamente según el entorno desde config.ts

  // Cargar ciudades destacadas al inicio
  useEffect(() => {
    fetchFeaturedCities();
    // Cargar Buenos Aires por defecto
    fetchWeather('Buenos Aires');
  }, []);
  


  const fetchFeaturedCities = async (): Promise<void> => {
    try {
      const response = await fetch(`${apiBaseUrl}/weather/featured`);
      if (!response.ok) throw new Error('Error al cargar ciudades');
      const data = await response.json();
      setFeaturedCities(data.slice(0, 4)); // Solo mostrar 4
    } catch (error) {
      console.error('Error fetching featured cities:', error);
    }
  };

  const fetchWeather = async (city: string): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl}/weather?city=${encodeURIComponent(city)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ciudad no encontrada');
      }
      const data = await response.json();
      setWeather(data);
      setSearchCity(''); // Limpiar búsqueda después de éxito
      
      // Ya no llamamos a fetchForecast aquí porque lo manejamos con useEffect
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error desconocido');
      }
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };
  


  const handleSearch = (): void => {
    if (searchCity.trim()) {
      fetchWeather(searchCity.trim());
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getWeatherIcon = (main: string): FC<{ className?: string }> => {
    const iconMap: WeatherIconMap = {
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

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const getWindDirection = (degree: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    return directions[Math.round(degree / 45) % 8];
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500'
    }`}>
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="glass p-3 rounded-full animate-float">
              <Sun className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Clima Argentina</h1>
              <p className="text-white/80">Pronóstico en tiempo real 🇦🇷</p>
            </div>
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="glass glass-hover p-3 rounded-full"
          >
            {darkMode ? <Sun className="h-6 w-6 text-white" /> : <Moon className="h-6 w-6 text-white" />}
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 pb-8">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="glass rounded-2xl p-6 shadow-2xl">
            <div className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Buscar ciudad argentina..."
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm transition-all"
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading || !searchCity.trim()}
                className="px-6 py-3 glass glass-hover border border-white/30 rounded-xl text-white font-medium transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? <Loader className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                <span>{loading ? 'Buscando...' : 'Buscar'}</span>
              </button>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-200 text-center">⚠️ {error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Weather Display */}
        {weather && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="glass rounded-3xl p-8 shadow-2xl">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Main Weather Info */}
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                    <MapPin className="h-6 w-6 text-white/80" />
                    <h2 className="text-2xl font-bold text-white">
                      {weather.city}, {weather.country}
                    </h2>
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start space-x-8 mb-6">
                    <div className="text-center">
                      {React.createElement(getWeatherIcon(weather.main), {
                        className: "h-24 w-24 text-white mx-auto mb-2 animate-float"
                      })}
                      <p className="text-white/80 capitalize font-medium">{weather.description}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-7xl font-bold text-white mb-2">
                        {Math.round(weather.temperature)}°
                      </p>
                      <p className="text-white/60 text-lg">
                        Sensación {Math.round(weather.feels_like)}°
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center md:justify-start space-x-6 text-white/80 text-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-300">{Math.round(weather.temp_min)}°</p>
                      <p className="text-sm">Mínima</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-300">{Math.round(weather.temp_max)}°</p>
                      <p className="text-sm">Máxima</p>
                    </div>
                  </div>
                </div>

                {/* Weather Details */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white mb-4">Detalles Meteorológicos</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <Droplets className="h-6 w-6 text-blue-300" />
                        <div>
                          <p className="text-white/60 text-sm">Humedad</p>
                          <p className="text-white font-bold text-xl">{weather.humidity}%</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <Wind className="h-6 w-6 text-green-300" />
                        <div>
                          <p className="text-white/60 text-sm">Viento</p>
                          <p className="text-white font-bold text-xl">{weather.wind_speed} m/s</p>
                          <p className="text-white/60 text-xs">{getWindDirection(weather.wind_deg)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <Gauge className="h-6 w-6 text-yellow-300" />
                        <div>
                          <p className="text-white/60 text-sm">Presión</p>
                          <p className="text-white font-bold text-xl">{weather.pressure}</p>
                          <p className="text-white/60 text-xs">hPa</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <Eye className="h-6 w-6 text-purple-300" />
                        <div>
                          <p className="text-white/60 text-sm">Visibilidad</p>
                          <p className="text-white font-bold text-xl">{(weather.visibility / 1000).toFixed(1)}</p>
                          <p className="text-white/60 text-xs">km</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass rounded-lg p-3 text-center">
                    <p className="text-white/60 text-sm">
                      Última actualización: {formatTime(weather.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        
        {/* Featured Cities */}
        {featuredCities.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-white text-center mb-6">🏙️ Ciudades Principales</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredCities.map((city, index) => {
                const IconComponent = getWeatherIcon(city.main);
                return (
                  <div
                    key={index}
                    onClick={() => fetchWeather(city.city)}
                    className="glass glass-hover rounded-2xl p-6 shadow-xl cursor-pointer transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="text-center">
                      <h4 className="text-white font-semibold text-lg mb-3">{city.city}</h4>
                      
                      <IconComponent className="h-12 w-12 text-white mx-auto mb-3 animate-pulse-slow" />
                      
                      <p className="text-3xl font-bold text-white mb-2">
                        {Math.round(city.temperature)}°
                      </p>
                      
                      <p className="text-white/70 text-sm capitalize mb-3">
                        {city.description}
                      </p>
                      
                      <div className="flex justify-between text-xs text-white/60">
                        <span className="flex items-center">
                          <span className="text-blue-300 mr-1">↓</span>
                          {Math.round(city.temp_min)}°
                        </span>
                        <span className="flex items-center">
                          <span className="text-red-300 mr-1">↑</span>
                          {Math.round(city.temp_max)}°
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-12 text-white/60">
          <div className="glass rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="text-lg mb-2">🌤️ Weather API Argentina</p>
            <p className="text-sm">Datos meteorológicos en tiempo real • Powered by OpenWeatherMap</p>
            <p className="text-xs mt-2 text-white/40">
              Desarrollado con ❤️ para Argentina
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default WeatherApp;
