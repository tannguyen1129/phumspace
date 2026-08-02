import { Module } from '@nestjs/common';
import { HandbookController } from './controllers/handbook.controller';
import { HandbookProgressController } from './controllers/handbook-progress.controller';
import { HandbookService } from './services/handbook.service';
import { HandbookProgressService } from './services/handbook-progress.service';
import { HandbookSearchService } from './services/handbook-search.service';
import { PronunciationAccessPolicy } from './services/pronunciation-access.policy';
import { HandbookRepository } from './repositories/handbook.repository';
import { HandbookProgressRepository } from './repositories/handbook-progress.repository';
import { LocalStorageAdapter } from '../contribution/adapters/local-storage.adapter';
import { PassportModule } from '../passport/passport.module';

@Module({
  imports: [PassportModule],
  controllers: [HandbookController, HandbookProgressController],
  providers: [
    HandbookService,
    HandbookProgressService,
    HandbookSearchService,
    PronunciationAccessPolicy,
    HandbookRepository,
    HandbookProgressRepository,
    LocalStorageAdapter,
    {
      provide: 'StoragePort',
      useClass: LocalStorageAdapter,
    },
  ],
  exports: [HandbookService, HandbookProgressService, HandbookSearchService],
})
export class HandbookModule {}
