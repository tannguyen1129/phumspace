import { Module } from "@nestjs/common";
import { IdentityModule } from "../identity/identity.module";
import { PhumDataModule } from "../phumdata/phumdata.module";
import { HandbookModule } from "../handbook/handbook.module";
import { ScannerModule } from "../scanner/scanner.module";
import { ContributionModule } from "../contribution/contribution.module";
import { PersonalizationController } from "./interface/personalization.controller";
import { PersonalizationService } from "./application/personalization.service";
import { SavedItemsRepository } from "./infrastructure/saved-items.repository";
import { PrivacyRequestsRepository } from "./infrastructure/privacy-requests.repository";

/**
 * PersonalizationModule — Saved/History/Preferences/Export/Delete (SRS muc 7.3).
 * Chi so huu schema experience.saved_items; moi thao tac tren du lieu cua module khac deu
 * qua facade (IdentityModule/PhumDataModule/HandbookModule/ScannerModule/ContributionModule
 * deu da export service tuong ung) — dung nguyen tac cross-module trong System Design ADR-001.
 */
@Module({
  imports: [IdentityModule, PhumDataModule, HandbookModule, ScannerModule, ContributionModule],
  controllers: [PersonalizationController],
  providers: [PersonalizationService, SavedItemsRepository, PrivacyRequestsRepository],
})
export class PersonalizationModule {}
