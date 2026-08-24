import { Module } from "@nestjs/common";
import { NotificationController } from "./interface/notification.controller";
import { NotificationService } from "./application/notification.service";
import { FollowsRepository } from "./infrastructure/follows.repository";
import { NotificationsRepository } from "./infrastructure/notifications.repository";

/**
 * NotificationModule — theo doi (Festival/Boat team) + thong bao trong ung dung (FR-FES-005/006).
 * Xuat NotificationService de FestivalModule goi qua facade khi broadcast thay doi lich/khan cap.
 */
@Module({
  controllers: [NotificationController],
  providers: [NotificationService, FollowsRepository, NotificationsRepository],
  exports: [NotificationService],
})
export class NotificationModule {}
