import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      message: '🌤️ Weather API Argentina está funcionando correctamente!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.floor(process.uptime()),
    };
  }

  getHealthCheck() {
    return {
      status: 'OK',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      services: {
        database: 'ready', // Cambiaremos a 'connected' después
        cache: 'connected',
        external_api: 'ready',
        openweather_key: process.env.OPENWEATHER_API_KEY
          ? 'configured'
          : 'missing',
      },
      version: '1.0.0',
    };
  }
}
