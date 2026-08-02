import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return status ok, service phumspace-api, and a valid ISO timestamp', () => {
      const result = controller.getHealth();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('service', 'phumspace-api');
      expect(result).toHaveProperty('timestamp');
      expect(new Date(result.timestamp).toISOString()).toEqual(result.timestamp);
    });
  });

  describe('getLiveness and getReadiness', () => {
    it('getLiveness should return status UP', () => {
      const result = controller.getLiveness();
      expect(result.status).toBe('UP');
    });

    it('getReadiness should return status READY and database CONNECTED', async () => {
      const result = await controller.getReadiness();
      expect(result.status).toBe('READY');
      expect(result.database).toBe('CONNECTED');
    });
  });
});
