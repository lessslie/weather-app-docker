import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';

export class GetWeatherDto {
  @ApiProperty({
    description: 'Nombre de la ciudad argentina',
    example: 'Buenos Aires',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  city: string;

  @ApiProperty({
    description: 'Provincia argentina (opcional)',
    example: 'Buenos Aires',
    required: false,
  })
  @IsString()
  @IsOptional()
  province?: string;
}

// DTO para respuesta del clima
export class WeatherResponseDto {
  @ApiProperty({ description: 'Nombre de la ciudad', example: 'Buenos Aires' })
  city: string;

  @ApiProperty({ description: 'País', example: 'AR' })
  country: string;

  @ApiProperty({ description: 'Temperatura actual en Celsius', example: 22.5 })
  temperature: number;

  @ApiProperty({ description: 'Sensación térmica en Celsius', example: 25.1 })
  feels_like: number;

  @ApiProperty({ description: 'Temperatura mínima en Celsius', example: 18.3 })
  temp_min: number;

  @ApiProperty({ description: 'Temperatura máxima en Celsius', example: 26.7 })
  temp_max: number;

  @ApiProperty({ description: 'Humedad en porcentaje', example: 65 })
  humidity: number;

  @ApiProperty({ description: 'Presión atmosférica en hPa', example: 1013 })
  pressure: number;

  @ApiProperty({ description: 'Descripción del clima', example: 'Cielo despejado' })
  description: string;

  @ApiProperty({ description: 'Condición principal del clima', example: 'Clear' })
  main: string;

  @ApiProperty({ description: 'Icono del clima', example: '01d' })
  icon: string;

  @ApiProperty({ description: 'Velocidad del viento en m/s', example: 3.2 })
  wind_speed: number;

  @ApiProperty({ description: 'Dirección del viento en grados', example: 180 })
  wind_deg: number;

  @ApiProperty({ description: 'Visibilidad en metros', example: 10000 })
  visibility: number;

  @ApiProperty({ description: 'Timestamp de cuando se obtuvo la información' })
  timestamp: string;
}