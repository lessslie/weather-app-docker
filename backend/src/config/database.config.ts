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

  // Log de información de conexión para Supabase
  if (isSupabase && isProduction) {
    console.log(`\n🔗 Conectando al pooler de Supabase: ${dbHost}:${dbPort}`);
  }

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
    synchronize: isDevelopment || isProduction, // Temporalmente para crear tablas
    logging: isDevelopment,
    retryAttempts: 10, // Aumentar intentos de reconexión
    retryDelay: 3000, // 3 segundos entre intentos
    connectTimeoutMS: 10000, // 10 segundos de timeout para conexión
    extra: {
      // FORZAR IPv4 con configuración más específica
      family: 4,
      connectionTimeoutMillis: 10000,
      query_timeout: 10000,
      statement_timeout: 10000,
      // Configuraciones para el pooler de conexiones
      keepAlive: true,
      keepAliveInitialDelayMillis: 0,
      // Configuración de pool para el pooler de Supabase
      max: 20, // Máximo de conexiones en el pool
      idleTimeoutMillis: 30000, // Tiempo de inactividad antes de cerrar conexión
    },
  };

  // Configuración SSL CORREGIDA para Supabase
  if (sslEnabled) {
    return {
      ...baseConfig,
      ssl: {
        rejectUnauthorized: false, // IMPORTANTE: Para Supabase pooler
      },
      extra: {
        ...baseConfig.extra,
        ssl: {
          rejectUnauthorized: false, // También en extra para pg driver
        }
      }
    };
  }

  return baseConfig;
};