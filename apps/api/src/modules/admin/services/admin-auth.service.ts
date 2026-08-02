import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { GoogleIdTokenVerifier } from './google-id-token.verifier';
import { StaffUserRepository } from '../repositories/staff-user.repository';
import { StaffSessionRepository } from '../repositories/staff-session.repository';
import { SecurityEventType, StaffStatus } from '@prisma/client';
import { StaffProfileContract } from '@phumspace/contracts';

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(
    private readonly googleVerifier: GoogleIdTokenVerifier,
    private readonly staffUserRepo: StaffUserRepository,
    private readonly staffSessionRepo: StaffSessionRepository,
  ) {}

  /**
   * Xác minh Google ID Token, kiểm tra tài khoản staff active và tạo phiên Admin Session
   */
  async loginWithGoogle(idToken: string): Promise<{ rawToken: string; staff: any }> {
    // 1. Verify Google ID Token
    let googleUser;
    try {
      googleUser = await this.googleVerifier.verify(idToken);
    } catch (err: any) {
      await this.staffUserRepo.logSecurityEvent({
        eventType: SecurityEventType.LOGIN_FAILED,
        outcome: 'FAILED',
        metadata: { reason: 'Invalid Google ID Token' },
      });
      throw err;
    }

    // 2. Query StaffUser in DB (Allowlist Check)
    const staff = await this.staffUserRepo.findByEmail(googleUser.email);
    if (!staff) {
      await this.staffUserRepo.logSecurityEvent({
        eventType: SecurityEventType.LOGIN_FAILED,
        outcome: 'FAILED',
        metadata: { email: googleUser.email, reason: 'Staff email not provisioned' },
      });
      throw new ForbiddenException({
        errorCode: 'ADMIN_STAFF_NOT_PROVISIONED',
        message: `Tài khoản email Google "${googleUser.email}" chưa được cấp quyền quản trị trên PhumSpace.`,
      });
    }

    // 3. Check Staff Status
    if (staff.status !== StaffStatus.ACTIVE) {
      await this.staffUserRepo.logSecurityEvent({
        staffUserId: staff.id,
        eventType: SecurityEventType.LOGIN_FAILED,
        outcome: 'FAILED',
        metadata: { status: staff.status, reason: 'Staff account suspended or revoked' },
      });
      throw new ForbiddenException({
        errorCode: 'ADMIN_STAFF_SUSPENDED',
        message: 'Tài khoản nhân sự của bạn đang bị đình chỉ hoặc thu hồi quyền truy cập.',
      });
    }

    // 4. Generate opaque crypto-random session token
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const ttlSeconds = parseInt(process.env.ADMIN_SESSION_TTL_SECONDS || '28800', 10);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await this.staffSessionRepo.createSession(staff.id, tokenHash, expiresAt);
    await this.staffUserRepo.updateLastLogin(staff.id);

    // Log success
    await this.staffUserRepo.logSecurityEvent({
      staffUserId: staff.id,
      eventType: SecurityEventType.LOGIN_SUCCESS,
      outcome: 'SUCCESS',
      metadata: { roles: staff.roles.map((r: any) => r.role) },
    });

    return { rawToken, staff };
  }

  /**
   * Đăng xuất và thu hồi phiên session từ rawToken trong cookie
   */
  async logout(rawToken?: string): Promise<void> {
    if (!rawToken) return;
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    await this.staffSessionRepo.revokeSessionByTokenHash(tokenHash);
  }

  /**
   * Tra cứu phiên StaffSession theo rawToken
   */
  async validateRawToken(rawToken: string): Promise<any | null> {
    if (!rawToken) return null;
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    return this.staffSessionRepo.findActiveSessionByTokenHash(tokenHash);
  }

  /**
   * Format hồ sơ staff thành Public StaffProfileContract
   */
  toStaffProfileDto(session: any): StaffProfileContract {
    const staff = session.staffUser;
    return {
      id: staff.id,
      email: staff.email,
      displayName: staff.displayName ?? undefined,
      roles: staff.roles.map((r: any) => r.role),
      sessionExpiresAt: session.expiresAt.toISOString(),
      lastLoginAt: staff.lastLoginAt ? staff.lastLoginAt.toISOString() : undefined,
    };
  }
}
