import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../../common/auth/current-user.decorator";
import { JwtAuthGuard, type AuthenticatedUser } from "../../../common/auth/jwt-auth.guard";
import { Roles } from "../../../common/auth/roles.decorator";
import { RolesGuard } from "../../../common/auth/roles.guard";
import { ModerationService } from "../application/moderation.service";
import { DecideContributionDto } from "./dto/decide-contribution.dto";

const REVIEWER_ROLES = ["REVIEWER", "PUBLISHER", "SYSTEM_ADMIN"] as const;

/** ModerationController — MOD-001..012. Toan bo endpoint (tru health) chi danh cho Reviewer tro len. */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("moderation")
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get("health")
  health() {
    return { module: "moderation", status: "ok" };
  }

  @Roles(...REVIEWER_ROLES)
  @Get("queue")
  getQueue() {
    return this.moderationService.getQueue();
  }

  @Roles(...REVIEWER_ROLES)
  @Get("contributions/:id")
  getContribution(@Param("id") id: string) {
    return this.moderationService.getContributionForReview(id);
  }

  @Roles(...REVIEWER_ROLES)
  @Post("contributions/:id/decide")
  decide(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: DecideContributionDto
  ) {
    return this.moderationService.decide({
      contributionId: id,
      reviewerId: currentUser.id,
      decision: dto.decision,
      reason: dto.reason,
    });
  }

  @Roles(...REVIEWER_ROLES)
  @Get("contributions/:id/history")
  getHistory(@Param("id") id: string) {
    return this.moderationService.getHistory(id);
  }

  @Roles(...REVIEWER_ROLES)
  @Post("contributions/:id/claim")
  claim(@CurrentUser() user:AuthenticatedUser,@Param("id") id:string){return this.moderationService.claim(id,user.id);}

  @Roles(...REVIEWER_ROLES)
  @Get("contributions/:id/revisions")
  revisions(@Param("id") id:string){return this.moderationService.getRevisions(id);}
}
