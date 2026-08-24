import { Module } from "@nestjs/common";
import { PhumDataController } from "./interface/phumdata.controller";
import { PhumDataService } from "./application/phumdata.service";
import { EntitiesRepository } from "./infrastructure/entities.repository";
import { EntityVersionsRepository } from "./infrastructure/entity-versions.repository";
import { TaxonomyRepository } from "./infrastructure/taxonomy.repository";
import { RelationsRepository } from "./infrastructure/relations.repository";
import { SourcesRepository } from "./infrastructure/sources.repository";
import { VersionSourcesRepository } from "./infrastructure/version-sources.repository";

/**
 * PhumDataModule — PhumData Catalog (Heritage Module trong System Design Document).
 * Nguon su that duy nhat cua he thong; Scanner/Handbook/Quiz o cac milestone sau
 * chi doc du lieu PUBLISHED tu day qua PhumDataService, khong truy cap thang repository.
 */
@Module({
  controllers: [PhumDataController],
  providers: [
    PhumDataService,
    EntitiesRepository,
    EntityVersionsRepository,
    TaxonomyRepository,
    RelationsRepository,
    SourcesRepository,
    VersionSourcesRepository,
  ],
  exports: [PhumDataService],
})
export class PhumDataModule {}
