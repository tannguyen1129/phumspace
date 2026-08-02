import { Module } from '@nestjs/common';
import { HeritageEntityController } from './controllers/heritage-entity.controller';
import { PlaceController } from './controllers/place.controller';
import { CategoryController } from './controllers/category.controller';
import { MapController } from './controllers/map.controller';
import { HeritageEntityService } from './services/heritage-entity.service';
import { PlaceService } from './services/place.service';
import { CategoryService } from './services/category.service';
import { MapService } from './services/map.service';
import { HeritageEntityRepository } from './repositories/heritage-entity.repository';
import { PlaceRepository } from './repositories/place.repository';
import { CategoryRepository } from './repositories/category.repository';
import { MapRepository } from './repositories/map.repository';

@Module({
  controllers: [
    HeritageEntityController,
    PlaceController,
    CategoryController,
    MapController,
  ],
  providers: [
    HeritageEntityService,
    PlaceService,
    CategoryService,
    MapService,
    HeritageEntityRepository,
    PlaceRepository,
    CategoryRepository,
    MapRepository,
  ],
  exports: [
    HeritageEntityService,
    PlaceService,
    CategoryService,
    MapService,
  ],
})
export class PhumDataModule {}
