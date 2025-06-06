import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class WeatherQueryDto {
  @ApiProperty({ description: 'Nombre de la ciudad', example: 'Buenos Aires' })
  @IsString({ message: 'La ciudad debe ser un texto' })
  @IsNotEmpty({ message: 'La ciudad es obligatoria' })
  city: string;

  @ApiPropertyOptional({
    description: 'Código del país (ISO 3166)',
    example: 'AR',
  })
  @IsString({ message: 'El país debe ser un texto' })
  @IsOptional()
  country?: string;
}
