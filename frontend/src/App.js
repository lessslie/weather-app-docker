import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export default function WeatherApp() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Actualizar hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cargar clima inicial
  useEffect(() => {
    testConnection();
    searchWeatherForCity('Buenos Aires');
  }, []);

  const testConnection = async () => {
    try {
      console.log('Probando conexión con backend...');
      const response = await fetch(`${API_BASE_URL}/`);
      const data = await response.text();
      console.log('Backend responde:', data);
      
      const endpoints = ['/weather/recent'];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Probando: ${API_BASE_URL}${endpoint}`);
          const testResponse = await fetch(`${API_BASE_URL}${endpoint}`);
          console.log(`✅ ${endpoint} funciona:`, testResponse.status);
        } catch (error) {
          console.log(`❌ ${endpoint} falló:`, error.message);
        }
      }
    } catch (error) {
      console.error('Error de conexión general:', error);
    }
  };

  const searchWeatherForCity = async (cityName) => {
    try {
      console.log(`🔍 Obteniendo clima para: ${cityName}`);
      
      const response = await fetch(`${API_BASE_URL}/weather/current`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ city: cityName })
      });
      
      if (response.ok) {
        let normalizedWeather = await response.json();
        
        if (normalizedWeather.weatherData) {
          normalizedWeather = normalizedWeather.weatherData;
        }
        
        console.log('✅ Clima obtenido:', normalizedWeather);
        setWeather(normalizedWeather);
        
        // 🎯 FIX: Generar forecast con la nueva temperatura
        const newForecast = generateMockHourlyDataStatic(normalizedWeather?.main?.temp || 14);
        setForecast(newForecast);
        
        setError('');
        return true;
      }
      
      throw new Error(`HTTP ${response.status}`);
      
    } catch (err) {
      console.error('❌ Error al obtener clima:', err);
      
      try {
        console.log('🔄 Intentando con /weather/recent como fallback...');
        const fallbackResponse = await fetch(`${API_BASE_URL}/weather/recent`);
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          
          let weatherData = Array.isArray(fallbackData) ? fallbackData[0] : fallbackData;
          
          if (weatherData.weatherData) {
            weatherData = weatherData.weatherData;
          }
          
          console.log('✅ Clima obtenido (fallback):', weatherData);
          setWeather(weatherData);
          
          // 🎯 FIX: Generar forecast con la temperatura de fallback
          const fallbackForecast = generateMockHourlyDataStatic(weatherData?.main?.temp || 14);
          setForecast(fallbackForecast);
          
          setError('Mostrando clima reciente (búsqueda específica no disponible)');
          return true;
        }
      } catch (fallbackErr) {
        console.error('❌ Fallback también falló:', fallbackErr);
      }
      
      setError(`Error al obtener el clima: ${err.message}`);
      setWeather(null);
      return false;
    }
  };

  const generateMockHourlyDataStatic = (baseTemp = 14) => {
    const hours = [];
    const now = new Date();
    
    const hourlyData = [
      { hour: now.getHours(), temp: Math.round(baseTemp), icon: '☀️' },
      { hour: (now.getHours() + 1) % 24, temp: Math.round(baseTemp + 1), icon: '🌤️' },
      { hour: (now.getHours() + 2) % 24, temp: Math.round(baseTemp + 2), icon: '☀️' },
      { hour: (now.getHours() + 3) % 24, temp: Math.round(baseTemp + 3), icon: '🌤️' },
      { hour: (now.getHours() + 4) % 24, temp: Math.round(baseTemp + 2), icon: '⛅' },
      { hour: (now.getHours() + 5) % 24, temp: Math.round(baseTemp + 1), icon: '☁️' },
      { hour: (now.getHours() + 6) % 24, temp: Math.round(baseTemp), icon: '🌧️' },
      { hour: (now.getHours() + 7) % 24, temp: Math.round(baseTemp - 1), icon: '🌦️' },
      { hour: (now.getHours() + 8) % 24, temp: Math.round(baseTemp - 2), icon: '☁️' },
      { hour: (now.getHours() + 9) % 24, temp: Math.round(baseTemp - 1), icon: '⛅' },
      { hour: (now.getHours() + 10) % 24, temp: Math.round(baseTemp), icon: '🌤️' },
      { hour: (now.getHours() + 11) % 24, temp: Math.round(baseTemp + 1), icon: '☀️' }
    ];
    
    return { 
      hourly: hourlyData.map(item => ({
        time: item.hour,
        temp: item.temp,
        icon: item.icon,
        condition: 'Clima'
      }))
    };
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchCity.trim()) return;
    
    setLoading(true);
    // 🎯 FIX: Ahora searchWeatherForCity maneja el forecast internamente
    await searchWeatherForCity(searchCity.trim());
    setLoading(false);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getWeatherIcon = (weatherMain) => {
    const icons = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Snow': '❄️',
      'Thunderstorm': '⛈️',
      'Drizzle': '🌦️',
      'Mist': '🌫️',
      'Fog': '🌫️'
    };
    return icons[weatherMain] || '🌤️';
  };

  // Estilos responsivos
  const containerStyle = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
    minHeight: '100vh',
    padding: isMobile ? '12px' : '24px',
    color: 'white',
    maxWidth: isMobile ? '100%' : '1200px',
    margin: '0 auto'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'center',
    marginBottom: isMobile ? '16px' : '24px',
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? '12px' : '0'
  };

  const searchContainerStyle = {
    marginBottom: isMobile ? '16px' : '24px'
  };

  const searchBoxStyle = {
    display: 'flex',
    gap: isMobile ? '8px' : '12px',
    background: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '4px',
    width: '100%'
  };

  const inputStyle = {
    flex: 1,
    background: 'transparent',
    border: 'none',
    padding: isMobile ? '10px 12px' : '12px 16px',
    color: 'white',
    fontSize: isMobile ? '14px' : '16px',
    outline: 'none'
  };

  const currentWeatherStyle = {
    background: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: isMobile ? '16px' : '24px',
    marginBottom: isMobile ? '16px' : '24px',
    textAlign: 'center'
  };

  const weatherMainStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isMobile ? '12px' : '16px',
    margin: '20px 0',
    flexDirection: isMobile ? 'column' : 'row'
  };

  const temperatureStyle = {
    fontSize: isMobile ? '36px' : '48px',
    fontWeight: '300',
    lineHeight: '1'
  };

  const iconStyle = {
    fontSize: isMobile ? '48px' : '64px'
  };

  const minMaxGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: isMobile ? '12px' : '16px',
    marginTop: '20px'
  };

  const hourlyContainerStyle = {
    background: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: isMobile ? '16px' : '20px',
    marginBottom: isMobile ? '16px' : '24px'
  };

  const hourlyScrollStyle = {
    display: 'flex',
    overflowX: 'auto',
    gap: isMobile ? '8px' : '12px',
    paddingBottom: '8px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    WebkitOverflowScrolling: 'touch'
  };

  const hourlyItemStyle = (index) => ({
    minWidth: isMobile ? '60px' : '70px',
    textAlign: 'center',
    background: index === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
    borderRadius: isMobile ? '12px' : '16px',
    padding: isMobile ? '12px 6px' : '16px 8px',
    border: index === 0 ? '1px solid rgba(255,255,255,0.3)' : 'none',
    flexShrink: 0
  });

  const detailsContainerStyle = {
    background: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: isMobile ? '16px' : '20px'
  };

  const detailsGridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
    gap: isMobile ? '12px' : '16px'
  };

  return (
    <div style={containerStyle}>
      {/* Header Responsive */}
      <div style={headerStyle}>
        <div style={{ width: isMobile ? '100%' : 'auto' }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: isMobile ? '20px' : '24px', 
            fontWeight: '600' 
          }}>
            Clima
          </h1>
          <p style={{ 
            margin: '4px 0 0 0', 
            opacity: 0.8, 
            fontSize: isMobile ? '12px' : '14px' 
          }}>
            {formatDate(currentTime)}
          </p>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: isMobile ? '6px 12px' : '8px 16px',
          fontSize: isMobile ? '14px' : '16px',
          fontWeight: '500',
          width: isMobile ? '100%' : 'auto',
          textAlign: 'center'
        }}>
          {formatTime(currentTime)}
        </div>
      </div>

      {/* Search Responsive */}
      <div style={searchContainerStyle}>
        <div style={searchBoxStyle}>
          <input
            type="text"
            placeholder="Buscar ciudad..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
            style={inputStyle}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              background: 'rgba(255,255,255,0.3)',
              border: 'none',
              borderRadius: '12px',
              padding: isMobile ? '10px 16px' : '12px 20px',
              color: 'white',
              cursor: 'pointer',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '500'
            }}
          >
            {loading ? '⏳' : '🔍'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: isMobile ? '12px' : '16px',
          marginBottom: isMobile ? '16px' : '24px',
          textAlign: 'center',
          color: '#ffeb3b',
          fontSize: isMobile ? '14px' : '16px'
        }}>
          {error}
        </div>
      )}

      {weather && (
        <>
          {/* Current Weather Responsive */}
          <div style={currentWeatherStyle}>
            <h2 style={{ 
              margin: '0 0 8px 0', 
              fontSize: isMobile ? '16px' : '20px', 
              fontWeight: '500',
              opacity: 0.9
            }}>
              📍 {weather.name}, {weather.sys?.country || 'AR'}
            </h2>
            
            <div style={weatherMainStyle}>
              <div style={iconStyle}>
                {getWeatherIcon(weather.weather?.[0]?.main)}
              </div>
              <div>
                <div style={temperatureStyle}>
                  {Math.round(weather.main?.temp || 0)}°
                </div>
                <div style={{ 
                  fontSize: isMobile ? '14px' : '16px', 
                  opacity: 0.8,
                  textTransform: 'capitalize'
                }}>
                  {weather.weather?.[0]?.description || 'Clima'}
                </div>
              </div>
            </div>

            <div style={minMaxGridStyle}>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '12px',
                padding: isMobile ? '10px' : '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>MÍNIMA</div>
                <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '600' }}>
                  {Math.round(weather.main?.temp_min || 0)}°
                </div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '12px',
                padding: isMobile ? '10px' : '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>MÁXIMA</div>
                <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '600' }}>
                  {Math.round(weather.main?.temp_max || 0)}°
                </div>
              </div>
            </div>
          </div>

          {/* Hourly Forecast Responsive */}
          <div style={hourlyContainerStyle}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: isMobile ? '14px' : '16px', 
              fontWeight: '500',
              opacity: 0.9
            }}>
              PRONÓSTICO POR HORAS
            </h3>
            
            <div style={hourlyScrollStyle}>
              {(forecast?.hourly || []).slice(0, 12).map((hour, index) => (
                <div key={index} style={hourlyItemStyle(index)}>
                  <div style={{ 
                    fontSize: isMobile ? '10px' : '12px', 
                    opacity: 0.8,
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    {index === 0 ? 'Ahora' : `${String(hour.time).padStart(2, '0')}:00`}
                  </div>
                  <div style={{ 
                    fontSize: isMobile ? '24px' : '32px',
                    marginBottom: '8px',
                    height: isMobile ? '30px' : '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {hour.icon}
                  </div>
                  <div style={{ 
                    fontSize: isMobile ? '14px' : '16px',
                    fontWeight: '600'
                  }}>
                    {hour.temp}°
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weather Details Responsive */}
          <div style={detailsContainerStyle}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: isMobile ? '14px' : '16px', 
              fontWeight: '500',
              opacity: 0.9
            }}>
              DETALLES DEL CLIMA
            </h3>
            
            <div style={detailsGridStyle}>
              <div style={{ marginBottom: isMobile ? '12px' : '0' }}>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>SENSACIÓN TÉRMICA</div>
                <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '600' }}>
                  {Math.round(weather.main?.feels_like || 0)}°C
                </div>
              </div>
              <div style={{ marginBottom: isMobile ? '12px' : '0' }}>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>HUMEDAD</div>
                <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '600' }}>
                  {weather.main?.humidity || 0}%
                </div>
              </div>
              <div style={{ marginBottom: isMobile ? '12px' : '0' }}>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>VIENTO</div>
                <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '600' }}>
                  {Math.round((weather.wind?.speed || 0) * 3.6)} km/h
                </div>
              </div>
              <div style={{ marginBottom: isMobile ? '12px' : '0' }}>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>PRESIÓN</div>
                <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '600' }}>
                  {weather.main?.pressure || 0} hPa
                </div>
              </div>
              <div style={{ marginBottom: isMobile ? '12px' : '0' }}>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>VISIBILIDAD</div>
                <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '600' }}>
                  {((weather.visibility || 0) / 1000).toFixed(1)} km
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>ÍNDICE UV</div>
                <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '600' }}>
                  {weather.uvi || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}