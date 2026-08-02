import { Test, TestingModule } from '@nestjs/testing';
import { HandbookProgressService } from './services/handbook-progress.service';
import { HandbookProgressRepository } from './repositories/handbook-progress.repository';
import { HandbookRepository } from './repositories/handbook.repository';
import { PassportService } from '../passport/services/passport.service';
import { PublicationStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

const TermLearningStatus = {
  NEW: 'NEW',
  LEARNING: 'LEARNING',
  LEARNED: 'LEARNED',
} as const;

describe('HandbookProgressService (Sprint 7B & 8A Tests)', () => {
  let service: HandbookProgressService;
  let progressRepo: HandbookProgressRepository;
  let passportService: PassportService;

  const mockPassportId = 'passport-1111-2222';
  const mockTermId = 'term-wat-chua';
  const mockCollectionId = 'col-nhap-mon';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandbookProgressService,
        {
          provide: HandbookProgressRepository,
          useValue: {
            findTermProgress: jest.fn().mockResolvedValue(null),
            upsertTermProgress: jest.fn().mockImplementation((passportId, termId, status) =>
              Promise.resolve({
                termId,
                status,
                lastReviewedAt: new Date('2026-08-02T12:00:00.000Z'),
                reviewCount: 1,
              }),
            ),
            findCollectionProgress: jest.fn().mockResolvedValue({
              collectionId: mockCollectionId,
              startedAt: new Date(),
              completedAt: null,
            }),
            countLearnedTermsInCollection: jest.fn().mockResolvedValue(5),
            startCollectionProgress: jest.fn().mockResolvedValue({}),
            completeCollectionProgress: jest.fn().mockResolvedValue({}),
            getOverallProgressSummary: jest.fn().mockResolvedValue({
              learnedCount: 5,
              learningCount: 3,
              completedCollectionsCount: 1,
              recentTerms: [],
            }),
          },
        },
        {
          provide: HandbookRepository,
          useValue: {
            findPublishedTermBySlug: jest.fn().mockImplementation((slug) => {
              if (slug === 'wat-chua' || slug === mockTermId) {
                return Promise.resolve({ id: mockTermId, status: PublicationStatus.PUBLISHED });
              }
              return Promise.resolve(null);
            }),
            findPublishedCollectionBySlug: jest.fn().mockImplementation((slug) => {
              if (slug === mockCollectionId) {
                return Promise.resolve({
                  id: mockCollectionId,
                  status: PublicationStatus.PUBLISHED,
                  items: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }],
                });
              }
              return Promise.resolve(null);
            }),
          },
        },
        {
          provide: PassportService,
          useValue: {
            recordActivity: jest.fn().mockResolvedValue({ pointsAwarded: 20 }),
          },
        },
      ],
    }).compile();

    service = module.get<HandbookProgressService>(HandbookProgressService);
    progressRepo = module.get<HandbookProgressRepository>(HandbookProgressRepository);
    passportService = module.get<PassportService>(PassportService);
  });

  it('1. updateTermProgress should successfully transition status to LEARNED', async () => {
    const res = await service.updateTermProgress(mockPassportId, mockTermId, 'LEARNED');
    expect(res.status).toBe(TermLearningStatus.LEARNED);
    expect(res.reviewCount).toBe(1);
  });

  it('2. updateTermProgress should reject invalid status string', async () => {
    await expect(
      service.updateTermProgress(mockPassportId, mockTermId, 'INVALID_STATUS'),
    ).rejects.toThrow(BadRequestException);
  });

  it('3. completeCollection should verify 100% learned terms and reward +20pt to Passport', async () => {
    const res = await service.completeCollection(mockPassportId, mockCollectionId);
    expect(res.status).toBe('SUCCESS');
    expect(res.pointsAwarded).toBe(20);
    expect(passportService.recordActivity).toHaveBeenCalledWith(
      mockPassportId,
      expect.objectContaining({
        pointsAwarded: 20,
        idempotencyKey: `collection_${mockCollectionId}_COMPLETE`,
      }),
    );
  });

  it('4. completeCollection should throw error if learned terms count is less than total', async () => {
    jest.spyOn(progressRepo, 'countLearnedTermsInCollection').mockResolvedValueOnce(2); // Only 2 out of 5 learned
    await expect(service.completeCollection(mockPassportId, mockCollectionId)).rejects.toThrow(
      BadRequestException,
    );
  });
});
