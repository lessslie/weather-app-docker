import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios, { AxiosError } from 'axios';
import { WeatherQuery } from './entities/weather-query.entity';
import { WeatherQueryDto } from './dto/weather-query.dto';

import { WeatherResponse } from './interfaces/weather-response.interface';

@Injectable()
export class WeatherService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(
    @InjectRepository(WeatherQuery)
    private readonly weatherQueryRepository: Repository<WeatherQuery>,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('OPENWEATHER_API_KEY') || '';
    if (!this.apiKey) {
      console.warn('⚠️ OPENWEATHER_API_KEY no está configurada');
    }
  }

  async getCurrentWeather(
    weatherQueryDto: WeatherQueryDto,
    userId?: string,
  ): Promise<WeatherResponse> {
    try {
      const { city, country } = weatherQueryDto;
      const query = country ? `${city},${country}` : city;

      const response = await axios.get<WeatherResponse>(
        `${this.baseUrl}/weather`,
        {
          params: {
            q: query,
            appid: this.apiKey,
            units: 'metric',
            lang: 'es',
          },
        },
      );

      // Guardar la consulta en la base de datos
      const weatherQuery = this.weatherQueryRepository.create({
        city,
        country,
        weatherData: response.data,
        userId,
      });

      await this.weatherQueryRepository.save(weatherQuery);

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.status === 404) {
        throw new NotFoundException('Ciudad no encontrada');
      }
      console.error(
        'Error al consultar el clima:',
        axiosError.message || 'Error desconocido',
      );
      throw new InternalServerErrorException('Error al consultar el clima');
    }
  }

  async getForecast(
    weatherQueryDto: WeatherQueryDto,
    userId?: string,
  ): Promise<WeatherResponse> {
    try {
      const { city, country } = weatherQueryDto;
      const query = country ? `${city},${country}` : city;

      const response = await axios.get<WeatherResponse>(
        `${this.baseUrl}/forecast`,
        {
          params: {
            q: query,
            appid: this.apiKey,
            units: 'metric',
            lang: 'es',
          },
        },
      );

      // Guardar la consulta en la base de datos
      const weatherQuery = this.weatherQueryRepository.create({
        city,
        country,
        weatherData: response.data,
        userId,
      });

      await this.weatherQueryRepository.save(weatherQuery);

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.status === 404) {
        throw new NotFoundException('Ciudad no encontrada');
      }
      console.error(
        'Error al consultar el pronóstico:',
        axiosError.message || 'Error desconocido',
      );
      throw new InternalServerErrorException(
        'Error al consultar el pronóstico',
      );
    }
  }

  async getRecentQueries(limit = 10): Promise<WeatherQuery[]> {
    return this.weatherQueryRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getUserQueries(userId: string, limit = 10): Promise<WeatherQuery[]> {
    return this.weatherQueryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
