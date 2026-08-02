import { Module } from '@nestjs/common';
import { PassportController } from './controllers/passport.controller';
import { PassportService } from './services/passport.service';
import { PassportRewardService } from './services/passport-reward.service';
import { AchievementRuleEngine } from './services/achievement-rule.engine';
import { PassportRepository } from './repositories/passport.repository';
import { AchievementRepository } from './repositories/achievement.repository';

@Module({
  controllers: [PassportController],
  providers: [
    PassportService,
    PassportRewardService,
    AchievementRuleEngine,
    PassportRepository,
    AchievementRepository,
  ],
  exports: [PassportService, PassportRewardService, AchievementRuleEngine],
})
export class PassportModule {}
