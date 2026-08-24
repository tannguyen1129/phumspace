import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import type { FollowTargetType } from "@phumspace/contracts";
import { CurrentUser } from "../../../common/auth/current-user.decorator";
import { JwtAuthGuard, type AuthenticatedUser } from "../../../common/auth/jwt-auth.guard";
import { NotificationService } from "../application/notification.service";
import { FollowTargetDto } from "./dto/follow-target.dto";

/** NotificationController — FR-FES-005 (theo doi + nhan thong bao opt-in, "co cai dat tat/mo"). */
@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get("health")
  health() {
    return { module: "notification", status: "ok" };
  }

  @Post("follow")
  follow(@CurrentUser() currentUser: AuthenticatedUser, @Body() dto: FollowTargetDto) {
    return this.notificationService.follow(currentUser.id, dto.targetType, dto.targetId);
  }

  @Delete("follow/:targetType/:targetId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async unfollow(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("targetType") targetType: FollowTargetType,
    @Param("targetId") targetId: string
  ) {
    await this.notificationService.unfollow(currentUser.id, targetType, targetId);
  }

  @Get("follows")
  listMyFollows(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.notificationService.listMyFollows(currentUser.id);
  }

  @Get()
  listMyNotifications(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.notificationService.listMyNotifications(currentUser.id);
  }

  @Patch(":id/read")
  async markRead(@CurrentUser() currentUser: AuthenticatedUser, @Param("id") id: string) {
    await this.notificationService.markRead(id, currentUser.id);
  }
}
