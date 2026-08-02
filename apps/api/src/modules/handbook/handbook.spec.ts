import { Test, TestingModule } from '@nestjs/testing';
import { HandbookSearchService } from './services/handbook-search.service';
import { PronunciationAccessPolicy } from './services/pronunciation-access.policy';
import { HandbookService } from './services/handbook.service';
import { HandbookRepository } from './repositories/handbook.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PublicationStatus, VerificationOutcome } from '@prisma/client';

describe('Khmer Handbook Core (Sprint 7A Tests)', () => {
  let searchService: HandbookSearchService;
  let accessPolicy: PronunciationAccessPolicy;
  let handbookService: HandbookService;

  const mockPublishedTerm = {
    id: 'term-1',
    slug: 'wat-chua',
    status: PublicationStatus.PUBLISHED,
    createdAt: new Date('2026-08-02T10:00:00.000Z'),
    currentVersion: {
      id: 'version-1',
      versionNo: 1,
      publicationStatus: PublicationStatus.PUBLISHED,
      scriptText: 'វត្ត',
      normalizedScriptText: 'វត្ត',
      shortDefinitionVi: 'Chùa Khmer',
      publishedAt: new Date('2026-08-02T10:00:00.000Z'),
      meanings: [],
      examples: [],
      pronunciations: [
        {
          id: 'pronun-1',
          rightsStatus: 'PUBLIC_ALLOWED',
          verificationStatus: VerificationOutcome.SOURCE_VERIFIED,
          mediaStorageKey: 'sample.mp3',
        },
      ],
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandbookSearchService,
        PronunciationAccessPolicy,
        HandbookService,
        {
          provide: HandbookRepository,
          useValue: {
            findPublishedTerms: jest.fn().mockResolvedValue({ data: [mockPublishedTerm], total: 1 }),
            findPublishedTermBySlug: jest.fn().mockImplementation((slug: string) => {
              if (slug === 'wat-chua') return Promise.resolve(mockPublishedTerm);
              return Promise.resolve(null);
            }),
            findPronunciationById: jest.fn().mockImplementation((id: string) => {
              if (id === 'pronun-1') return Promise.resolve({ ...mockPublishedTerm.currentVersion.pronunciations[0], termVersion: mockPublishedTerm.currentVersion });
              if (id === 'pronun-restricted') return Promise.resolve({ id: 'pronun-restricted', rightsStatus: 'PRIVATE', termVersion: mockPublishedTerm.currentVersion });
              return Promise.resolve(null);
            }),
          },
        },
      ],
    }).compile();

    searchService = module.get<HandbookSearchService>(HandbookSearchService);
    accessPolicy = module.get<PronunciationAccessPolicy>(PronunciationAccessPolicy);
    handbookService = module.get<HandbookService>(HandbookService);
  });

  it('1. HandbookSearchService should remove Zero-Width Space \\u200B and normalize NFC Unicode', () => {
    const rawKhmer = 'វត្ត\u200Bអង្គ';
    const normalized = searchService.normalizeText(rawKhmer);
    expect(normalized).toBe('វត្តអង្គ');
    expect(normalized).not.toContain('\u200B');
  });

  it('2. PronunciationAccessPolicy should allow valid public audio stream', () => {
    const pronunciation = {
      rightsStatus: 'PUBLIC_ALLOWED',
      termVersion: { publicationStatus: PublicationStatus.PUBLISHED },
    };
    expect(() => accessPolicy.validatePublicStreamAccess(pronunciation)).not.toThrow();
  });

  it('3. PronunciationAccessPolicy should block audio if rightsStatus is restricted', () => {
    const restrictedPronunciation = {
      rightsStatus: 'PRIVATE',
      termVersion: { publicationStatus: PublicationStatus.PUBLISHED },
    };
    expect(() => accessPolicy.validatePublicStreamAccess(restrictedPronunciation)).toThrow(ForbiddenException);
  });

  it('4. HandbookService getPublishedTermBySlug should return published term details', async () => {
    const detail = await handbookService.getPublishedTermBySlug('wat-chua');
    expect(detail.slug).toBe('wat-chua');
    expect(detail.scriptText).toBe('វត្ត');
    expect(detail.shortDefinitionVi).toBe('Chùa Khmer');
  });

  it('5. HandbookService getPublishedTermBySlug should throw NotFoundException for invalid slug', async () => {
    await expect(handbookService.getPublishedTermBySlug('invalid-slug')).rejects.toThrow(NotFoundException);
  });
});
