import { Test, TestingModule } from '@nestjs/testing';
import { ContributionService } from './services/contribution.service';
import { ContributionMediaService } from './services/contribution-media.service';
import { ContributionStateMachine } from './services/contribution-state.machine';
import { ContributionRepository } from './repositories/contribution.repository';
import { ContributionStatus } from '@prisma/client';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('Community Contribution System (Sprint 6A Tests)', () => {
  let contributionService: ContributionService;

  const mockContribution = {
    id: 'contrib-111',
    publicId: '33333333-3333-3333-3333-333333333333',
    passportId: 'passport-AAA',
    contributionType: 'NEW_HERITAGE_CONTENT',
    status: ContributionStatus.SUBMITTED,
    title: 'Đề xuất thông tin Chùa Âng',
    description: 'Bổ sung thông tin chi tiết về lễ hội Ok Om Bok tại Chùa Âng',
    languageCode: 'vi',
    submittedAt: new Date('2026-08-02T10:00:00.000Z'),
    createdAt: new Date('2026-08-02T09:00:00.000Z'),
    updatedAt: new Date('2026-08-02T10:00:00.000Z'),
    media: [
      {
        id: 'media-1',
        mediaType: 'IMAGE',
        storageKey: 'contrib_secret_uuid.jpg',
        originalFileName: 'tu_lieu.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1024576,
      },
    ],
    consent: {
      consentVersion: '1.0.0',
      contributorOwnsRights: true,
      allowPublicDisplay: true,
      allowEducationalUse: true,
      allowResearchUse: true,
      allowCommercialUse: false,
      allowAiProcessing: false,
      attributionPreference: 'COMMUNITY',
      consentedAt: new Date('2026-08-02T09:00:00.000Z'),
    },
    statusHistory: [
      {
        fromStatus: ContributionStatus.DRAFT,
        toStatus: ContributionStatus.SUBMITTED,
        publicMessage: 'Gửi đóng góp thành công',
        createdAt: new Date('2026-08-02T10:00:00.000Z'),
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContributionService,
        {
          provide: ContributionMediaService,
          useValue: {
            validateAndSaveMedia: jest.fn().mockResolvedValue({
              metadata: {
                storageKey: 'contrib_saved_key.jpg',
                originalFileName: 'saved.jpg',
                mimeType: 'image/jpeg',
                sizeBytes: 500000,
                checksum: 'sha256-hash',
              },
              mediaType: 'IMAGE',
            }),
          },
        },
        {
          provide: ContributionRepository,
          useValue: {
            createContribution: jest.fn().mockResolvedValue(mockContribution),
            findByPublicId: jest.fn().mockResolvedValue(mockContribution),
            findByPassportIdPaginated: jest.fn().mockResolvedValue({ data: [mockContribution], total: 1 }),
            updateContribution: jest.fn().mockResolvedValue(mockContribution),
            transitionStatus: jest.fn().mockResolvedValue({ ...mockContribution, status: ContributionStatus.WITHDRAWN }),
          },
        },
      ],
    }).compile();

    contributionService = module.get<ContributionService>(ContributionService);
  });

  it('1. ContributionStateMachine should correctly validate status transitions', () => {
    expect(ContributionStateMachine.canTransition(ContributionStatus.DRAFT, ContributionStatus.SUBMITTED)).toBe(true);
    expect(ContributionStateMachine.canTransition(ContributionStatus.SUBMITTED, ContributionStatus.WITHDRAWN)).toBe(true);
    expect(ContributionStateMachine.canTransition(ContributionStatus.DRAFT, ContributionStatus.APPROVED)).toBe(false);
    expect(ContributionStateMachine.isGuestAllowedTransition(ContributionStatus.SUBMITTED, ContributionStatus.WITHDRAWN)).toBe(true);
    expect(ContributionStateMachine.isGuestAllowedTransition(ContributionStatus.SUBMITTED, ContributionStatus.APPROVED)).toBe(false);
  });

  it('2. Creating contribution without contributorOwnsRights consent should throw BadRequestException', async () => {
    await expect(
      contributionService.createContribution('passport-AAA', {
        contributionType: 'NEW_HERITAGE_CONTENT' as any,
        title: 'Thử nghiệm',
        description: 'Mô tả',
        consent: { contributorOwnsRights: false } as any,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('3. Passport B attempting to view Passport A contribution should throw ForbiddenException', async () => {
    await expect(
      contributionService.getContributionDetail('33333333-3333-3333-3333-333333333333', 'passport-BBB'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('4. Passport A can withdraw SUBMITTED contribution successfully', async () => {
    const result = await contributionService.withdrawContribution(
      '33333333-3333-3333-3333-333333333333',
      'passport-AAA',
    );

    expect(result.status).toBe(ContributionStatus.WITHDRAWN);
  });

  it('5. Public DTO should not leak internal storage key', async () => {
    const detail = await contributionService.getContributionDetail(
      '33333333-3333-3333-3333-333333333333',
      'passport-AAA',
    );

    expect(detail.media).toHaveLength(1);
    expect(detail.media[0].originalFileName).toBe('tu_lieu.jpg');

    const jsonString = JSON.stringify(detail);
    expect(jsonString).not.toContain('storageKey');
    expect(jsonString).not.toContain('contrib_secret_uuid.jpg');
  });
});
