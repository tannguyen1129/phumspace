import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class StaffUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<any | null> {
    return this.prisma.staffUser.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        roles: true,
      },
    });
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.staffUser.findUnique({
      where: { id },
      include: {
        roles: true,
      },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.staffUser.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async logSecurityEvent(data: {
    staffUserId?: string;
    eventType: any;
    outcome: string;
    metadata?: any;
  }): Promise<void> {
    await this.prisma.staffSecurityEvent.create({
      data: {
        staffUserId: data.staffUserId,
        eventType: data.eventType,
        outcome: data.outcome,
        metadata: data.metadata,
      },
    });
  }
}
