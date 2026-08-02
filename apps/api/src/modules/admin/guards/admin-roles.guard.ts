import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StaffRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/require-roles.decorator';

@Injectable()
export class AdminRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<StaffRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const staffUser = req.staffUser;

    if (!staffUser || !staffUser.roles) {
      throw new ForbiddenException({
        errorCode: 'ADMIN_ACCESS_DENIED',
        message: 'Bạn không có quyền truy cập tính năng quản trị này.',
      });
    }

    const userRoles: StaffRole[] = staffUser.roles.map((r: any) => r.role);
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException({
        errorCode: 'ADMIN_ROLE_REQUIRED',
        message: `Tính năng này yêu cầu quyền tối thiểu: ${requiredRoles.join(', ')}.`,
      });
    }

    return true;
  }
}
