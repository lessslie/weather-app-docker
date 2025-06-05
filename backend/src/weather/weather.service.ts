import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GetWeatherDto, WeatherResponseDto } from './dto/weather.dto';
import { UsersService } from '../users/users.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class WeatherService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private usersService: UsersService,
    private httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('OPENWEATHER_API_KEY') || '';
    this.baseUrl = this.configService.get<string>('OPENWEATHER_BASE_URL') || 'https://api.openweathermap.org/data/2.5';
    
    // Validar que tenemos la API key
    if (!this.apiKey) {
      throw new Error('OPENWEATHER_API_KEY no está configurada en las variables de ambiente');
    }
  }


  // Agregar este método a weather.service.ts

async getFiveDayForecast(lat: number, lon: number): Promise<any> {
  try {
    // Usamos la API gratuita de 5 días/3 horas
    const url = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`;
    
    const response = await this.httpService.axiosRef.get(url);
    
    if (response.status !== 200) {
      throw new HttpException('Error al obtener datos del clima', HttpStatus.BAD_REQUEST);
    }

    // Agrupar pronósticos por día (tomando un pronóstico por día, a mediodía)
    const forecastsByDay = {};
    
    response.data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0]; // YYYY-MM-DD
      const hour = new Date(item.dt * 1000).getHours();
      
      // Preferimos pronósticos cercanos al mediodía (12-15h) para representar el día
      if (!forecastsByDay[date] || (hour >= 12 && hour <= 15)) {
        forecastsByDay[date] = item;
      }
    });
    
    // Convertir a array y tomar máximo 5 días
    const fiveDayForecast = Object.values(forecastsByDay).slice(0, 5).map((item: any) => {
      const date = new Date(item.dt * 1000);
      return {
        date: date.toISOString().split('T')[0], // Formato YYYY-MM-DD
        dayName: date.toLocaleDateString('es-ES', { weekday: 'long' }),
        temperature: {
          min: Math.round(item.main.temp_min),
          max: Math.round(item.main.temp_max),
          day: Math.round(item.main.temp),
          night: Math.round(item.main.temp) // No tenemos temp nocturna en esta API
        },
        weather: {
          main: item.weather[0].main,
          description: item.weather[0].description,
          icon: item.weather[0].icon
        },
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        windSpeed: item.wind.speed,
        windDirection: item.wind.deg,
        clouds: item.clouds.all,
        precipitation: item.rain ? item.rain['3h'] || 0 : 0,
        visibility: item.visibility / 1000 // en km
      };
    });

    return {
      location: {
        lat,
        lon,
        timezone: response.data.city.timezone,
        city: response.data.city.name,
        country: response.data.city.country
      },
      forecast: fiveDayForecast
    };

  } catch (error) {
    console.error('Error en getFiveDayForecast:', error.message);
    
    if (error.response?.status === 401) {
      throw new HttpException('API Key inválida', HttpStatus.UNAUTHORIZED);
    }
    
    if (error.response?.status === 404) {
      throw new HttpException('Ubicación no encontrada', HttpStatus.NOT_FOUND);
    }
    
    throw new HttpException(
      'Error al obtener pronóstico de 7 días',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

  async getWeatherByCity(getWeatherDto: GetWeatherDto): Promise<WeatherResponseDto> {
    const { city, province } = getWeatherDto;
    
    // Crear clave para el cache
    const cacheKey = `weather_${city.toLowerCase()}${province ? `_${province.toLowerCase()}` : ''}`;
    
    // Verificar si tenemos datos en cache
    const cachedData = await this.cacheManager.get<WeatherResponseDto>(cacheKey);
    if (cachedData) {
      return {
        ...cachedData,
        timestamp: new Date().toISOString(),
      };
    }

    // Construir query para buscar la ciudad
    const query = province ? `${city},${province},AR` : `${city},AR`;
    
    try {
      // Llamar a OpenWeatherMap API
      const response = await fetch(
        `${this.baseUrl}/weather?q=${encodeURIComponent(query)}&appid=${this.apiKey}&units=metric&lang=es`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new HttpException(
            `Ciudad "${city}" no encontrada en Argentina. Verifica el nombre.`,
            HttpStatus.NOT_FOUND,
          );
        }
        throw new HttpException(
          'Error al consultar el servicio de clima',
          HttpStatus.BAD_GATEWAY,
        );
      }

      const data = await response.json();

      // Transformar datos a nuestro formato
      const weatherData: WeatherResponseDto = {
        city: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp * 10) / 10,
        feels_like: Math.round(data.main.feels_like * 10) / 10,
        temp_min: Math.round(data.main.temp_min * 10) / 10,
        temp_max: Math.round(data.main.temp_max * 10) / 10,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        description: data.weather[0].description,
        main: data.weather[0].main,
        icon: data.weather[0].icon,
        wind_speed: data.wind?.speed || 0,
        wind_deg: data.wind?.deg || 0,
        visibility: data.visibility || 0,
        timestamp: new Date().toISOString(),
      };

      // Guardar en cache por 10 minutos
      await this.cacheManager.set(cacheKey, weatherData, 600000);

      return weatherData;

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Error interno del servidor al consultar el clima',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Método para obtener clima de múltiples ciudades
  async getWeatherMultipleCities(cities: string[]): Promise<WeatherResponseDto[]> {
    const promises = cities.map(city => 
      this.getWeatherByCity({ city }).catch(error => ({
        error: error.message,
        city,
      }))
    );

    const results = await Promise.all(promises);
    return results.filter(result => !('error' in result)) as WeatherResponseDto[];
  }

  // Método para limpiar cache de una ciudad
  async clearCityCache(city: string, province?: string): Promise<void> {
    const cacheKey = `weather_${city.toLowerCase()}${province ? `_${province.toLowerCase()}` : ''}`;
    await this.cacheManager.del(cacheKey);
  }

  // Incrementar contador de consultas del usuario
  async incrementUserWeatherRequest(userId: string): Promise<void> {
    try {
      await this.usersService.incrementWeatherRequests(userId);
    } catch (error) {
      // Log error pero no fallar la petición del clima
      console.error('Error incrementing user weather requests:', error);
    }
  }
}