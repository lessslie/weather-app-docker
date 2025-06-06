import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { WeatherQuery } from './entities/weather-query.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WeatherQuery])],
  controllers: [WeatherController],
  providers: [WeatherService],
  exports: [WeatherService],
})
export class WeatherModule {}
