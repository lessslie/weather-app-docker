import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configuración del prefijo global de la API
  app.setGlobalPrefix('api');

  // Configuración de CORS
  const corsOrigins = configService.get<string>('CORS_ORIGIN')?.split(',') || [
    'http://localhost:5174',
  ];
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Configuración de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Weather API Argentina')
    .setDescription('API para consultar el clima en Argentina')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Iniciar el servidor
  const port = configService.get<number>('PORT') || 8080;
  await app.listen(port);
  console.log(`🚀 Servidor corriendo en: http://localhost:${port}/api`);
  console.log(
    `📚 Documentación disponible en: http://localhost:${port}/api/docs`,
  );
}

bootstrap().catch((err) => {
  console.error('Error al iniciar la aplicación:', err);
  process.exit(1);
});
