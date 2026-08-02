import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { HandbookProgressRepository } from '../repositories/handbook-progress.repository';
import { HandbookRepository } from '../repositories/handbook.repository';
import { PassportService } from '../../passport/services/passport.service';
import { PublicationStatus, TermLearningStatus, PassportActivityType } from '@prisma/client';

@Injectable()
export class HandbookProgressService {
  constructor(
    private readonly progressRepo: HandbookProgressRepository,
    private readonly handbookRepo: HandbookRepository,
    private readonly passportService: PassportService,
  ) {}

  async getOverallProgress(passportId: string) {
    const summary = await this.progressRepo.getOverallProgressSummary(passportId);
    return {
      totalLearnedTerms: summary.learnedCount,
      totalLearningTerms: summary.learningCount,
      completedCollectionsCount: summary.completedCollectionsCount,
      recentTerms: summary.recentTerms.map((t) => ({
        termId: t.termId,
        status: t.status,
        lastReviewedAt: t.lastReviewedAt.toISOString(),
        reviewCount: t.reviewCount,
      })),
    };
  }

  async getTermProgress(passportId: string, termId: string) {
    const progress = await this.progressRepo.findTermProgress(passportId, termId);
    if (!progress) {
      return {
        termId,
        status: 'NEW',
        lastReviewedAt: new Date().toISOString(),
        reviewCount: 0,
      };
    }
    return {
      termId: progress.termId,
      status: progress.status,
      lastReviewedAt: progress.lastReviewedAt.toISOString(),
      reviewCount: progress.reviewCount,
    };
  }

  async updateTermProgress(passportId: string, termId: string, statusStr: string) {
    let status: TermLearningStatus;
    if (statusStr === 'LEARNING') {
      status = TermLearningStatus.LEARNING;
    } else if (statusStr === 'LEARNED') {
      status = TermLearningStatus.LEARNED;
    } else {
      throw new BadRequestException({
        errorCode: 'HANDBOOK_INVALID_PROGRESS_STATUS',
        message: 'Trạng thái học không hợp lệ. Chỉ chấp nhận "LEARNING" hoặc "LEARNED".',
      });
    }

    // Verify term is PUBLISHED
    const term = await this.handbookRepo.findPublishedTermBySlug(termId);
    let targetTermId = termId;
    if (term) {
      targetTermId = term.id;
    } else {
      // Check by UUID
      const rawTerm = await this.handbookRepo['prisma'].khmerTerm.findUnique({ where: { id: termId } });
      if (!rawTerm || rawTerm.status !== PublicationStatus.PUBLISHED) {
        throw new NotFoundException({
          errorCode: 'HANDBOOK_TERM_NOT_PUBLISHED',
          message: 'Từ vựng không tồn tại hoặc chưa được xuất bản.',
        });
      }
      targetTermId = rawTerm.id;
    }

    const updated = await this.progressRepo.upsertTermProgress(passportId, targetTermId, status);

    return {
      termId: updated.termId,
      status: updated.status,
      lastReviewedAt: updated.lastReviewedAt.toISOString(),
      reviewCount: updated.reviewCount,
    };
  }

  async getCollectionProgress(passportId: string, collectionId: string) {
    const collection = await this.handbookRepo.findPublishedCollectionBySlug(collectionId);
    let targetColId = collectionId;
    let totalTerms = 0;

    if (collection) {
      targetColId = collection.id;
      totalTerms = collection.items?.length || 0;
    } else {
      const rawCol = await this.handbookRepo['prisma'].handbookCollection.findUnique({
        where: { id: collectionId },
        include: { items: { where: { term: { status: PublicationStatus.PUBLISHED } } } },
      });
      if (!rawCol || rawCol.status !== PublicationStatus.PUBLISHED) {
        throw new NotFoundException({
          errorCode: 'HANDBOOK_COLLECTION_NOT_PUBLISHED',
          message: 'Bộ sưu tập không tồn tại hoặc chưa được xuất bản.',
        });
      }
      targetColId = rawCol.id;
      totalTerms = rawCol.items?.length || 0;
    }

    const progress = await this.progressRepo.findCollectionProgress(passportId, targetColId);
    const learnedCount = await this.progressRepo.countLearnedTermsInCollection(passportId, targetColId);

    return {
      collectionId: targetColId,
      learnedTermCount: learnedCount,
      totalTermCount: totalTerms,
      isCompleted: Boolean(progress?.completedAt),
      startedAt: progress?.startedAt ? progress.startedAt.toISOString() : new Date().toISOString(),
      completedAt: progress?.completedAt ? progress.completedAt.toISOString() : undefined,
    };
  }

  async startCollection(passportId: string, collectionId: string) {
    const colProgress = await this.getCollectionProgress(passportId, collectionId);
    await this.progressRepo.startCollectionProgress(passportId, colProgress.collectionId, colProgress.totalTermCount);
    return this.getCollectionProgress(passportId, collectionId);
  }

  async completeCollection(passportId: string, collectionId: string) {
    const colProgress = await this.getCollectionProgress(passportId, collectionId);

    if (colProgress.learnedTermCount < colProgress.totalTermCount || colProgress.totalTermCount === 0) {
      throw new BadRequestException({
        errorCode: 'HANDBOOK_COLLECTION_NOT_COMPLETE',
        message: `Chưa thể hoàn thành bộ sưu tập. Bạn mới học ${colProgress.learnedTermCount}/${colProgress.totalTermCount} từ.`,
      });
    }

    // Mark completed in DB
    await this.progressRepo.completeCollectionProgress(passportId, colProgress.collectionId);

    // Reward +20 points to Guest Passport (Idempotent)
    let pointsAwarded = 0;
    try {
      await this.passportService.recordActivity(passportId, {
        activityType: PassportActivityType.HANDBOOK_COLLECTION_COMPLETED,
        sourceType: 'HANDBOOK_COLLECTION',
        sourceId: colProgress.collectionId,
        pointsAwarded: 20,
        idempotencyKey: `collection_${colProgress.collectionId}_COMPLETE`,
      });
      pointsAwarded = 20;
    } catch {
      // Idempotency duplicate execution ok
      pointsAwarded = 0;
    }

    return {
      status: 'SUCCESS',
      message: 'Chúc mừng bạn đã hoàn thành bộ sưu tập từ vựng Khmer!',
      pointsAwarded,
    };
  }
}
