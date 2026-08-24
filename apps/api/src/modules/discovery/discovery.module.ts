import { Module } from "@nestjs/common";
import { PhumDataModule } from "../phumdata/phumdata.module";
import { DiscoveryController } from "./interface/discovery.controller";
import { DiscoveryService } from "./application/discovery.service";
import { PlacesRepository } from "./infrastructure/places.repository";

/**
 * DiscoveryModule — Map & Discovery (dia diem, nearby discovery, practical info, etiquette).
 * Import PhumDataModule de tai su dung PhumDataService cho viec tao/publish entity — tranh
 * trung lap logic provenance/version giua hai module (xem application/discovery.service.ts).
 */
@Module({
  imports: [PhumDataModule],
  controllers: [DiscoveryController],
  providers: [DiscoveryService, PlacesRepository],
  exports: [DiscoveryService],
})
export class DiscoveryModule {}
