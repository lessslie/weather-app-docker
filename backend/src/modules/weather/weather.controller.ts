import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { WeatherQueryDto } from './dto/weather-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WeatherQuery } from './entities/weather-query.entity';
import { RequestWithUser } from '../../interfaces/request.interface';
import { WeatherResponse } from './interfaces/weather-response.interface';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('current')
  @ApiOperation({ summary: 'Obtener el clima actual de una ciudad' })
  @ApiResponse({
    status: 200,
    description: 'Datos del clima actual',
  })
  @ApiResponse({
    status: 404,
    description: 'Ciudad no encontrada',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al consultar el clima',
  })
  async getCurrentWeather(
    @Body() weatherQueryDto: WeatherQueryDto,
  ): Promise<WeatherResponse> {
    return this.weatherService.getCurrentWeather(weatherQueryDto);
  }

  @Post('forecast')
  @ApiOperation({ summary: 'Obtener el pronóstico del clima de una ciudad' })
  @ApiResponse({
    status: 200,
    description: 'Datos del pronóstico del clima',
  })
  @ApiResponse({
    status: 404,
    description: 'Ciudad no encontrada',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al consultar el pronóstico',
  })
  async getForecast(
    @Body() weatherQueryDto: WeatherQueryDto,
  ): Promise<WeatherResponse> {
    return this.weatherService.getForecast(weatherQueryDto);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Obtener consultas recientes del clima' })
  @ApiResponse({
    status: 200,
    description: 'Lista de consultas recientes',
    type: [WeatherQuery],
  })
  async getRecentQueries(
    @Query('limit') limit?: number,
  ): Promise<WeatherQuery[]> {
    return this.weatherService.getRecentQueries(limit);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener consultas del clima del usuario actual' })
  @ApiResponse({
    status: 200,
    description: 'Lista de consultas del usuario',
    type: [WeatherQuery],
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async getUserQueries(
    @Request() req: RequestWithUser,
    @Query('limit') limit?: number,
  ): Promise<WeatherQuery[]> {
    return this.weatherService.getUserQueries(req.user.id, limit);
  }

  @Post('auth/current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener el clima actual (autenticado)' })
  async getCurrentWeatherAuth(
    @Request() req: RequestWithUser,
    @Body() weatherQueryDto: WeatherQueryDto,
  ): Promise<WeatherResponse> {
    return this.weatherService.getCurrentWeather(weatherQueryDto, req.user.id);
  }

  @Post('auth/forecast')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener el pronóstico del clima (autenticado)' })
  async getForecastAuth(
    @Request() req: RequestWithUser,
    @Body() weatherQueryDto: WeatherQueryDto,
  ): Promise<WeatherResponse> {
    return this.weatherService.getForecast(weatherQueryDto, req.user.id);
  }
}
