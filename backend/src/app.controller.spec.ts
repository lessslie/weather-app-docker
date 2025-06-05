import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return app info', () => {
      const result = appController.getHello() as any;
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('endpoints');
      expect(result.message).toBe('Weather App API');
    });
  });
});
