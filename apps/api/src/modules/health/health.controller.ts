import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { HealthResponseDto } from './dto/health-response.dto';

@ApiTags('System Observability & Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Basic Health Status Check' })
  getHealth(): HealthResponseDto {
    return this.healthService.getHealth();
  }

  @Get('liveness')
  @ApiOperation({ summary: 'Liveness Probe Check' })
  getLiveness() {
    return this.healthService.getLiveness();
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Readiness Probe Check (PostgreSQL Database Ping)' })
  async getReadiness() {
    return this.healthService.getReadiness();
  }
}
