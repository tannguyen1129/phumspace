import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AdminAuthService } from '../services/admin-auth.service';
import { StaffStatus } from '@prisma/client';

@Injectable()
export class AdminSessionGuard implements CanActivate {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const rawToken = req.cookies?.['phum_admin_session'];

    if (!rawToken) {
      throw new UnauthorizedException({
        errorCode: 'ADMIN_SESSION_REQUIRED',
        message: 'Yêu cầu phiên đăng nhập nhân sự phum_admin_session để thực hiện thao tác này.',
      });
    }

    const session = await this.adminAuthService.validateRawToken(rawToken);
    if (!session) {
      throw new UnauthorizedException({
        errorCode: 'ADMIN_SESSION_INVALID',
        message: 'Phiên đăng nhập nhân sự không hợp lệ hoặc đã hết hạn.',
      });
    }

    if (session.staffUser.status !== StaffStatus.ACTIVE) {
      throw new ForbiddenException({
        errorCode: 'ADMIN_STAFF_SUSPENDED',
        message: 'Tài khoản nhân sự của bạn đã bị đình chỉ.',
      });
    }

    // Attach staff session to request context
    req.staffSession = session;
    req.staffUser = session.staffUser;
    return true;
  }
}
