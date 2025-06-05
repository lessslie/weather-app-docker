import { 
  Controller, 
  Get, 
  Query, 
  HttpCode, 
  HttpStatus,
  Post,
  Body,
  Delete,
  Param
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { GetWeatherDto, WeatherResponseDto } from './dto/weather.dto';
import { CurrentUser, Public } from '../auth/guards/auth.guard';
import { User } from '../users/entities/user.entity';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener clima de una ciudad argentina (Público)',
    description: 'Obtiene información meteorológica actual de una ciudad argentina específica'
  })
  @ApiQuery({
    name: 'city',
    description: 'Nombre de la ciudad argentina',
    example: 'Buenos Aires',
    required: true,
  })
  @ApiQuery({
    name: 'province',
    description: 'Provincia argentina (opcional para mayor precisión)',
    example: 'Buenos Aires',
    required: false,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Información del clima obtenida correctamente',
    type: WeatherResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Parámetros inválidos' })
  @ApiNotFoundResponse({ description: 'Ciudad no encontrada' })
  async getWeather(@Query() getWeatherDto: GetWeatherDto): Promise<WeatherResponseDto> {
    return this.weatherService.getWeatherByCity(getWeatherDto);
  }

  @Get('premium')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Obtener clima con estadísticas de usuario (Premium)',
    description: 'Obtiene clima y cuenta las consultas del usuario autenticado'
  })
  @ApiQuery({
    name: 'city',
    description: 'Nombre de la ciudad argentina',
    example: 'Buenos Aires',
    required: true,
  })
  @ApiQuery({
    name: 'province',
    description: 'Provincia argentina (opcional para mayor precisión)',
    example: 'Buenos Aires',
    required: false,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Información del clima con estadísticas del usuario',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/WeatherResponseDto' },
        {
          type: 'object',
          properties: {
            userStats: {
              type: 'object',
              properties: {
                totalRequests: { type: 'number' },
                requestedBy: { type: 'string' }
              }
            }
          }
        }
      ]
    }
  })
  async getPremiumWeather(
    @Query() getWeatherDto: GetWeatherDto,
    @CurrentUser() user: User
  ): Promise<WeatherResponseDto & { userStats: any }> {
    const result = await this.weatherService.getWeatherByCity(getWeatherDto);
    
    // Incrementar contador de consultas del usuario
    await this.weatherService.incrementUserWeatherRequest(user.id);
    
    return {
      ...result,
      userStats: {
        totalRequests: user.weatherRequestsCount + 1,
        requestedBy: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim()
      }
    };
  }

  @Public()
  @Get('cities/:city')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener clima por parámetro de ruta (Público)',
    description: 'Obtiene información meteorológica usando el nombre de ciudad como parámetro de ruta'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Información del clima obtenida correctamente',
    type: WeatherResponseDto,
  })
  async getWeatherByParam(@Param('city') city: string): Promise<WeatherResponseDto> {
    return this.weatherService.getWeatherByCity({ city });
  }

  @Public()
  @Get('featured')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener clima de ciudades destacadas',
    description: 'Retorna información meteorológica de ciudades argentinas destacadas'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de ciudades con información meteorológica',
    type: [WeatherResponseDto],
  })
  async getFeaturedCities(): Promise<WeatherResponseDto[]> {
    const featuredCities = [
      'Buenos Aires',
      'Córdoba', 
      'Rosario',
      'Mendoza',
      'La Plata',
      'Mar del Plata',
      'Salta',
      'Tucumán'
    ];
    
    const weatherPromises = featuredCities.map(city => 
      this.weatherService.getWeatherByCity({ city })
        .catch(error => {
          console.error(`Error fetching weather for ${city}:`, error);
          return null;
        })
    );

    const results = await Promise.all(weatherPromises);
    return results.filter(result => result !== null);
  }   

  @Public()
  @Post('multiple')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Obtener clima de múltiples ciudades (Público)',
    description: 'Obtiene información meteorológica de varias ciudades argentinas en una sola petición'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Información del clima de múltiples ciudades',
    type: [WeatherResponseDto],
  })
  async getMultipleWeather(
    @Body() body: { cities: string[] }
  ): Promise<WeatherResponseDto[]> {
    return this.weatherService.getWeatherMultipleCities(body.cities);
  }

  @Delete('cache/:city')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Limpiar cache de una ciudad',
    description: 'Elimina los datos en cache de una ciudad específica'
  })
  @ApiResponse({ status: 204, description: 'Cache eliminado correctamente' })
  async clearCache(@Param('city') city: string): Promise<void> {
    await this.weatherService.clearCityCache(city);
  }

  // La implementación duplicada de getFeaturedCities ha sido eliminada
}