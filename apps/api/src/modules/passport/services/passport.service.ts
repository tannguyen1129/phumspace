import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { PassportRepository } from '../repositories/passport.repository';
import { AchievementRepository } from '../repositories/achievement.repository';
import { PassportMapper } from '../mappers/passport.mapper';
import { PassportSummaryDto, PassportActivityDto } from '../dto/response/passport-response.dto';

@Injectable()
export class PassportService {
  constructor(
    private readonly passportRepo: PassportRepository,
    private readonly achievementRepo: AchievementRepository,
  ) {}

  /**
   * Khởi tạo một phiên Guest Session mới và trả về rawToken để đính kèm cookie HttpOnly
   */
  async createGuestSession(): Promise<{ rawToken: string; passport: any }> {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 ngày

    const passport = await this.passportRepo.createPassportWithSession(tokenHash, expiresAt);

    return { rawToken, passport };
  }

  /**
   * Tra cứu Passport theo rawToken từ cookie HttpOnly
   */
  async getPassportByRawToken(rawToken: string): Promise<any | null> {
    if (!rawToken) return null;
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    return this.passportRepo.findPassportByTokenHash(tokenHash);
  }

  /**
   * Lấy tổng quan Passport summary dạng public DTO
   */
  async getPassportSummary(passport: any): Promise<PassportSummaryDto> {
    const allPublished = await this.achievementRepo.findPublishedAchievements();
    return PassportMapper.toPassportSummaryDto(passport, allPublished);
  }

  /**
   * Lấy lịch sử hoạt động phân trang
   */
  async getActivitiesPaginated(
    passportId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: PassportActivityDto[]; total: number }> {
    const result = await this.passportRepo.getActivitiesPaginated(passportId, page, limit);
    return {
      data: result.data.map((act) => PassportMapper.toPassportActivityDto(act)),
      total: result.total,
    };
  }

  /**
   * Lấy toàn bộ danh sách huy hiệu PUBLISHED kèm trạng thái đã mở khóa
   */
  async getAchievementsStatus(passport: any) {
    const allPublished = await this.achievementRepo.findPublishedAchievements();
    const summary = PassportMapper.toPassportSummaryDto(passport, allPublished);
    return summary.earnedAchievements;
  }

  /**
   * Ghi nhận hoạt động và cộng điểm văn hóa vào Passport
   */
  async recordActivity(
    passportId: string,
    data: {
      activityType: any;
      sourceType: string;
      sourceId: string;
      pointsAwarded: number;
      idempotencyKey: string;
    },
  ) {
    return this.passportRepo.recordActivity(passportId, data);
  }
}
