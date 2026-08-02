import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PublicationStatus, TermLearningStatus } from '@prisma/client';

@Injectable()
export class HandbookProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findTermProgress(passportId: string, termId: string): Promise<any | null> {
    return this.prisma.passportTermProgress.findUnique({
      where: {
        passportId_termId: {
          passportId,
          termId,
        },
      },
    });
  }

  async upsertTermProgress(
    passportId: string,
    termId: string,
    status: TermLearningStatus,
  ): Promise<any> {
    const existing = await this.findTermProgress(passportId, termId);

    if (existing) {
      return this.prisma.passportTermProgress.update({
        where: { id: existing.id },
        data: {
          status,
          lastReviewedAt: new Date(),
          learnedAt: status === TermLearningStatus.LEARNED ? new Date() : existing.learnedAt,
          reviewCount: { increment: 1 },
        },
      });
    }

    return this.prisma.passportTermProgress.create({
      data: {
        passportId,
        termId,
        status,
        learnedAt: status === TermLearningStatus.LEARNED ? new Date() : null,
      },
    });
  }

  async findCollectionProgress(passportId: string, collectionId: string): Promise<any | null> {
    return this.prisma.passportCollectionProgress.findUnique({
      where: {
        passportId_collectionId: {
          passportId,
          collectionId,
        },
      },
    });
  }

  async startCollectionProgress(passportId: string, collectionId: string, totalTermCount: number): Promise<any> {
    const existing = await this.findCollectionProgress(passportId, collectionId);
    if (existing) return existing;

    return this.prisma.passportCollectionProgress.create({
      data: {
        passportId,
        collectionId,
        totalTermCountSnapshot: totalTermCount,
        learnedTermCount: 0,
      },
    });
  }

  async updateCollectionLearnedCount(passportId: string, collectionId: string, learnedCount: number): Promise<any> {
    return this.prisma.passportCollectionProgress.update({
      where: {
        passportId_collectionId: {
          passportId,
          collectionId,
        },
      },
      data: {
        learnedTermCount: learnedCount,
      },
    });
  }

  async completeCollectionProgress(passportId: string, collectionId: string): Promise<any> {
    return this.prisma.passportCollectionProgress.update({
      where: {
        passportId_collectionId: {
          passportId,
          collectionId,
        },
      },
      data: {
        completedAt: new Date(),
      },
    });
  }

  async countLearnedTermsInCollection(passportId: string, collectionId: string): Promise<number> {
    return this.prisma.passportTermProgress.count({
      where: {
        passportId,
        status: TermLearningStatus.LEARNED,
        term: {
          collections: {
            some: { collectionId },
          },
          status: PublicationStatus.PUBLISHED,
        },
      },
    });
  }

  async getOverallProgressSummary(passportId: string): Promise<{
    learnedCount: number;
    learningCount: number;
    completedCollectionsCount: number;
    recentTerms: any[];
  }> {
    const [learnedCount, learningCount, completedCollectionsCount, recentTerms] = await Promise.all([
      this.prisma.passportTermProgress.count({
        where: { passportId, status: TermLearningStatus.LEARNED },
      }),
      this.prisma.passportTermProgress.count({
        where: { passportId, status: TermLearningStatus.LEARNING },
      }),
      this.prisma.passportCollectionProgress.count({
        where: { passportId, completedAt: { not: null } },
      }),
      this.prisma.passportTermProgress.findMany({
        where: { passportId },
        take: 10,
        orderBy: { lastReviewedAt: 'desc' },
      }),
    ]);

    return {
      learnedCount,
      learningCount,
      completedCollectionsCount,
      recentTerms,
    };
  }
}
