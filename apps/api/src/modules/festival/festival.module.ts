import { Module } from "@nestjs/common";
import { PhumDataModule } from "../phumdata/phumdata.module";
import { NotificationModule } from "../notification/notification.module";
import { OrganizationModule } from "../organization/organization.module";
import { FestivalController } from "./interface/festival.controller";
import { FestivalService } from "./application/festival.service";
import { FestivalsRepository } from "./infrastructure/festivals.repository";
import { FestivalOccurrencesRepository } from "./infrastructure/festival-occurrences.repository";
import { FestivalEventsRepository } from "./infrastructure/festival-events.repository";
import { FestivalFacilitiesRepository } from "./infrastructure/festival-facilities.repository";
import { BoatTeamsRepository } from "./infrastructure/boat-teams.repository";

/**
 * FestivalModule — Festival Mode day du (FR-FES-001..007). Import PhumDataModule (facade) de
 * tao/doc entity giong pattern DiscoveryModule tu M2; NotificationModule de broadcast thay doi
 * lich/khan cap cho nguoi theo doi (FR-FES-003/005/006); OrganizationModule de kiem tra quyen
 * quan ly le hoi thuoc to chuc nao (khong dong truc tiep repository cua 2 module kia).
 */
@Module({
  imports: [PhumDataModule, NotificationModule, OrganizationModule],
  controllers: [FestivalController],
  providers: [
    FestivalService,
    FestivalsRepository,
    FestivalOccurrencesRepository,
    FestivalEventsRepository,
    FestivalFacilitiesRepository,
    BoatTeamsRepository,
  ],
  exports: [FestivalService],
})
export class FestivalModule {}
