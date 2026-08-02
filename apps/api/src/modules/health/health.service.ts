import { Injectable } from '@nestjs/common';
import { HealthResponseDto } from './dto/health-response.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  getHealth(): HealthResponseDto {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'phumspace-api',
      version: '0.1.0',
    };
  }

  getLiveness() {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
    };
  }

  async getReadiness() {
    try {
      // Test Database Ping Query
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'READY',
        timestamp: new Date().toISOString(),
        database: 'CONNECTED',
      };
    } catch (e: any) {
      return {
        status: 'NOT_READY',
        timestamp: new Date().toISOString(),
        database: 'DISCONNECTED',
        error: e?.message || 'Database connection error',
      };
    }
  }
}
