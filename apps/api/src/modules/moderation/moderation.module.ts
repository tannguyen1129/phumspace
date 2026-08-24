import { Module } from "@nestjs/common";
import { ContributionModule } from "../contribution/contribution.module";
import { HandbookModule } from "../handbook/handbook.module";
import { ModerationController } from "./interface/moderation.controller";
import { ModerationService } from "./application/moderation.service";
import { ModerationDecisionsRepository } from "./infrastructure/moderation-decisions.repository";

/**
 * ModerationModule — MOD-001..012. Import ContributionModule (doc/cap nhat trang thai dong gop)
 * va HandbookModule (xuat ban tu vung/audio) qua facade — khong dong bo truc tiep repository.
 */
@Module({
  imports: [ContributionModule, HandbookModule],
  controllers: [ModerationController],
  providers: [ModerationService, ModerationDecisionsRepository],
})
export class ModerationModule {}
