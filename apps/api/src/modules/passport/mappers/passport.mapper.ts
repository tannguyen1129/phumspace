import {
  PassportSummaryDto,
  PassportActivityDto,
  PassportAchievementDto,
} from '../dto/response/passport-response.dto';

export class PassportMapper {
  static toPassportSummaryDto(
    passport: any,
    allAchievements: any[],
  ): PassportSummaryDto {
    const activities = (passport.activities || [])
      .sort((a: any, b: any) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .map((act: any) => this.toPassportActivityDto(act));

    const earnedMap = new Map<string, any>();
    (passport.achievements || []).forEach((pa: any) => {
      earnedMap.set(pa.achievementId, pa);
    });

    const mappedAchievements: PassportAchievementDto[] = (allAchievements || []).map(
      (ach: any) => {
        const earned = earnedMap.get(ach.id);
        return {
          id: ach.id,
          code: ach.code,
          title: ach.title,
          description: ach.description,
          iconKey: ach.iconKey,
          isEarned: !!earned,
          earnedAt: earned ? earned.earnedAt.toISOString() : undefined,
        };
      },
    );

    return {
      totalPoints: passport.totalPoints || 0,
      activityCount: passport.activities ? passport.activities.length : 0,
      achievementCount: passport.achievements ? passport.achievements.length : 0,
      recentActivities: activities.slice(0, 5),
      earnedAchievements: mappedAchievements,
      createdAt: passport.createdAt.toISOString(),
      lastActivityAt: passport.lastActivityAt.toISOString(),
    };
  }

  static toPassportActivityDto(activity: any): PassportActivityDto {
    return {
      id: activity.id,
      activityType: activity.activityType,
      sourceType: activity.sourceType,
      sourceId: activity.sourceId,
      pointsAwarded: activity.pointsAwarded,
      occurredAt: activity.occurredAt.toISOString(),
    };
  }
}
