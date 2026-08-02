import { Injectable } from '@nestjs/common';
import { StaffSessionRepository } from '../repositories/staff-session.repository';
import { AdminSecuritySessionContract } from '@phumspace/contracts';

@Injectable()
export class AdminStaffService {
  constructor(private readonly staffSessionRepo: StaffSessionRepository) {}

  async getActiveSecuritySessions(): Promise<AdminSecuritySessionContract[]> {
    const sessions = await this.staffSessionRepo.getActiveSessions();

    return sessions.map((s) => ({
      sessionId: s.id,
      staffEmail: s.staffUser.email,
      roles: s.staffUser.roles.map((r: any) => r.role),
      createdAt: s.createdAt.toISOString(),
      lastSeenAt: s.lastSeenAt ? s.lastSeenAt.toISOString() : s.createdAt.toISOString(),
      expiresAt: s.expiresAt.toISOString(),
    }));
  }
}
