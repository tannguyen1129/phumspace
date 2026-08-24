import { Module } from "@nestjs/common";
import { ContributionController } from "./interface/contribution.controller";
import { ContributionService } from "./application/contribution.service";
import { ContributionsRepository } from "./infrastructure/contributions.repository";

/** ContributionModule — CON-001..014. Xuat ContributionService de ModerationModule dung qua facade. */
@Module({
  controllers: [ContributionController],
  providers: [ContributionService, ContributionsRepository],
  exports: [ContributionService],
})
export class ContributionModule {}
