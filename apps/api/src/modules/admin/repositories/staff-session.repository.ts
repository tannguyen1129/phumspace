import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class StaffSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(staffUserId: string, tokenHash: string, expiresAt: Date): Promise<any> {
    return this.prisma.staffSession.create({
      data: {
        staffUserId,
        tokenHash,
        expiresAt,
      },
    });
  }

  async findActiveSessionByTokenHash(tokenHash: string): Promise<any | null> {
    const session = await this.prisma.staffSession.findUnique({
      where: { tokenHash },
      include: {
        staffUser: {
          include: {
            roles: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date() || session.revokedAt) {
      return null;
    }

    // Update lastSeenAt
    await this.prisma.staffSession.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    });

    return session;
  }

  async revokeSessionByTokenHash(tokenHash: string): Promise<void> {
    const session = await this.prisma.staffSession.findUnique({
      where: { tokenHash },
    });

    if (session) {
      await this.prisma.staffSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
    }
  }

  async getActiveSessions(): Promise<any[]> {
    return this.prisma.staffSession.findMany({
      where: {
        expiresAt: { gt: new Date() },
        revokedAt: null,
      },
      include: {
        staffUser: {
          include: { roles: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
