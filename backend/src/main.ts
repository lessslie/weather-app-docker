import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configuración del prefijo global de la API
  app.setGlobalPrefix('api');

  // Configuración de CORS mejorada
  const corsOrigins: string[] = configService
    .get<string>('CORS_ORIGIN')
    ?.split(',') || ['http://localhost:5174', 'http://localhost:3000'];

  // Función para validar orígenes dinámicamente
  const corsOriginFunction = (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ): void => {
    // Permitir requests sin origin (mobile apps, postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Verificar si el origin está en la lista permitida
    if (corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Permitir dominios de Vercel dinámicamente
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }

    // Permitir localhost en desarrollo
    if (origin.includes('localhost')) {
      return callback(null, true);
    }

    callback(new Error('No permitido por CORS'), false);
  };

  const corsOptions: CorsOptions = {
    origin: process.env.NODE_ENV === 'production' ? corsOriginFunction : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  app.enableCors(corsOptions);

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
    .setTitle('Weather API')
    .setDescription('API para obtener información del clima')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('weather', 'Endpoints relacionados con el clima')
    .addTag('auth', 'Endpoints de autenticación')
    .addTag('users', 'Endpoints de usuarios')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Iniciar el servidor
  const port: number = configService.get<number>('PORT') || 8080;
  await app.listen(port);

  console.log(`🚀 Servidor corriendo en: http://localhost:${port}/api`);
  console.log(
    `📚 Documentación disponible en: http://localhost:${port}/api/docs`,
  );
  console.log(`🌐 CORS configurado para:`, corsOrigins);
  console.log(`🔧 Entorno:`, process.env.NODE_ENV || 'development');
}

bootstrap().catch((err: Error) => {
  console.error('Error al iniciar la aplicación:', err);
  process.exit(1);
});
