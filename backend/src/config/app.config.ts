import { ConfigService } from '@nestjs/config';

export const getAppConfig = (configService: ConfigService) => {
  return {
    port: configService.get<number>('PORT') || 8080,
    cors: {
      origin: configService.get<string>('CORS_ORIGIN')?.split(',') || [
        'http://localhost:5174',
      ],
    },
    jwt: {
      secret: configService.get<string>('JWT_SECRET'),
      expiresIn: '1d',
    },
    openWeatherApi: {
      key: configService.get<string>('OPENWEATHER_API_KEY'),
      baseUrl: 'https://api.openweathermap.org/data/2.5',
    },
  };
};
