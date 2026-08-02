import { Module } from '@nestjs/common';
import { ContributionController } from './controllers/contribution.controller';
import { ContributionService } from './services/contribution.service';
import { ContributionMediaService } from './services/contribution-media.service';
import { ContributionRepository } from './repositories/contribution.repository';
import { LocalStorageAdapter } from './adapters/local-storage.adapter';
import { PassportModule } from '../passport/passport.module';

@Module({
  imports: [PassportModule],
  controllers: [ContributionController],
  providers: [
    ContributionService,
    ContributionMediaService,
    ContributionRepository,
    LocalStorageAdapter,
    {
      provide: 'StoragePort',
      useClass: LocalStorageAdapter,
    },
  ],
  exports: [ContributionService, ContributionMediaService],
})
export class ContributionModule {}
