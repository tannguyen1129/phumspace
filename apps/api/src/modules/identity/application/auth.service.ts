import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import {
  toPublicUser,
  type AccessibilityPreferences,
  type NotificationPreferences,
  type PublicUser,
  type User,
} from "../domain/user";
import { UsersRepository } from "../infrastructure/users.repository";
import { RefreshTokensRepository } from "../infrastructure/refresh-tokens.repository";
import { EmailVerificationTokensRepository } from "../infrastructure/email-verification-tokens.repository";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";
import { PasswordResetTokensRepository } from "../infrastructure/password-reset-tokens.repository";
import { EmailDeliveryService } from "./email-delivery.service";
import { MfaService } from "./mfa.service";

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResult {
  user: PublicUser;
  tokens: AuthTokens;
  /** Raw token de xac minh email — chi tra ve o dev/staging, chua co email provider that o M1 (xem interface/identity.controller.ts). */
  devEmailVerificationToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly emailVerificationTokensRepository: EmailVerificationTokensRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly passwordResetTokensRepository: PasswordResetTokensRepository,
    private readonly emailDeliveryService: EmailDeliveryService,
    private readonly mfaService: MfaService,
  ) {}

  async register(input: {
    email: string;
    password: string;
    displayName: string;
  }): Promise<RegisterResult> {
    const existing = await this.usersRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictException("Email da duoc su dung.");
    }

    const passwordHash = await this.passwordService.hash(input.password);
    const user = await this.usersRepository.create({
      email: input.email,
      passwordHash,
      displayName: input.displayName,
    });

    const verification = this.tokenService.generateOpaqueToken();
    await this.emailVerificationTokensRepository.create({
      userId: user.id,
      tokenHash: verification.hash,
      expiresAt: this.tokenService.getEmailVerificationExpiry(),
    });
    await this.emailDeliveryService.sendVerification(
      user.email,
      verification.raw,
    );

    const tokens = await this.issueTokens(user);

    return {
      user: toPublicUser(user),
      tokens,
      devEmailVerificationToken: verification.raw,
    };
  }

  async login(input: {
    email: string;
    password: string;
    mfaCode?: string;
  }): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const user = await this.usersRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException("Email hoac mat khau khong dung.");
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw new ForbiddenException(
        "Tai khoan tam khoa do dang nhap sai nhieu lan. Vui long thu lai sau.",
      );
    }

    const passwordValid = await this.passwordService.verify(
      input.password,
      user.passwordHash,
    );
    if (!passwordValid) {
      const attempts = user.failedLoginAttempts + 1;
      const lockUntil =
        attempts >= MAX_FAILED_LOGIN_ATTEMPTS
          ? new Date(Date.now() + LOCK_DURATION_MS)
          : null;
      await this.usersRepository.recordFailedLogin(user.id, lockUntil);
      throw new UnauthorizedException("Email hoac mat khau khong dung.");
    }

    if (user.mfaEnabled) {
      if (!user.mfaSecretEncrypted || !input.mfaCode)
        throw new UnauthorizedException("MFA_REQUIRED");
      if (
        !this.mfaService.verify(
          this.mfaService.decrypt(user.mfaSecretEncrypted),
          input.mfaCode,
        )
      )
        throw new UnauthorizedException("Mã xác thực hai bước không đúng.");
    }

    await this.usersRepository.resetFailedLogins(user.id);
    const tokens = await this.issueTokens(user);
    return { user: toPublicUser(user), tokens };
  }

  async refresh(rawRefreshToken: string): Promise<AuthTokens> {
    const tokenHash = this.tokenService.hashOpaqueToken(rawRefreshToken);
    const record =
      await this.refreshTokensRepository.findValidByHash(tokenHash);
    if (!record) {
      throw new UnauthorizedException(
        "Refresh token khong hop le hoac da het han.",
      );
    }

    const user = await this.usersRepository.findById(record.userId);
    if (!user) {
      throw new UnauthorizedException("Tai khoan khong ton tai.");
    }

    // Rotation: thu hoi token cu truoc khi phat token moi — giam rui ro replay neu token bi lo.
    await this.refreshTokensRepository.revoke(record.id);
    return this.issueTokens(user);
  }

  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = this.tokenService.hashOpaqueToken(rawRefreshToken);
    const record =
      await this.refreshTokensRepository.findValidByHash(tokenHash);
    if (record) {
      await this.refreshTokensRepository.revoke(record.id);
    }
  }

  async verifyEmail(rawToken: string): Promise<void> {
    const tokenHash = this.tokenService.hashOpaqueToken(rawToken);
    const record =
      await this.emailVerificationTokensRepository.findValidByHash(tokenHash);
    if (!record) {
      throw new UnauthorizedException(
        "Ma xac minh khong hop le hoac da het han.",
      );
    }
    await this.emailVerificationTokensRepository.consume(record.id);
    await this.usersRepository.markEmailVerified(record.userId);
  }

  async requestPasswordReset(email: string): Promise<string | undefined> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user || user.deletedAt) return undefined;
    await this.passwordResetTokensRepository.consumeAllForUser(user.id);
    const token = this.tokenService.generateOpaqueToken();
    await this.passwordResetTokensRepository.create({
      userId: user.id,
      tokenHash: token.hash,
      expiresAt: this.tokenService.getPasswordResetExpiry(),
    });
    await this.emailDeliveryService.sendPasswordReset(user.email, token.raw);
    return token.raw;
  }

  async resendEmailVerification(userId: string): Promise<string | undefined> {
    const user = await this.usersRepository.findById(userId);
    if (!user || user.deletedAt || user.emailVerifiedAt) return undefined;
    await this.emailVerificationTokensRepository.consumeAllForUser(user.id);
    const token = this.tokenService.generateOpaqueToken();
    await this.emailVerificationTokensRepository.create({
      userId: user.id,
      tokenHash: token.hash,
      expiresAt: this.tokenService.getEmailVerificationExpiry(),
    });
    await this.emailDeliveryService.sendVerification(user.email, token.raw);
    return token.raw;
  }

  async resetPassword(rawToken: string, password: string): Promise<void> {
    const token = await this.passwordResetTokensRepository.findValidByHash(
      this.tokenService.hashOpaqueToken(rawToken),
    );
    if (!token)
      throw new UnauthorizedException(
        "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
      );
    await this.usersRepository.updatePassword(
      token.userId,
      await this.passwordService.hash(password),
    );
    await this.passwordResetTokensRepository.consumeAllForUser(token.userId);
    await this.refreshTokensRepository.revokeAllForUser(token.userId);
  }

  async setupMfa(
    userId: string,
  ): Promise<{ secret: string; provisioningUri: string }> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new UnauthorizedException("Tài khoản không tồn tại.");
    const secret = this.mfaService.generateSecret();
    await this.usersRepository.setMfa(
      user.id,
      this.mfaService.encrypt(secret),
      false,
    );
    return {
      secret,
      provisioningUri: this.mfaService.provisioningUri(user.email, secret),
    };
  }

  async enableMfa(userId: string, code: string): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (
      !user?.mfaSecretEncrypted ||
      !this.mfaService.verify(
        this.mfaService.decrypt(user.mfaSecretEncrypted),
        code,
      )
    )
      throw new UnauthorizedException("Mã xác thực không đúng.");
    await this.usersRepository.setMfa(user.id, user.mfaSecretEncrypted, true);
  }

  async disableMfa(userId: string, code: string): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (
      !user?.mfaSecretEncrypted ||
      !this.mfaService.verify(
        this.mfaService.decrypt(user.mfaSecretEncrypted),
        code,
      )
    )
      throw new UnauthorizedException("Mã xác thực không đúng.");
    await this.usersRepository.setMfa(user.id, null, false);
    await this.refreshTokensRepository.revokeAllForUser(user.id);
  }

  async getPublicUser(userId: string): Promise<PublicUser> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException("Tai khoan khong ton tai.");
    }
    return toPublicUser(user);
  }

  async updatePreferences(
    userId: string,
    input: {
      preferredLanguage?: string;
      interests?: string[];
      accessibilityPreferences?: AccessibilityPreferences;
      displayName?: string;
      notificationPreferences?: NotificationPreferences;
    },
  ): Promise<PublicUser> {
    const user = await this.usersRepository.updatePreferences(userId, input);
    return toPublicUser(user);
  }

  /** Export du lieu ca nhan (FR-PER-007) — chi phan ho so thuoc Identity; Personalization gop them saved/history/contribution. */
  async exportProfile(userId: string): Promise<PublicUser> {
    return this.getPublicUser(userId);
  }

  /** An danh hoa + thu hoi moi phien dang nhap (FR-PER-007). Xem UsersRepository.anonymize. */
  async deleteAccount(userId: string): Promise<void> {
    await this.usersRepository.anonymize(userId);
    await this.refreshTokensRepository.revokeAllForUser(userId);
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const publicUser = toPublicUser(user);
    const accessToken = await this.tokenService.signAccessToken(publicUser);
    const refresh = this.tokenService.generateOpaqueToken();
    await this.refreshTokensRepository.create({
      userId: user.id,
      tokenHash: refresh.hash,
      expiresAt: this.tokenService.getRefreshTokenExpiry(),
    });
    return { accessToken, refreshToken: refresh.raw };
  }
}
