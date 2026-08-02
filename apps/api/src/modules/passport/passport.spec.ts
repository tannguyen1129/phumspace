import { Test, TestingModule } from '@nestjs/testing';
import { PassportService } from './services/passport.service';
import { PassportRewardService } from './services/passport-reward.service';
import { AchievementRuleEngine } from './services/achievement-rule.engine';
import { PassportRepository } from './repositories/passport.repository';
import { AchievementRepository } from './repositories/achievement.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('Phum Passport System (Sprint 5B Tests)', () => {
  let passportService: PassportService;
  let rewardService: PassportRewardService;
  let ruleEngine: AchievementRuleEngine;

  const mockPassport = {
    id: 'passport-111',
    status: 'ACTIVE',
    totalPoints: 0,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    lastActivityAt: new Date('2026-08-01T00:00:00.000Z'),
    activities: [],
    achievements: [],
  };

  const mockPublishedAchievements = [
    {
      id: 'ach-1',
      code: 'FIRST_DISCOVERY',
      title: 'Khám phá Đầu tiên',
      description: 'Nhận diện di sản bằng AI Scanner.',
      iconKey: 'Sparkles',
      status: 'PUBLISHED',
      ruleType: 'SCAN_MATCH_COUNT',
    },
    {
      id: 'ach-2',
      code: 'CULTURAL_LEARNER',
      title: 'Người học Văn hóa',
      description: 'Hoàn thành quiz đầu tiên.',
      iconKey: 'BookOpen',
      status: 'PUBLISHED',
      ruleType: 'QUIZ_COMPLETE_COUNT',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PassportService,
        PassportRewardService,
        AchievementRuleEngine,
        {
          provide: PassportRepository,
          useValue: {
            createPassportWithSession: jest.fn().mockResolvedValue(mockPassport),
            findPassportByTokenHash: jest.fn().mockResolvedValue(mockPassport),
            findPassportById: jest.fn().mockResolvedValue(mockPassport),
            getActivitiesPaginated: jest.fn().mockResolvedValue({ data: [], total: 0 }),
          },
        },
        {
          provide: AchievementRepository,
          useValue: {
            findPublishedAchievements: jest.fn().mockResolvedValue(mockPublishedAchievements),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn().mockImplementation((cb) => cb({
              passport: {
                findUnique: jest.fn().mockResolvedValue(mockPassport),
                update: jest.fn().mockResolvedValue(mockPassport),
              },
              passportActivity: {
                findUnique: jest.fn().mockResolvedValue(null),
                create: jest.fn().mockResolvedValue({ id: 'act-1' }),
              },
              passportAchievement: {
                create: jest.fn().mockResolvedValue({ id: 'pa-1' }),
              },
            })),
          },
        },
      ],
    }).compile();

    passportService = module.get<PassportService>(PassportService);
    rewardService = module.get<PassportRewardService>(PassportRewardService);
    ruleEngine = module.get<AchievementRuleEngine>(AchievementRuleEngine);
  });

  it('1. PassportService createGuestSession should generate opaque token and create session', async () => {
    const result = await passportService.createGuestSession();

    expect(result.rawToken).toBeDefined();
    expect(result.rawToken).toHaveLength(64); // 32 bytes in hex = 64 chars
    expect(result.passport.id).toBe('passport-111');
  });

  it('2. AchievementRuleEngine should evaluate FIRST_DISCOVERY on SCAN_MATCHED activity', () => {
    const passportWithScan = {
      ...mockPassport,
      activities: [{ activityType: 'SCAN_MATCHED' }],
    };

    const eligible = ruleEngine.evaluateEligibleAchievements(
      passportWithScan,
      mockPublishedAchievements,
    );

    expect(eligible).toHaveLength(1);
    expect(eligible[0].code).toBe('FIRST_DISCOVERY');
  });

  it('3. AchievementRuleEngine should evaluate CULTURAL_LEARNER on QUIZ_COMPLETED activity', () => {
    const passportWithQuiz = {
      ...mockPassport,
      activities: [{ activityType: 'QUIZ_COMPLETED' }],
    };

    const eligible = ruleEngine.evaluateEligibleAchievements(
      passportWithQuiz,
      mockPublishedAchievements,
    );

    expect(eligible).toHaveLength(1);
    expect(eligible[0].code).toBe('CULTURAL_LEARNER');
  });

  it('4. PassportSummaryDto should not leak tokenHash or internal secrets', async () => {
    const summary = await passportService.getPassportSummary(mockPassport);

    expect(summary.totalPoints).toBe(0);
    expect(summary.earnedAchievements).toHaveLength(2);

    const jsonString = JSON.stringify(summary);
    expect(jsonString).not.toContain('tokenHash');
    expect(jsonString).not.toContain('ruleConfig');
  });
});
