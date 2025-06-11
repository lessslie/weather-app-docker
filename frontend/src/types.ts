// Definición de tipos para la aplicación Weather

// Tipo para el clima actual
export interface WeatherData {
  name: string;
  sys?: {
    country?: string;
  };
  weather?: Array<{
    main: string;
    description: string;
  }>;
  main?: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
  };
  wind?: {
    speed: number;
    deg: number;
  };
  visibility?: number;
  uvi?: number | string;
}

// Tipo para el pronóstico por horas
export interface HourlyForecast {
  time: number;
  temp: number;
  icon: string;
  condition: string;
}

export interface ForecastData {
  hourly: HourlyForecast[];
}

// Tipo para los iconos del clima
export interface WeatherIcons {
  [key: string]: string;
}
