import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GetWeatherDto, WeatherResponseDto } from './dto/weather.dto';
import { UsersService } from '../users/users.service';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';

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

    try {
      // Construir query para la API
      const query = province ? `${city},${province}` : city;
      
      // Hacer petición a OpenWeather usando axios
      const response = await this.httpService.axiosRef.get(
        `${this.baseUrl}/weather?q=${encodeURIComponent(query)}&appid=${this.apiKey}&units=metric&lang=es`
      );

      if (response.status !== 200) {
        if (response.status === 404) {
          throw new HttpException(
            `Ciudad "${city}" no encontrada. Verifica el nombre.`,
            HttpStatus.NOT_FOUND,
          );
        }
        throw new HttpException(
          'Error al consultar el servicio de clima',
          HttpStatus.BAD_GATEWAY,
        );
      }

      const data = response.data as {
        name: string;
        sys: { country: string };
        main: { temp: number; feels_like: number; temp_min: number; temp_max: number; humidity: number; pressure: number };
        weather: Array<{ description: string; main: string; icon: string }>;
        wind?: { speed: number; deg: number };
        visibility?: number;
        coord: { lat: number; lon: number };
      };

      // Transformar datos a nuestro formato
      const weatherData: WeatherResponseDto = {
        city: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        temp_min: Math.round(data.main.temp_min),
        temp_max: Math.round(data.main.temp_max),
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
      const err = error as AxiosError;
      console.error('Error al obtener clima:', err.message);
      
      if (err.response?.status === 404) {
        throw new HttpException(
          `Ciudad "${city}" no encontrada. Verifica el nombre.`,
          HttpStatus.NOT_FOUND,
        );
      }
      
      throw new HttpException(
        'Error al obtener datos del clima',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Método para obtener clima de múltiples ciudades
  async getWeatherMultipleCities(cities: string[]): Promise<WeatherResponseDto[]> {
    const promises = cities.map(city => 
      this.getWeatherByCity({ city }).catch(() => null)
    );
    
    const results = await Promise.all(promises);
    
    // Filtrar resultados nulos (ciudades no encontradas)
    return results.filter(result => result !== null) as WeatherResponseDto[];
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
    } catch (/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      _error
    ) {
      // Log error pero no fallar la petición principal
      console.error('Error al incrementar contador de peticiones del usuario');
    }
  }
}