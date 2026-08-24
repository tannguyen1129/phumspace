import { Module } from "@nestjs/common";
import { IdentityController } from "./interface/identity.controller";
import { AuthService } from "./application/auth.service";
import { PasswordService } from "./application/password.service";
import { TokenService } from "./application/token.service";
import { UsersRepository } from "./infrastructure/users.repository";
import { RefreshTokensRepository } from "./infrastructure/refresh-tokens.repository";
import { EmailVerificationTokensRepository } from "./infrastructure/email-verification-tokens.repository";
import { PasswordResetTokensRepository } from "./infrastructure/password-reset-tokens.repository";
import { EmailDeliveryService } from "./application/email-delivery.service";
import { MfaService } from "./application/mfa.service";

/**
 * IdentityModule — Identity & Access (SRS nhom IAM). Moi module khac phu thuoc module nay
 * qua JwtAuthGuard/RolesGuard (common/auth) de hien thuc account-required — khong import
 * truc tiep UsersRepository tu module ngoai identity.
 */
@Module({
  controllers: [IdentityController],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    UsersRepository,
    RefreshTokensRepository,
    EmailVerificationTokensRepository,
    PasswordResetTokensRepository,
    EmailDeliveryService,
    MfaService,
  ],
  exports: [AuthService, EmailDeliveryService],
})
export class IdentityModule {}
