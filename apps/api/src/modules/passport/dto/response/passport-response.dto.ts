import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PassportActivityContract,
  PassportAchievementContract,
  PassportSummaryContract,
  PassportSessionResponseContract,
} from '@phumspace/contracts';

export class PassportActivityDto implements PassportActivityContract {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  id!: string;

  @ApiProperty({ example: 'QUIZ_COMPLETED' })
  activityType!: string;

  @ApiProperty({ example: 'QUIZ_ATTEMPT' })
  sourceType!: string;

  @ApiProperty({ example: 'attempt-123' })
  sourceId!: string;

  @ApiProperty({ example: 10 })
  pointsAwarded!: number;

  @ApiProperty({ example: '2026-08-01T20:00:00.000Z' })
  occurredAt!: string;
}

export class PassportAchievementDto implements PassportAchievementContract {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  id!: string;

  @ApiProperty({ example: 'FIRST_DISCOVERY' })
  code!: string;

  @ApiProperty({ example: 'Khám phá Đầu tiên' })
  title!: string;

  @ApiProperty({ example: 'Nhận diện thành công một di sản văn hóa bằng công cụ AI Cultural Scanner.' })
  description!: string;

  @ApiProperty({ example: 'Sparkles' })
  iconKey!: string;

  @ApiProperty({ example: true })
  isEarned!: boolean;

  @ApiPropertyOptional({ example: '2026-08-01T20:05:00.000Z' })
  earnedAt?: string;
}

export class PassportSummaryDto implements PassportSummaryContract {
  @ApiProperty({ example: 45 })
  totalPoints!: number;

  @ApiProperty({ example: 3 })
  activityCount!: number;

  @ApiProperty({ example: 2 })
  achievementCount!: number;

  @ApiProperty({ type: [PassportActivityDto] })
  recentActivities!: PassportActivityDto[];

  @ApiProperty({ type: [PassportAchievementDto] })
  earnedAchievements!: PassportAchievementDto[];

  @ApiProperty({ example: '2026-08-01T20:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-08-01T20:05:00.000Z' })
  lastActivityAt!: string;
}

export class PassportSessionResponseDto implements PassportSessionResponseContract {
  @ApiProperty({ example: 'SUCCESS' })
  status!: string;

  @ApiProperty({ example: 'Guest session created or restored successfully' })
  message!: string;
}
