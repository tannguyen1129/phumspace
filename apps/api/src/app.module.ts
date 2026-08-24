import { Module } from "@nestjs/common";
import { HealthController } from "./common/health/health.controller";
import { AuthCommonModule } from "./common/auth/auth-common.module";
import { DatabaseModule } from "./common/database/database.module";
import { StorageModule } from "./common/storage/storage.module";
import { QueueModule } from "./common/queue/queue.module";
import { AuditModule } from "./common/audit/audit.module";
import { RateLimitModule } from "./common/rate-limit/rate-limit.module";
import { IdentityModule } from "./modules/identity/identity.module";
import { PhumDataModule } from "./modules/phumdata/phumdata.module";
import { ScannerModule } from "./modules/scanner/scanner.module";
import { DiscoveryModule } from "./modules/discovery/discovery.module";
import { HandbookModule } from "./modules/handbook/handbook.module";
import { OrganizationModule } from "./modules/organization/organization.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { FestivalModule } from "./modules/festival/festival.module";
import { OlympiadModule } from "./modules/olympiad/olympiad.module";
import { PersonalizationModule } from "./modules/personalization/personalization.module";
import { ContributionModule } from "./modules/contribution/contribution.module";
import { ModerationModule } from "./modules/moderation/moderation.module";
import { AdminModule } from "./modules/admin/admin.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";

@Module({
  imports: [
    DatabaseModule,
    StorageModule,
    QueueModule,
    AuditModule,
    RateLimitModule,
    AuthCommonModule,
    IdentityModule,
    PhumDataModule,
    ScannerModule,
    DiscoveryModule,
    HandbookModule,
    OrganizationModule,
    NotificationModule,
    FestivalModule,
    OlympiadModule,
    PersonalizationModule,
    ContributionModule,
    ModerationModule,
    AdminModule,
    AnalyticsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
