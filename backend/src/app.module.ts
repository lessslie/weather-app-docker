import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WeatherModule } from './weather/weather.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // 🔧 Configuración de variables de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 🗄️ Configuración de TypeORM + SQLite
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        database: configService.get('DB_DATABASE') || '',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // 🔄 Configuración de Cache básico
    CacheModule.register({
      isGlobal: true,
      ttl: 600, // 10 minutos
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
