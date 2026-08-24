import { createHash, randomBytes } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { loadEnv } from "@phumspace/config";
import type { PublicUser } from "../domain/user";

export interface AccessTokenPayload {
  sub: string;
  role: PublicUser["role"];
  email: string;
  mfa: boolean;
}

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
const DEFAULT_REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async signAccessToken(user: PublicUser): Promise<string> {
    const env = loadEnv();
    const payload: AccessTokenPayload = {
      sub: user.id,
      role: user.role,
      email: user.email,
      mfa: user.mfaEnabled,
    };
    return this.jwtService.signAsync(payload, {
      secret: env.JWT_ACCESS_SECRET,
      expiresIn: env.JWT_ACCESS_TTL,
    });
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const env = loadEnv();
    return this.jwtService.verifyAsync<AccessTokenPayload>(token, {
      secret: env.JWT_ACCESS_SECRET,
    });
  }

  /** Refresh/verification token la chuoi ngau nhien luu HASH trong DB — khong phai JWT, de thu hoi duoc tung token. */
  generateOpaqueToken(): { raw: string; hash: string } {
    const raw = randomBytes(32).toString("hex");
    return { raw, hash: this.hashOpaqueToken(raw) };
  }

  hashOpaqueToken(raw: string): string {
    return createHash("sha256").update(raw).digest("hex");
  }

  getRefreshTokenExpiry(): Date {
    const env = loadEnv();
    return new Date(Date.now() + parseDurationMs(env.JWT_REFRESH_TTL));
  }

  getEmailVerificationExpiry(): Date {
    return new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);
  }

  getPasswordResetExpiry(): Date {
    return new Date(Date.now() + PASSWORD_RESET_TTL_MS);
  }
}

/** Parse "15m" | "30d" | "12h" | "45s" — fallback 30 ngay neu dinh dang la vi du la cua JWT lib (vd "2 days"). */
function parseDurationMs(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration.trim());
  if (!match) return DEFAULT_REFRESH_TTL_MS;
  const value = Number(match[1]);
  const unit = match[2] as "s" | "m" | "h" | "d";
  const unitMs: Record<"s" | "m" | "h" | "d", number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return value * unitMs[unit];
}
