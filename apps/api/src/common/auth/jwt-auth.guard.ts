import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { loadEnv } from "@phumspace/config";
import type { UserRole } from "@phumspace/contracts";

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  email: string;
  mfa: boolean;
}

export interface AuthenticatedRequest extends Request {
  authUser?: AuthenticatedUser;
}

interface AccessTokenPayload {
  sub: string;
  role: UserRole;
  email: string;
  mfa?: boolean;
}

/**
 * Hien thuc hoa nguyen tac "account-required" (UX-V11-01): moi route goi guard nay
 * deu bat buoc access token JWT hop le. Dat truoc RolesGuard trong @UseGuards(...).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Thieu access token (account-required).");
    }

    const token = authHeader.slice("Bearer ".length);
    const env = loadEnv();
    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
        token,
        {
          secret: env.JWT_ACCESS_SECRET,
        },
      );
      request.authUser = {
        id: payload.sub,
        role: payload.role,
        email: payload.email,
        mfa: payload.mfa === true,
      };
      return true;
    } catch {
      throw new UnauthorizedException(
        "Access token khong hop le hoac da het han.",
      );
    }
  }
}
