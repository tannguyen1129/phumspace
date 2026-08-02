import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportService } from '../services/passport.service';

@Injectable()
export class PassportSessionGuard implements CanActivate {
  constructor(private readonly passportService: PassportService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const rawToken = req.cookies?.['phum_passport_session'];

    if (!rawToken) {
      throw new UnauthorizedException({
        errorCode: 'PASSPORT_SESSION_REQUIRED',
        message: 'Yêu cầu cookie phum_passport_session để thực hiện thao tác này.',
      });
    }

    const passport = await this.passportService.getPassportByRawToken(rawToken);
    if (!passport) {
      throw new UnauthorizedException({
        errorCode: 'PASSPORT_SESSION_INVALID',
        message: 'Phiên Guest Passport không hợp lệ hoặc đã hết hạn.',
      });
    }

    // Attach passport to request context
    req.passport = passport;
    return true;
  }
}
