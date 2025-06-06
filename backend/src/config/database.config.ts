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
    host: dbHost,
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
      },
    };
  }

  return baseConfig;
};
