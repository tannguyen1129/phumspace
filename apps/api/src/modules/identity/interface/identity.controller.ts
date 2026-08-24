import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { loadEnv } from "@phumspace/config";
import { CurrentUser } from "../../../common/auth/current-user.decorator";
import { JwtAuthGuard, type AuthenticatedUser } from "../../../common/auth/jwt-auth.guard";
import { AuthService } from "../application/auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { RegisterDto } from "./dto/register.dto";
import { UpdatePreferencesDto } from "./dto/update-preferences.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { MfaCodeDto } from "./dto/mfa-code.dto";

/**
 * IdentityController — hien thuc "account-required" (SRS nhom IAM, UX-V11-01).
 * register/login/refresh/verify-email khong can dang nhap truoc; me/preferences bat buoc JwtAuthGuard.
 */
@Controller("identity")
export class IdentityController {
  constructor(private readonly authService: AuthService) {}

  @Get("health")
  health() {
    return { module: "identity", status: "ok" };
  }

  // Chinh sach rieng cho hanh dong nhay cam (System Design muc 16.2): gioi han chat hon
  // default de chan brute-force/credential-stuffing va spam tao tai khoan.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("register")
  async register(@Body() dto: RegisterDto) {
    const env = loadEnv();
    const result = await this.authService.register(dto);
    return {
      user: result.user,
      tokens: result.tokens,
      // Chua co email provider that o M1 — dev/staging tra thang token de test luong verify-email.
      ...(env.NODE_ENV !== "production" ? { devEmailVerificationToken: result.devEmailVerificationToken } : {}),
    };
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshDto) {
    const tokens = await this.authService.refresh(dto.refreshToken);
    return { tokens };
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: RefreshDto): Promise<void> {
    await this.authService.logout(dto.refreshToken);
  }

  @Post("verify-email")
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.authService.verifyEmail(dto.token);
    return { verified: true };
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post("resend-verification")
  async resendVerification(@CurrentUser() currentUser: AuthenticatedUser) {
    const rawToken = await this.authService.resendEmailVerification(currentUser.id);
    const env = loadEnv();
    return { accepted: true, ...(env.NODE_ENV !== "production" && rawToken ? { devEmailVerificationToken: rawToken } : {}) };
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post("forgot-password")
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const rawToken = await this.authService.requestPasswordReset(dto.email);
    const env = loadEnv();
    return {
      accepted: true,
      message: "Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi.",
      ...(env.NODE_ENV !== "production" && rawToken ? { devPasswordResetToken: rawToken } : {}),
    };
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.password);
    return { reset: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post("mfa/setup")
  setupMfa(@CurrentUser() currentUser: AuthenticatedUser) { return this.authService.setupMfa(currentUser.id); }

  @UseGuards(JwtAuthGuard)
  @Post("mfa/enable")
  async enableMfa(@CurrentUser() currentUser: AuthenticatedUser, @Body() dto: MfaCodeDto) { await this.authService.enableMfa(currentUser.id, dto.code); return { enabled: true }; }

  @UseGuards(JwtAuthGuard)
  @Post("mfa/disable")
  async disableMfa(@CurrentUser() currentUser: AuthenticatedUser, @Body() dto: MfaCodeDto) { await this.authService.disableMfa(currentUser.id, dto.code); return { enabled: false }; }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.authService.getPublicUser(currentUser.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("me/preferences")
  async updatePreferences(@CurrentUser() currentUser: AuthenticatedUser, @Body() dto: UpdatePreferencesDto) {
    return this.authService.updatePreferences(currentUser.id, dto);
  }
}
