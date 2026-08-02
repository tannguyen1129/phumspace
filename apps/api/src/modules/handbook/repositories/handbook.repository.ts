import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PublicationStatus } from '@prisma/client';

@Injectable()
export class HandbookRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPublishedTerms(params: {
    q?: string;
    normalizedQ?: string;
    topicSlug?: string;
    collectionSlug?: string;
    partOfSpeech?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      status: PublicationStatus.PUBLISHED,
      currentVersion: {
        publicationStatus: PublicationStatus.PUBLISHED,
      },
    };

    if (params.topicSlug) {
      where.topics = {
        some: {
          topic: { slug: params.topicSlug, status: PublicationStatus.PUBLISHED },
        },
      };
    }

    if (params.collectionSlug) {
      where.collections = {
        some: {
          collection: { slug: params.collectionSlug, status: PublicationStatus.PUBLISHED },
        },
      };
    }

    if (params.q || params.normalizedQ) {
      const searchStr = params.q || '';
      const normStr = params.normalizedQ || searchStr;

      where.currentVersion = {
        publicationStatus: PublicationStatus.PUBLISHED,
        OR: [
          { scriptText: { contains: searchStr } },
          { normalizedScriptText: { contains: normStr } },
          { transliteration: { contains: searchStr, mode: 'insensitive' } },
          { shortDefinitionVi: { contains: searchStr, mode: 'insensitive' } },
          { shortDefinitionEn: { contains: searchStr, mode: 'insensitive' } },
        ],
      };
    }

    if (params.partOfSpeech) {
      where.currentVersion = {
        ...where.currentVersion,
        partOfSpeech: params.partOfSpeech,
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.khmerTerm.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          currentVersion: {
            include: {
              pronunciations: true,
            },
          },
        },
      }),
      this.prisma.khmerTerm.count({ where }),
    ]);

    return { data, total };
  }

  async findPublishedTermBySlug(slug: string): Promise<any | null> {
    return this.prisma.khmerTerm.findFirst({
      where: {
        slug,
        status: PublicationStatus.PUBLISHED,
      },
      include: {
        heritageEntity: true,
        place: true,
        topics: {
          include: { topic: true },
        },
        collections: {
          include: { collection: true },
        },
        currentVersion: {
          include: {
            meanings: {
              include: { sourceResource: true },
              orderBy: { order: 'asc' },
            },
            examples: {
              include: { sourceResource: true },
              orderBy: { order: 'asc' },
            },
            pronunciations: true,
          },
        },
      },
    });
  }

  async findPublishedTopics(): Promise<any[]> {
    return this.prisma.handbookTopic.findMany({
      where: { status: PublicationStatus.PUBLISHED },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            terms: {
              where: {
                term: { status: PublicationStatus.PUBLISHED },
              },
            },
          },
        },
      },
    });
  }

  async findPublishedTopicBySlug(slug: string): Promise<any | null> {
    return this.prisma.handbookTopic.findFirst({
      where: { slug, status: PublicationStatus.PUBLISHED },
      include: {
        terms: {
          where: { term: { status: PublicationStatus.PUBLISHED } },
          include: {
            term: {
              include: {
                currentVersion: {
                  include: { pronunciations: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async findPublishedCollections(): Promise<any[]> {
    return this.prisma.handbookCollection.findMany({
      where: { status: PublicationStatus.PUBLISHED },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            items: {
              where: {
                term: { status: PublicationStatus.PUBLISHED },
              },
            },
          },
        },
      },
    });
  }

  async findPublishedCollectionBySlug(slug: string): Promise<any | null> {
    return this.prisma.handbookCollection.findFirst({
      where: { slug, status: PublicationStatus.PUBLISHED },
      include: {
        items: {
          where: { term: { status: PublicationStatus.PUBLISHED } },
          orderBy: { order: 'asc' },
          include: {
            term: {
              include: {
                currentVersion: {
                  include: { pronunciations: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async findPronunciationById(id: string): Promise<any | null> {
    return this.prisma.khmerPronunciation.findUnique({
      where: { id },
      include: {
        termVersion: true,
      },
    });
  }
}
