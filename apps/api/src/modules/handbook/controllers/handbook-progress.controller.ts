import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HandbookProgressService } from '../services/handbook-progress.service';
import { PassportSessionGuard } from '../../passport/guards/passport-session.guard';

@ApiTags('Khmer Handbook Progress (Guest Passport)')
@Controller('handbook/progress')
@UseGuards(PassportSessionGuard)
export class HandbookProgressController {
  constructor(private readonly progressService: HandbookProgressService) {}

  private extractPassportId(req: any): string {
    const passportId = req.passport?.id;
    if (!passportId) {
      throw new UnauthorizedException({
        errorCode: 'HANDBOOK_PASSPORT_SESSION_REQUIRED',
        message: 'Yêu cầu phiên Guest Passport hợp lệ để thực hiện thao tác tiến trình học.',
      });
    }
    return passportId;
  }

  @Get()
  @ApiOperation({
    summary: 'Tổng quan tiến trình học tập Sổ tay Khmer của Guest Passport',
  })
  async getOverallProgress(@Req() req: any) {
    const passportId = this.extractPassportId(req);
    return this.progressService.getOverallProgress(passportId);
  }

  @Get('terms/:termId')
  @ApiOperation({
    summary: 'Truy vấn trạng thái học tập của một từ vựng Khmer',
  })
  async getTermProgress(@Req() req: any, @Param('termId') termId: string) {
    const passportId = this.extractPassportId(req);
    return this.progressService.getTermProgress(passportId, termId);
  }

  @Put('terms/:termId')
  @ApiOperation({
    summary: 'Cập nhật trạng thái học của một từ vựng (LEARNING / LEARNED)',
  })
  async updateTermProgress(
    @Req() req: any,
    @Param('termId') termId: string,
    @Body('status') status: string,
  ) {
    const passportId = this.extractPassportId(req);
    return this.progressService.updateTermProgress(passportId, termId, status);
  }

  @Get('collections/:collectionId')
  @ApiOperation({
    summary: 'Truy vấn tiến trình học một bộ sưu tập từ vựng',
  })
  async getCollectionProgress(@Req() req: any, @Param('collectionId') collectionId: string) {
    const passportId = this.extractPassportId(req);
    return this.progressService.getCollectionProgress(passportId, collectionId);
  }

  @Post('collections/:collectionId/start')
  @ApiOperation({
    summary: 'Bắt đầu học bộ sưu tập từ vựng',
  })
  async startCollection(@Req() req: any, @Param('collectionId') collectionId: string) {
    const passportId = this.extractPassportId(req);
    return this.progressService.startCollection(passportId, collectionId);
  }

  @Post('collections/:collectionId/complete')
  @ApiOperation({
    summary: 'Đánh dấu hoàn thành bộ sưu tập & kích hoạt thưởng +20pt Passport',
  })
  async completeCollection(@Req() req: any, @Param('collectionId') collectionId: string) {
    const passportId = this.extractPassportId(req);
    return this.progressService.completeCollection(passportId, collectionId);
  }
}
