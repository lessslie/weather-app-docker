import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  const isDevelopment = nodeEnv === 'development';
  const isProduction = nodeEnv === 'production';
  const isSupabase = configService.get<string>('IS_SUPABASE') === 'true';

  // Mostrar información de conexión para depuración
  const dbHost = configService.get<string>('DB_HOST');
  const dbPort = parseInt(configService.get<string>('DB_PORT') || '5432', 10);
  const dbUsername = configService.get<string>('DB_USERNAME');
  const dbDatabase = configService.get<string>('DB_DATABASE');
  const sslEnabled = isProduction || isSupabase;

  console.log(
    `\n💾 Conectando a PostgreSQL: ${dbHost}:${dbPort} como ${dbUsername} a base de datos ${dbDatabase}`,
    sslEnabled ? '(con SSL)' : '(sin SSL)',
    isSupabase ? '[Supabase]' : '',
  );

  // Configuración para Supabase o cualquier otra base de datos PostgreSQL
  const baseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    // Si es Supabase, usamos la dirección IPv4 directamente para evitar problemas de IPv6
    host: isSupabase ? '34.102.136.180' : dbHost, // IP directa de Supabase
    port: dbPort,
    username: dbUsername,
    password: configService.get<string>('DB_PASSWORD'),
    database: dbDatabase,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: isDevelopment, // Solo sincronizar en desarrollo
    logging: isDevelopment,
  };

  // Agregar configuración SSL para producción o Supabase
  if (sslEnabled) {
    return {
      ...baseConfig,
      ssl: { rejectUnauthorized: false },
      extra: {
        // Opciones adicionales para conexiones SSL
        ssl: {
          rejectUnauthorized: false,
        },
        // Forzar IPv4 para evitar problemas de conectividad
        family: 4,
      },
    };
  }

  return baseConfig;
};
