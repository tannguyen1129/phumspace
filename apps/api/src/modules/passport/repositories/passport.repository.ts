import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PassportActivityType } from '@prisma/client';

@Injectable()
export class PassportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPassportWithSession(tokenHash: string, expiresAt: Date): Promise<any> {
    return this.prisma.passport.create({
      data: {
        sessions: {
          create: {
            tokenHash,
            expiresAt,
          },
        },
      },
      include: {
        sessions: true,
        activities: true,
        achievements: true,
      },
    });
  }

  async findPassportByTokenHash(tokenHash: string): Promise<any | null> {
    const session = await this.prisma.passportSession.findUnique({
      where: { tokenHash },
      include: {
        passport: {
          include: {
            activities: {
              orderBy: { occurredAt: 'desc' },
            },
            achievements: {
              include: {
                achievement: true,
              },
            },
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date() || session.revokedAt) {
      return null;
    }

    // Update lastSeenAt
    await this.prisma.passportSession.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    });

    return session.passport;
  }

  async findPassportById(passportId: string): Promise<any | null> {
    return this.prisma.passport.findUnique({
      where: { id: passportId },
      include: {
        activities: {
          orderBy: { occurredAt: 'desc' },
        },
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    });
  }

  async getActivitiesPaginated(
    passportId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: any[]; total: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.passportActivity.findMany({
        where: { passportId },
        orderBy: { occurredAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.passportActivity.count({
        where: { passportId },
      }),
    ]);

    return { data, total };
  }

  async recordActivity(
    passportId: string,
    data: {
      activityType: PassportActivityType;
      sourceType: string;
      sourceId: string;
      pointsAwarded: number;
      idempotencyKey: string;
    },
  ): Promise<any> {
    const existing = await this.prisma.passportActivity.findUnique({
      where: { idempotencyKey: data.idempotencyKey },
    });
    if (existing) return existing;

    return this.prisma.$transaction(async (tx) => {
      const activity = await tx.passportActivity.create({
        data: {
          passportId,
          activityType: data.activityType,
          sourceType: data.sourceType,
          sourceId: data.sourceId,
          pointsAwarded: data.pointsAwarded,
          idempotencyKey: data.idempotencyKey,
        },
      });

      await tx.passport.update({
        where: { id: passportId },
        data: {
          totalPoints: { increment: data.pointsAwarded },
          lastActivityAt: new Date(),
        },
      });

      return activity;
    });
  }
}
