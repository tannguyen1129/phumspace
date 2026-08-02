import { Test, TestingModule } from '@nestjs/testing';
import { ConsentGateService } from './services/consent-gate.service';
import { AdminModerationService } from './services/admin-moderation.service';
import { ModerationRepository } from './repositories/moderation.repository';
import { StaffUserRepository } from './repositories/staff-user.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { PassportService } from '../passport/services/passport.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { ContributionStatus } from '@prisma/client';

describe('Admin Moderation, Verification & Publication Workflow (Sprint 6B.2 Tests)', () => {
  let consentGate: ConsentGateService;
  let moderationService: AdminModerationService;

  const mockValidConsent = {
    consentVersion: '1.0.0',
    contributorOwnsRights: true,
    allowPublicDisplay: true,
    allowEducationalUse: true,
    allowResearchUse: true,
    allowCommercialUse: false,
    allowAiProcessing: false,
    attributionPreference: 'COMMUNITY',
  };

  const mockInvalidConsent = {
    ...mockValidConsent,
    allowPublicDisplay: false,
  };

  const mockContribution = {
    id: 'contrib-123',
    publicId: 'pub-123',
    status: ContributionStatus.UNDER_REVIEW,
    version: 1,
    title: 'Bản khắc chữ Khmer',
    description: 'Bản ghi chép nội dung văn bia cổ.',
    consent: mockValidConsent,
    media: [],
    reviews: [],
    statusHistory: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsentGateService,
        AdminModerationService,
        {
          provide: ModerationRepository,
          useValue: {
            findByPublicId: jest.fn().mockImplementation((publicId: string) => {
              if (publicId === 'pub-123') return Promise.resolve(mockContribution);
              if (publicId === 'pub-invalid-consent')
                return Promise.resolve({ ...mockContribution, consent: mockInvalidConsent });
              return Promise.resolve(null);
            }),
            findMany: jest.fn().mockResolvedValue({ data: [mockContribution], total: 1 }),
            assignReview: jest.fn().mockResolvedValue(undefined),
            releaseReview: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: StaffUserRepository,
          useValue: {
            logSecurityEvent: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn().mockImplementation((cb) => cb({
              communityContribution: { update: jest.fn().mockResolvedValue(mockContribution) },
              contributionStatusHistory: { create: jest.fn().mockResolvedValue({}) },
              contributionReview: { create: jest.fn().mockResolvedValue({}) },
            })),
          },
        },
        {
          provide: PassportService,
          useValue: {
            recordActivity: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    consentGate = module.get<ConsentGateService>(ConsentGateService);
    moderationService = module.get<AdminModerationService>(AdminModerationService);
  });

  it('1. ConsentGateService should throw BadRequestException if allowPublicDisplay is false', () => {
    expect(() => consentGate.validateConsentGate(mockInvalidConsent)).toThrow(BadRequestException);
  });

  it('2. ConsentGateService should pass if all required consents are valid', () => {
    expect(() => consentGate.validateConsentGate(mockValidConsent)).not.toThrow();
  });

  it('3. AdminModerationService should throw ConflictException if optimistic lock version mismatch', async () => {
    const mockStaffUser = { id: 'staff-1', email: 'editor@phumspace.vn' };

    await expect(
      moderationService.approveContribution(
        'pub-123',
        { version: 99 }, // Mismatched version!
        mockStaffUser,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('4. AdminModerationService approveContribution should check ConsentGate and pass', async () => {
    const mockStaffUser = { id: 'staff-1', email: 'editor@phumspace.vn' };

    await expect(
      moderationService.approveContribution('pub-123', { version: 1 }, mockStaffUser),
    ).resolves.not.toThrow();
  });
});
