import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dns from 'dns';

// Configurar DNS para preferir IPv4
dns.setDefaultResultOrder('ipv4first');

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

  // Determinar la dirección IP a usar
  let hostToUse = dbHost;
  
  // Si es Supabase en producción, usar la IP directa para evitar problemas de DNS
  if (isSupabase && isProduction) {
    // IP directa de Supabase (db.tlkeklvtvxzmowaazquc.supabase.co)
    hostToUse = '34.102.136.180';
    console.log(`\n⚠️ Usando IP directa para Supabase: ${hostToUse} (en lugar de ${dbHost})`);
  }

  console.log(
    `\n💾 Conectando a PostgreSQL: ${hostToUse}:${dbPort} como ${dbUsername} a base de datos ${dbDatabase}`,
    sslEnabled ? '(con SSL)' : '(sin SSL)',
    isSupabase ? '[Supabase]' : '',
  );

  // Configuración para Supabase o cualquier otra base de datos PostgreSQL
  const baseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: hostToUse,
    port: dbPort,
    username: dbUsername,
    password: configService.get<string>('DB_PASSWORD'),
    database: dbDatabase,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: isDevelopment, // Solo sincronizar en desarrollo
    logging: isDevelopment,
    retryAttempts: 10,      // Aumentar intentos de reconexión
    retryDelay: 3000,       // 3 segundos entre intentos
    connectTimeoutMS: 10000, // 10 segundos de timeout para conexión
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
        // Aumentar timeouts para entornos de producción
        connectionTimeoutMillis: 10000,
        query_timeout: 10000,
        statement_timeout: 10000,
      },
    };
  }

  return baseConfig;
};
