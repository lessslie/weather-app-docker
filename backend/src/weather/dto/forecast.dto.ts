import { ApiProperty } from '@nestjs/swagger';

class WeatherInfo {
  @ApiProperty({ example: 'Clear', description: 'Condición climática principal' })
  main: string;

  @ApiProperty({ example: 'cielo despejado', description: 'Descripción detallada del clima' })
  description: string;

  @ApiProperty({ example: '01d', description: 'Código de icono para representar el clima' })
  icon: string;
}

class DailyTemperature {
  @ApiProperty({ example: 15, description: 'Temperatura mínima del día' })
  min: number;

  @ApiProperty({ example: 25, description: 'Temperatura máxima del día' })
  max: number;

  @ApiProperty({ example: 22, description: 'Temperatura durante el día' })
  day: number;

  @ApiProperty({ example: 18, description: 'Temperatura durante la noche' })
  night: number;
}

class DailyForecast {
  @ApiProperty({ example: '2025-06-05', description: 'Fecha del pronóstico en formato YYYY-MM-DD' })
  date: string;

  @ApiProperty({ example: 'jueves', description: 'Nombre del día de la semana' })
  dayName: string;

  @ApiProperty({ type: DailyTemperature, description: 'Temperaturas del día' })
  temperature: DailyTemperature;

  @ApiProperty({ type: WeatherInfo, description: 'Información del clima' })
  weather: WeatherInfo;

  @ApiProperty({ example: 65, description: 'Porcentaje de humedad' })
  humidity: number;

  @ApiProperty({ example: 1013, description: 'Presión atmosférica en hPa' })
  pressure: number;

  @ApiProperty({ example: 5.2, description: 'Velocidad del viento en m/s' })
  windSpeed: number;

  @ApiProperty({ example: 180, description: 'Dirección del viento en grados' })
  windDirection: number;

  @ApiProperty({ example: 40, description: 'Porcentaje de nubosidad' })
  clouds: number;

  @ApiProperty({ example: 0.5, description: 'Precipitación en mm' })
  precipitation: number;

  @ApiProperty({ example: 6.2, description: 'Índice UV' })
  uvi: number;
}

class LocationInfo {
  @ApiProperty({ example: -34.6118, description: 'Latitud' })
  lat: number;

  @ApiProperty({ example: -58.4173, description: 'Longitud' })
  lon: number;

  @ApiProperty({ example: 'America/Argentina/Buenos_Aires', description: 'Zona horaria' })
  timezone: string;
}

export class ForecastResponseDto {
  @ApiProperty({ type: LocationInfo, description: 'Información de ubicación' })
  location: LocationInfo;

  @ApiProperty({ type: [DailyForecast], description: 'Pronóstico para los próximos 7 días' })
  forecast: DailyForecast[];
}
