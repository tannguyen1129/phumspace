import { Module } from '@nestjs/common';
import { AdminAuthController } from './controllers/admin-auth.controller';
import { AdminStaffController } from './controllers/admin-staff.controller';
import { AdminModerationController } from './controllers/admin-moderation.controller';

import { AdminAuthService } from './services/admin-auth.service';
import { AdminStaffService } from './services/admin-staff.service';
import { AdminModerationService } from './services/admin-moderation.service';
import { AdminPublicationService } from './services/admin-publication.service';
import { ConsentGateService } from './services/consent-gate.service';
import { GoogleIdTokenVerifier } from './services/google-id-token.verifier';

import { StaffUserRepository } from './repositories/staff-user.repository';
import { StaffSessionRepository } from './repositories/staff-session.repository';
import { ModerationRepository } from './repositories/moderation.repository';

import { AdminSessionGuard } from './guards/admin-session.guard';
import { AdminRolesGuard } from './guards/admin-roles.guard';

import { LocalStorageAdapter } from '../contribution/adapters/local-storage.adapter';
import { PassportModule } from '../passport/passport.module';

@Module({
  imports: [PassportModule],
  controllers: [AdminAuthController, AdminStaffController, AdminModerationController],
  providers: [
    AdminAuthService,
    AdminStaffService,
    AdminModerationService,
    AdminPublicationService,
    ConsentGateService,
    GoogleIdTokenVerifier,
    StaffUserRepository,
    StaffSessionRepository,
    ModerationRepository,
    AdminSessionGuard,
    AdminRolesGuard,
    LocalStorageAdapter,
    {
      provide: 'StoragePort',
      useClass: LocalStorageAdapter,
    },
  ],
  exports: [
    AdminAuthService,
    AdminStaffService,
    AdminModerationService,
    AdminPublicationService,
    AdminSessionGuard,
    AdminRolesGuard,
  ],
})
export class AdminModule {}
