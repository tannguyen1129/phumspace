import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminAuthService } from '../services/admin-auth.service';
import { AdminSessionGuard } from '../guards/admin-session.guard';
import {
  AdminLoginRequestDto,
  AdminSessionResponseDto,
  StaffProfileDto,
} from '../dto/admin-auth.dto';

@ApiTags('Admin Authentication')
@Controller('admin')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng nhập nhân sự bằng Google OIDC ID Token',
    description: 'Xác minh Google ID Token, kiểm tra tài khoản staff allowlist trong DB và gắn HttpOnly cookie phum_admin_session.',
  })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công', type: AdminSessionResponseDto })
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: AdminLoginRequestDto,
  ): Promise<AdminSessionResponseDto> {
    // Validate Origin to prevent CSRF
    const origin = req.headers.origin || req.headers.referer;
    const allowedOrigin = process.env.ADMIN_ALLOWED_ORIGIN || 'http://localhost:3000';
    if (origin && !origin.startsWith(allowedOrigin)) {
      throw new ForbiddenException({
        errorCode: 'ADMIN_ACCESS_DENIED',
        message: 'Origin không hợp lệ.',
      });
    }

    const { rawToken } = await this.adminAuthService.loginWithGoogle(dto.idToken);

    const ttlSeconds = parseInt(process.env.ADMIN_SESSION_TTL_SECONDS || '28800', 10);

    res.cookie('phum_admin_session', rawToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/api/v1/admin',
      maxAge: ttlSeconds * 1000,
    });

    return {
      status: 'SUCCESS',
      message: 'Đăng nhập phiên nhân sự Admin thành công.',
    };
  }

  @Post('auth/logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng xuất khỏi phiên nhân sự Admin',
    description: 'Thu hồi phiên staff session trong DB và xóa cookie phum_admin_session.',
  })
  @ApiResponse({ status: 200, description: 'Đăng xuất thành công', type: AdminSessionResponseDto })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AdminSessionResponseDto> {
    const rawToken = req.cookies?.['phum_admin_session'];
    await this.adminAuthService.logout(rawToken);

    res.clearCookie('phum_admin_session', { path: '/api/v1/admin' });

    return {
      status: 'SUCCESS',
      message: 'Đã đăng xuất khỏi phiên nhân sự Admin.',
    };
  }

  @Get('me')
  @UseGuards(AdminSessionGuard)
  @ApiOperation({
    summary: 'Truy vấn hồ sơ cá nhân và vai trò RBAC của nhân sự hiện tại',
    description: 'Đọc thông tin từ cookie phum_admin_session, trả về email, displayName, vai trò và thời hạn phiên.',
  })
  @ApiResponse({ status: 200, description: 'Hồ sơ tài khoản nhân sự', type: StaffProfileDto })
  async getProfile(@Req() req: any): Promise<StaffProfileDto> {
    return this.adminAuthService.toStaffProfileDto(req.staffSession);
  }
}
