export interface PassportActivityContract {
  id: string;
  activityType: string;
  sourceType: string;
  sourceId: string;
  pointsAwarded: number;
  occurredAt: string;
}

export interface PassportAchievementContract {
  id: string;
  code: string;
  title: string;
  description: string;
  iconKey: string;
  isEarned: boolean;
  earnedAt?: string;
}

export interface PassportSummaryContract {
  totalPoints: number;
  activityCount: number;
  achievementCount: number;
  recentActivities: PassportActivityContract[];
  earnedAchievements: PassportAchievementContract[];
  createdAt: string;
  lastActivityAt: string;
}

export interface PassportSessionResponseContract {
  status: string;
  message: string;
}

export interface PassportErrorContract {
  errorCode:
    | 'PASSPORT_SESSION_REQUIRED'
    | 'PASSPORT_SESSION_INVALID'
    | 'PASSPORT_SESSION_EXPIRED'
    | 'PASSPORT_NOT_FOUND'
    | 'PASSPORT_ACTIVITY_DUPLICATE'
    | 'PASSPORT_REWARD_FAILED';
  message: string;
  timestamp: string;
}
