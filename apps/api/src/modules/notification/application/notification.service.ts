import { Injectable } from "@nestjs/common";
import type { FollowTargetType, NotificationPriority } from "@phumspace/contracts";
import { FollowsRepository } from "../infrastructure/follows.repository";
import { NotificationsRepository } from "../infrastructure/notifications.repository";
import type { Follow, Notification } from "../domain/notification";

/**
 * NotificationService — FR-FES-005/006. Chi thong bao trong-ung-dung (in-app, luu vao
 * ops.notifications) — chua co push/email/SMS vi he thong chua co ha tang gui that (dung tinh
 * than "delivery log" cua FR-FES-005 theo nghia list thong bao xem duoc, khong phai push
 * notification cong nghe rieng — xem README muc M10 ve quyet dinh pham vi nay).
 *
 * KHONG co endpoint tao notification tu do cho client — broadcast() chi duoc goi noi bo tu
 * FestivalService (tranh spam ngoai y muon qua API cong khai).
 */
@Injectable()
export class NotificationService {
  constructor(
    private readonly followsRepository: FollowsRepository,
    private readonly notificationsRepository: NotificationsRepository
  ) {}

  async follow(userId: string, targetType: FollowTargetType, targetId: string): Promise<Follow> {
    return this.followsRepository.follow(userId, targetType, targetId);
  }

  async unfollow(userId: string, targetType: FollowTargetType, targetId: string): Promise<void> {
    await this.followsRepository.unfollow(userId, targetType, targetId);
  }

  async isFollowing(userId: string, targetType: FollowTargetType, targetId: string): Promise<boolean> {
    return this.followsRepository.isFollowing(userId, targetType, targetId);
  }

  async listMyFollows(userId: string): Promise<Follow[]> {
    return this.followsRepository.listForUser(userId);
  }

  async listMyNotifications(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.listForUser(userId);
  }

  async markRead(id: string, userId: string): Promise<void> {
    await this.notificationsRepository.markRead(id, userId);
  }

  /** Goi 1 thong bao cho moi nguoi dang theo doi (targetType, targetId) — dung noi bo boi FestivalService. */
  async broadcast(input: {
    targetType: FollowTargetType;
    targetId: string;
    title: string;
    body: string;
    priority?: NotificationPriority;
    expiresAt?: Date;
  }): Promise<number> {
    const followerIds = await this.followsRepository.listFollowerIds(input.targetType, input.targetId);
    return this.notificationsRepository.createMany(followerIds, {
      title: input.title,
      body: input.body,
      priority: input.priority ?? "NORMAL",
      targetType: input.targetType,
      targetId: input.targetId,
      expiresAt: input.expiresAt,
    });
  }
}
