import { Injectable } from '@nestjs/common';

@Injectable()
export class AchievementRuleEngine {
  /**
   * Đánh giá xem Passport có đủ điều kiện mở khóa các huy hiệu hay không
   */
  evaluateEligibleAchievements(
    passport: any,
    allPublishedAchievements: any[],
  ): any[] {
    const earnedSet = new Set(
      (passport.achievements || []).map((pa: any) => pa.achievementId),
    );

    const activities = passport.activities || [];
    const eligible: any[] = [];

    for (const ach of allPublishedAchievements) {
      if (earnedSet.has(ach.id)) {
        continue;
      }

      const isEligible = this.checkRule(ach, activities);
      if (isEligible) {
        eligible.push(ach);
      }
    }

    return eligible;
  }

  private checkRule(achievement: any, activities: any[]): boolean {
    switch (achievement.code) {
      case 'FIRST_DISCOVERY':
        return activities.some((a) => a.activityType === 'SCAN_MATCHED');

      case 'CULTURAL_LEARNER':
        return activities.some((a) => a.activityType === 'QUIZ_COMPLETED');

      case 'QUIZ_ACHIEVER':
        return activities.some((a) => a.activityType === 'QUIZ_PASSED');

      case 'PERFECT_RESULT':
        return activities.some((a) => a.activityType === 'PERFECT_QUIZ');

      default:
        return false;
    }
  }
}
