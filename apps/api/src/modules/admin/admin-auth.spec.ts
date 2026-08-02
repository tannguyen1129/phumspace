import { Test, TestingModule } from '@nestjs/testing';
import { AdminAuthService } from './services/admin-auth.service';
import { GoogleIdTokenVerifier } from './services/google-id-token.verifier';
import { StaffUserRepository } from './repositories/staff-user.repository';
import { StaffSessionRepository } from './repositories/staff-session.repository';
import { StaffStatus, StaffRole } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';

describe('Staff Authentication & RBAC System (Sprint 6B.1 Tests)', () => {
  let adminAuthService: AdminAuthService;

  const mockActiveStaff = {
    id: 'staff-111',
    email: 'reviewer.test@phumspace.vn',
    displayName: 'Reviewer Test',
    status: StaffStatus.ACTIVE,
    roles: [{ role: StaffRole.REVIEWER }],
    lastLoginAt: new Date(),
  };

  const mockAdminStaff = {
    id: 'staff-222',
    email: 'admin.test@phumspace.vn',
    displayName: 'Admin Test',
    status: StaffStatus.ACTIVE,
    roles: [{ role: StaffRole.ADMIN }],
    lastLoginAt: new Date(),
  };

  const mockSuspendedStaff = {
    id: 'staff-333',
    email: 'suspended.test@phumspace.vn',
    displayName: 'Suspended Test',
    status: StaffStatus.SUSPENDED,
    roles: [{ role: StaffRole.REVIEWER }],
    lastLoginAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAuthService,
        GoogleIdTokenVerifier,
        {
          provide: StaffUserRepository,
          useValue: {
            findByEmail: jest.fn().mockImplementation((email: string) => {
              if (email === 'reviewer.test@phumspace.vn') return Promise.resolve(mockActiveStaff);
              if (email === 'admin.test@phumspace.vn') return Promise.resolve(mockAdminStaff);
              if (email === 'suspended.test@phumspace.vn') return Promise.resolve(mockSuspendedStaff);
              return Promise.resolve(null);
            }),
            updateLastLogin: jest.fn().mockResolvedValue(undefined),
            logSecurityEvent: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: StaffSessionRepository,
          useValue: {
            createSession: jest.fn().mockResolvedValue({ id: 'session-1' }),
            findActiveSessionByTokenHash: jest.fn().mockResolvedValue({
              id: 'session-1',
              expiresAt: new Date(Date.now() + 3600000),
              staffUser: mockActiveStaff,
            }),
            revokeSessionByTokenHash: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    adminAuthService = module.get<AdminAuthService>(AdminAuthService);
  });

  it('1. Unprovisioned Google Sign-In email should throw ForbiddenException (ADMIN_STAFF_NOT_PROVISIONED)', async () => {
    await expect(
      adminAuthService.loginWithGoogle('mock-google-id-token-unprovisioned@gmail.com'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('2. Suspended StaffUser login attempt should throw ForbiddenException (ADMIN_STAFF_SUSPENDED)', async () => {
    await expect(
      adminAuthService.loginWithGoogle('mock-google-id-token-suspended.test@phumspace.vn'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('3. Provisioned Active StaffUser login should succeed and return rawToken', async () => {
    const result = await adminAuthService.loginWithGoogle(
      'mock-google-id-token-reviewer.test@phumspace.vn',
    );

    expect(result.rawToken).toBeDefined();
    expect(result.rawToken).toHaveLength(64);
    expect(result.staff.id).toBe('staff-111');
  });

  it('4. Public StaffProfileDto should not leak tokenHash or internal subject', () => {
    const mockSession = {
      id: 'session-1',
      expiresAt: new Date('2026-08-02T18:00:00.000Z'),
      staffUser: mockActiveStaff,
    };

    const profile = adminAuthService.toStaffProfileDto(mockSession);

    expect(profile.email).toBe('reviewer.test@phumspace.vn');
    expect(profile.roles).toEqual(['REVIEWER']);

    const jsonString = JSON.stringify(profile);
    expect(jsonString).not.toContain('tokenHash');
    expect(jsonString).not.toContain('externalSubject');
  });
});
