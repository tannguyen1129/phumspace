import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AchievementStatus } from '@prisma/client';

@Injectable()
export class AchievementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPublishedAchievements(): Promise<any[]> {
    return this.prisma.achievement.findMany({
      where: { status: AchievementStatus.PUBLISHED },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findAchievementByCode(code: string): Promise<any | null> {
    return this.prisma.achievement.findFirst({
      where: {
        code,
        status: AchievementStatus.PUBLISHED,
      },
    });
  }
}
