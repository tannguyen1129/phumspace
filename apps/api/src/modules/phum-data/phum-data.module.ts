import { Module } from '@nestjs/common';
import { HeritageEntityController } from './controllers/heritage-entity.controller';
import { PlaceController } from './controllers/place.controller';
import { CategoryController } from './controllers/category.controller';
import { HeritageEntityService } from './services/heritage-entity.service';
import { PlaceService } from './services/place.service';
import { CategoryService } from './services/category.service';
import { HeritageEntityRepository } from './repositories/heritage-entity.repository';
import { PlaceRepository } from './repositories/place.repository';
import { CategoryRepository } from './repositories/category.repository';

@Module({
  controllers: [
    HeritageEntityController,
    PlaceController,
    CategoryController,
  ],
  providers: [
    HeritageEntityService,
    PlaceService,
    CategoryService,
    HeritageEntityRepository,
    PlaceRepository,
    CategoryRepository,
  ],
  exports: [
    HeritageEntityService,
    PlaceService,
    CategoryService,
  ],
})
export class PhumDataModule {}
