import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PassportService } from '../services/passport.service';
import { PassportSessionGuard } from '../guards/passport-session.guard';
import {
  PassportSummaryDto,
  PassportActivityDto,
  PassportAchievementDto,
  PassportSessionResponseDto,
} from '../dto/response/passport-response.dto';

@ApiTags('Phum Passport')
@Controller('passport')
export class PassportController {
  constructor(private readonly passportService: PassportService) {}

  @Post('session')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Khởi tạo hoặc khôi phục Guest Passport Session',
    description: 'Tạo phiên guest mới nếu chưa có cookie và gắn HttpOnly cookie phum_passport_session.',
  })
  @ApiResponse({
    status: 200,
    description: 'Khởi tạo/khôi phục phiên thành công',
    type: PassportSessionResponseDto,
  })
  async handleSession(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PassportSessionResponseDto> {
    const existingRawToken = req.cookies?.['phum_passport_session'];

    if (existingRawToken) {
      const existingPassport = await this.passportService.getPassportByRawToken(existingRawToken);
      if (existingPassport) {
        return {
          status: 'SUCCESS',
          message: 'Phiên Guest Passport hiện tại còn hiệu lực.',
        };
      }
    }

    // Create new guest session and attach HttpOnly cookie
    const { rawToken } = await this.passportService.createGuestSession();

    res.cookie('phum_passport_session', rawToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
    });

    return {
      status: 'SUCCESS',
      message: 'Đã khởi tạo phiên Guest Passport mới thành công.',
    };
  }

  @Get()
  @UseGuards(PassportSessionGuard)
  @ApiOperation({
    summary: 'Lấy thông tin tổng quan Phum Passport của người dùng guest hiện tại',
    description: 'Truy vấn tổng điểm tích lũy, số huy hiệu đã đạt, các hoạt động gần đây từ cookie HttpOnly.',
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin tổng quan Phum Passport',
    type: PassportSummaryDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Thiếu cookie phum_passport_session hoặc session không hợp lệ',
  })
  async getPassport(@Req() req: any): Promise<PassportSummaryDto> {
    return this.passportService.getPassportSummary(req.passport);
  }

  @Get('activities')
  @UseGuards(PassportSessionGuard)
  @ApiOperation({
    summary: 'Lấy lịch sử hoạt động tích điểm phân trang của Passport',
    description: 'Danh sách chi tiết các lần hoàn thành Quiz hoặc AI Scan MATCH.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Lịch sử hoạt động phân trang',
    type: [PassportActivityDto],
  })
  async getActivities(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: PassportActivityDto[]; total: number }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.passportService.getActivitiesPaginated(req.passport.id, pageNum, limitNum);
  }

  @Get('achievements')
  @UseGuards(PassportSessionGuard)
  @ApiOperation({
    summary: 'Lấy danh sách các huy hiệu thành tựu công bố kèm trạng thái mở khóa',
    description: 'Xem toàn bộ bộ sưu tập huy hiệu văn hóa đã mở khóa hoặc còn khóa.',
  })
  @ApiResponse({
    status: 200,
    description: 'Bộ sưu tập huy hiệu văn hóa',
    type: [PassportAchievementDto],
  })
  async getAchievements(@Req() req: any): Promise<PassportAchievementDto[]> {
    return this.passportService.getAchievementsStatus(req.passport);
  }
}
