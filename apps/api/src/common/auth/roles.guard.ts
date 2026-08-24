import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { UserRole } from "@phumspace/contracts";
import { ROLES_KEY } from "./roles.decorator";
import type { AuthenticatedRequest } from "./jwt-auth.guard";

/**
 * Chi co tac dung khi dung sau JwtAuthGuard (can request.authUser da duoc gan).
 * Khong co @Roles(...) tren handler/class -> cho qua (endpoint chi can dang nhap, khong phan biet vai tro).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<
      UserRole[] | undefined
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const role = request.authUser?.role;
    if (!role || !requiredRoles.includes(role)) {
      throw new ForbiddenException(
        "Ban khong co quyen thuc hien hanh dong nay.",
      );
    }
    if (
      (role === "REVIEWER" || role === "SYSTEM_ADMIN") &&
      !request.authUser?.mfa
    ) {
      throw new ForbiddenException("MFA_REQUIRED_FOR_PRIVILEGED_ACTION");
    }
    return true;
  }
}
