import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @IsNumber()
  @IsOptional()
  PORT: number;

  @IsString()
  @IsOptional()
  DB_HOST: string;

  @IsNumber()
  @IsOptional()
  DB_PORT: number;

  @IsString()
  @IsOptional()
  DB_USERNAME: string;

  @IsString()
  @IsOptional()
  DB_PASSWORD: string;

  @IsString()
  @IsOptional()
  DB_DATABASE: string;

  @IsString()
  @IsOptional()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  OPENWEATHER_API_KEY: string;

  @IsString()
  @IsOptional()
  CORS_ORIGIN: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    console.error(
      `Error de validación de variables de entorno: ${errors.toString()}`,
    );
    throw new Error(errors.toString());
  }
  return validatedConfig;
}

export function validateEnv(config: Record<string, unknown>) {
  if (config.NODE_ENV === 'production') {
    const requiredVars = [
      'DB_HOST',
      'DB_USERNAME',
      'DB_PASSWORD',
      'DB_DATABASE',
      'JWT_SECRET',
    ];
    const missing = requiredVars.filter((key) => !config[key]);
    if (missing.length > 0) {
      console.warn(`⚠️ Variables de entorno faltantes: ${missing.join(', ')}`);
    }
  }
  return config;
}
