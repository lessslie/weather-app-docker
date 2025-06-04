import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // 🔒 CORS configurado
   // 🔧 Configuración de CORS para el frontend
   app.enableCors({
    origin: [
      'http://localhost:5173',    // Vite dev server
      'http://localhost:3001',    // Por si cambias el puerto
      'http://localhost:4173',    // Vite preview
      'http://127.0.0.1:5173',   // Variación de localhost
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true, // Para cookies/auth si las necesitas
  });

  // ✅ Prefijo global para todas las rutas
  app.setGlobalPrefix('api/v1');

  // 🔍 Validación global con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 📚 Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Weather API Argentina')
    .setDescription('API del clima para Argentina con datos detallados por provincia')
    .setVersion('1.0')
    .addTag('weather', 'Endpoints relacionados con el clima')
    .addTag('health', 'Health checks de la aplicación')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 🚀 Iniciar servidor
  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  logger.log(`🚀 Aplicación corriendo en: http://localhost:${port}/api/v1`);
  logger.log(`📚 Documentación Swagger: http://localhost:${port}/api/docs`);
  logger.log(`🌍 Ambiente: ${configService.get('NODE_ENV')}`);
}

bootstrap();