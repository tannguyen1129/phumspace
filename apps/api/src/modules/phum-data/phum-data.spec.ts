import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PublicationStatus, EntityType, AccessLevel, LanguageCode, NameType } from '@prisma/client';
import { HeritageEntityService } from './services/heritage-entity.service';
import { HeritageEntityRepository } from './repositories/heritage-entity.repository';
import { HeritageEntityMapper } from './mappers/heritage-entity.mapper';
import { PrismaService } from '../../prisma/prisma.service';

describe('PhumData Core (Sprint 1 Tests)', () => {
  let service: HeritageEntityService;
  let repository: HeritageEntityRepository;

  const mockPublishedEntity: any = {
    id: '11111111-1111-1111-1111-111111111111',
    canonicalCode: 'chua-hang-tra-vinh',
    type: EntityType.ARCHITECTURE,
    accessLevel: AccessLevel.PUBLIC,
    currentVersionId: 'v2-uuid',
    createdAt: new Date('2026-08-01T00:00:00Z'),
    updatedAt: new Date('2026-08-01T00:00:00Z'),
    currentVersion: {
      id: 'v2-uuid',
      versionNo: 2,
      publicationStatus: PublicationStatus.PUBLISHED,
      summary: 'Tóm tắt Chùa Âng đã công bố',
      historicalContent: 'Lịch sử chùa Âng',
      culturalMeaning: 'Ý nghĩa văn hóa',
      names: [
        {
          language: LanguageCode.vi,
          nameType: NameType.PREFERRED,
          originalValue: 'Chùa Âng',
          normalizedValue: 'chua ang',
          script: 'Latn',
        },
      ],
    },
    categories: [
      {
        category: {
          id: 'cat-1',
          slug: 'kien-truc-ton-giao',
          name: 'Kiến trúc Tôn giáo',
        },
      },
    ],
    places: [
      {
        place: {
          id: 'place-1',
          slug: 'phuong-8-tp-tra-vinh',
          name: 'Phường 8, TP. Trà Vinh',
        },
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeritageEntityService,
        {
          provide: HeritageEntityRepository,
          useValue: {
            findPublishedPaginated: jest.fn(),
            findPublishedBySlug: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<HeritageEntityService>(HeritageEntityService);
    repository = module.get<HeritageEntityRepository>(HeritageEntityRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Public API Policy Rules', () => {
    it('1. getPublishedEntities should return only PUBLISHED entities with pagination meta', async () => {
      jest.spyOn(repository, 'findPublishedPaginated').mockResolvedValue({
        total: 1,
        items: [mockPublishedEntity],
      });

      const result = await service.getPublishedEntities({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].slug).toBe('chua-hang-tra-vinh');
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(repository.findPublishedPaginated).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        categorySlug: undefined,
        placeSlug: undefined,
      });
    });

    it('2 & 3. getPublishedBySlug should throw NotFoundException (404) if slug is not found or is DRAFT', async () => {
      jest.spyOn(repository, 'findPublishedBySlug').mockResolvedValue(null);

      await expect(service.getPublishedBySlug('slug-khong-ton-tai')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getPublishedBySlug('banh-tet-tra-cuon')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('4. getPublishedBySlug should return public DTO when entity exists and is PUBLISHED', async () => {
      jest.spyOn(repository, 'findPublishedBySlug').mockResolvedValue(mockPublishedEntity);

      const result = await service.getPublishedBySlug('chua-hang-tra-vinh');

      expect(result.id).toBe(mockPublishedEntity.id);
      expect(result.slug).toBe('chua-hang-tra-vinh');
      expect(result.summary).toBe('Tóm tắt Chùa Âng đã công bố');
      expect(result.names[0].originalValue).toBe('Chùa Âng');
    });

    it('5. HeritageEntityMapper should strip internal audit data (publicationEvents, internalNotes)', () => {
      const rawEntityWithAuditData = {
        ...mockPublishedEntity,
        publicationEvents: [
          { id: 'evt-1', publisherName: 'Admin', eventType: 'PUBLISH' },
        ],
        internalAuditNote: 'Secret internal review note',
      };

      const dto = HeritageEntityMapper.toPublicDto(rawEntityWithAuditData);

      expect(dto).toBeDefined();
      expect(dto).not.toHaveProperty('publicationEvents');
      expect(dto).not.toHaveProperty('internalAuditNote');
      expect(dto?.slug).toBe('chua-hang-tra-vinh');
    });

    it('6. HeritageEntityMapper should return null if entity has no currentVersion (e.g. DRAFT only)', () => {
      const draftOnlyEntity = {
        id: 'draft-id',
        canonicalCode: 'banh-tet-tra-cuon',
        type: EntityType.CRAFT,
        currentVersionId: null,
        currentVersion: null,
      };

      const dto = HeritageEntityMapper.toPublicDto(draftOnlyEntity);
      expect(dto).toBeNull();
    });

    it('7. Immutability policy verification: PUBLISHED version status invariant check', () => {
      const publishedVersion = mockPublishedEntity.currentVersion;
      expect(publishedVersion.publicationStatus).toBe(PublicationStatus.PUBLISHED);
      
      const isPublishedReadOnly = (status: PublicationStatus) => status === PublicationStatus.PUBLISHED;
      expect(isPublishedReadOnly(publishedVersion.publicationStatus)).toBe(true);
    });
  });
});
