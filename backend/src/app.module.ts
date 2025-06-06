import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WeatherModule } from './weather/weather.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

// Función para validar las variables de entorno requeridas
function validateEnv(config: Record<string, any>) {
  // En producción, necesitamos estas variables
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
      // No lanzamos error para permitir fallbacks
    }
  }
  return config;
}

@Module({
  imports: [
    // 🔧 Configuración de variables de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv,
    }),

    // 🗄️ Configuración de TypeORM + PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): Record<string, any> => {
        // Determinar el entorno actual
        const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
        const isDevelopment = nodeEnv === 'development';
        const isProduction = nodeEnv === 'production';
        
        // Comprobar si tenemos configuración de PostgreSQL
        const hasPostgresConfig = !!configService.get<string>('DB_HOST');
        
        // Configuración para SQLite (fallback en desarrollo)
        if (isDevelopment && !hasPostgresConfig) {
          console.log('🔄 Usando SQLite como base de datos en desarrollo');
          return {
            type: 'sqlite',
            database: 'weather_app.sqlite',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: true,
          };
        }
        
        // Configuración para PostgreSQL
        console.log(
          `🔄 Conectando a PostgreSQL en ${isProduction ? 'producción' : 'desarrollo'}`,
        );
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: isDevelopment, // Solo sincronizar en desarrollo
          logging: isDevelopment,
          ssl: isProduction, // Habilitar SSL en producción
          extra: isProduction
            ? {
                ssl: {
                  rejectUnauthorized: false, // Necesario para algunos proveedores de DB en la nube
                },
              }
            : {},
        };
      },
      inject: [ConfigService],
    }),

    // 🔄 Configuración de Cache básico
    CacheModule.register({
      isGlobal: true,
      ttl: 600, // 10 minutos
      max: 100, // Máximo número de items en caché
    }),

    // 📦 Módulos de la aplicación
    WeatherModule,
    UsersModule,
    AuthModule, // AuthModule ya incluye todo lo de autenticación
  ],
  controllers: [AppController], // Solo controladores principales
  providers: [AppService], // Solo servicios principales
})
export class AppModule {}
