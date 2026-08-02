import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AchievementRepository } from '../repositories/achievement.repository';
import { AchievementRuleEngine } from './achievement-rule.engine';
import { PassportActivityType } from '@prisma/client';

@Injectable()
export class PassportRewardService {
  private readonly logger = new Logger(PassportRewardService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly achievementRepo: AchievementRepository,
    private readonly ruleEngine: AchievementRuleEngine,
  ) {}

  /**
   * Tự động thưởng điểm khi hoàn thành Quiz (Fail-safe, không throw ngoại lệ làm gián đoạn Quiz)
   */
  async rewardQuizAttempt(passportId: string, attempt: any): Promise<void> {
    if (!passportId || !attempt) return;

    try {
      await this.prisma.$transaction(async (tx) => {
        const passport = await tx.passport.findUnique({
          where: { id: passportId },
          include: { activities: true, achievements: true },
        });

        if (!passport) return;

        let totalNewPoints = 0;
        const now = new Date();

        // 1. QUIZ_COMPLETED (+10 pt)
        const keyCompleted = `quiz_attempt_${attempt.id}_QUIZ_COMPLETED`;
        const existsCompleted = await tx.passportActivity.findUnique({
          where: { idempotencyKey: keyCompleted },
        });

        if (!existsCompleted) {
          await tx.passportActivity.create({
            data: {
              passportId,
              activityType: PassportActivityType.QUIZ_COMPLETED,
              sourceType: 'QUIZ_ATTEMPT',
              sourceId: attempt.id,
              pointsAwarded: 10,
              idempotencyKey: keyCompleted,
              occurredAt: now,
            },
          });
          totalNewPoints += 10;
        }

        // 2. QUIZ_PASSED (+20 pt)
        if (attempt.isPassed) {
          const keyPassed = `quiz_attempt_${attempt.id}_QUIZ_PASSED`;
          const existsPassed = await tx.passportActivity.findUnique({
            where: { idempotencyKey: keyPassed },
          });

          if (!existsPassed) {
            await tx.passportActivity.create({
              data: {
                passportId,
                activityType: PassportActivityType.QUIZ_PASSED,
                sourceType: 'QUIZ_ATTEMPT',
                sourceId: attempt.id,
                pointsAwarded: 20,
                idempotencyKey: keyPassed,
                occurredAt: now,
              },
            });
            totalNewPoints += 20;
          }
        }

        // 3. PERFECT_QUIZ (+30 pt)
        if (attempt.percentageScore === 100) {
          const keyPerfect = `quiz_attempt_${attempt.id}_PERFECT_QUIZ`;
          const existsPerfect = await tx.passportActivity.findUnique({
            where: { idempotencyKey: keyPerfect },
          });

          if (!existsPerfect) {
            await tx.passportActivity.create({
              data: {
                passportId,
                activityType: PassportActivityType.PERFECT_QUIZ,
                sourceType: 'QUIZ_ATTEMPT',
                sourceId: attempt.id,
                pointsAwarded: 30,
                idempotencyKey: keyPerfect,
                occurredAt: now,
              },
            });
            totalNewPoints += 30;
          }
        }

        // Update totalPoints
        if (totalNewPoints > 0) {
          await tx.passport.update({
            where: { id: passportId },
            data: {
              totalPoints: { increment: totalNewPoints },
              lastActivityAt: now,
            },
          });
        }

        // Evaluate achievements inside transaction
        const updatedPassport = await tx.passport.findUnique({
          where: { id: passportId },
          include: { activities: true, achievements: true },
        });

        const allPublished = await this.achievementRepo.findPublishedAchievements();
        const eligible = this.ruleEngine.evaluateEligibleAchievements(
          updatedPassport,
          allPublished,
        );

        for (const ach of eligible) {
          await tx.passportAchievement.create({
            data: {
              passportId,
              achievementId: ach.id,
              earnedAt: now,
            },
          });
        }
      });
    } catch (err: any) {
      this.logger.warn(`Fail-safe Passport quiz reward warning: ${err.message}`);
    }
  }

  /**
   * Tự động thưởng điểm khi AI Scan ra kết quả MATCH
   */
  async rewardScanLog(passportId: string, scanId: string, matchedEntityId?: string): Promise<void> {
    if (!passportId || !scanId) return;

    try {
      await this.prisma.$transaction(async (tx) => {
        const passport = await tx.passport.findUnique({
          where: { id: passportId },
          include: { activities: true, achievements: true },
        });

        if (!passport) return;

        const keyScan = `scan_log_${scanId}_SCAN_MATCHED`;
        const existsScan = await tx.passportActivity.findUnique({
          where: { idempotencyKey: keyScan },
        });

        if (existsScan) return;

        const now = new Date();
        await tx.passportActivity.create({
          data: {
            passportId,
            activityType: PassportActivityType.SCAN_MATCHED,
            sourceType: 'SCAN_LOG',
            sourceId: scanId,
            pointsAwarded: 15,
            idempotencyKey: keyScan,
            occurredAt: now,
          },
        });

        await tx.passport.update({
          where: { id: passportId },
          data: {
            totalPoints: { increment: 15 },
            lastActivityAt: now,
          },
        });

        // Evaluate achievements
        const updatedPassport = await tx.passport.findUnique({
          where: { id: passportId },
          include: { activities: true, achievements: true },
        });

        const allPublished = await this.achievementRepo.findPublishedAchievements();
        const eligible = this.ruleEngine.evaluateEligibleAchievements(
          updatedPassport,
          allPublished,
        );

        for (const ach of eligible) {
          await tx.passportAchievement.create({
            data: {
              passportId,
              achievementId: ach.id,
              earnedAt: now,
            },
          });
        }
      });
    } catch (err: any) {
      this.logger.warn(`Fail-safe Passport scan reward warning: ${err.message}`);
    }
  }
}
