import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  Res,
  Inject,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminSessionGuard } from '../guards/admin-session.guard';
import { AdminRolesGuard } from '../guards/admin-roles.guard';
import { RequireRoles } from '../decorators/require-roles.decorator';
import { AdminModerationService } from '../services/admin-moderation.service';
import { AdminPublicationService } from '../services/admin-publication.service';
import { StaffRole } from '@prisma/client';
import {
  AdminModerationQueryDto,
  AdminRequestInformationDto,
  AdminRecommendationDto,
  AdminApproveDto,
  AdminRejectDto,
  AdminPublicationPlanDto,
} from '../dto/admin-moderation.dto';
import { StoragePort } from '../../contribution/ports/storage.port';

@ApiTags('Admin Moderation & Publication')
@Controller('admin/contributions')
@UseGuards(AdminSessionGuard, AdminRolesGuard)
export class AdminModerationController {
  constructor(
    private readonly moderationService: AdminModerationService,
    private readonly publicationService: AdminPublicationService,
    @Inject('StoragePort') private readonly storageAdapter: StoragePort,
  ) {}

  @Get()
  @RequireRoles(StaffRole.REVIEWER, StaffRole.EDITOR, StaffRole.ADMIN)
  @ApiOperation({ summary: 'Danh sách hàng đợi kiểm duyệt đóng góp (Reviewer+)' })
  async getQueue(@Query() query: AdminModerationQueryDto) {
    return this.moderationService.getModerationQueue(query);
  }

  @Get(':publicId')
  @RequireRoles(StaffRole.REVIEWER, StaffRole.EDITOR, StaffRole.ADMIN)
  @ApiOperation({ summary: 'Chi tiết đóng góp, consent, checklist và status history (Reviewer+)' })
  async getDetail(@Param('publicId') publicId: string) {
    return this.moderationService.getContributionDetail(publicId);
  }

  @Get(':publicId/media/:mediaId')
  @RequireRoles(StaffRole.REVIEWER, StaffRole.EDITOR, StaffRole.ADMIN)
  @ApiOperation({ summary: 'Stream tệp phương tiện private cho kiểm duyệt viên (Reviewer+)' })
  async streamPrivateMedia(
    @Param('publicId') publicId: string,
    @Param('mediaId') mediaId: string,
    @Res() res: Response,
  ) {
    const { media, storageKey } = await this.moderationService.getPrivateMediaFile(publicId, mediaId);

    const stream = await this.storageAdapter.getFileStream(storageKey);
    if (!stream) {
      throw new NotFoundException('Tệp phương tiện private không tồn tại trên hệ thống lưu trữ.');
    }

    res.setHeader('Content-Type', media.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(media.originalFileName)}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');

    (stream as any).pipe(res);
  }

  @Post(':publicId/assign')
  @RequireRoles(StaffRole.REVIEWER, StaffRole.EDITOR, StaffRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Nhận lượt review đóng góp (Reviewer+)' })
  async assignReview(@Param('publicId') publicId: string, @Req() req: any) {
    await this.moderationService.assignReview(publicId, req.staffUser);
    return { status: 'SUCCESS', message: 'Đã nhận lượt review đóng góp.' };
  }

  @Post(':publicId/release')
  @RequireRoles(StaffRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Giải phóng lượt review đóng góp (ADMIN)' })
  async releaseReview(@Param('publicId') publicId: string, @Req() req: any) {
    await this.moderationService.releaseReview(publicId, req.staffUser);
    return { status: 'SUCCESS', message: 'Đã giải phóng lượt review.' };
  }

  @Post(':publicId/request-information')
  @RequireRoles(StaffRole.REVIEWER, StaffRole.EDITOR, StaffRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Yêu cầu người gửi bổ sung thông tin (Reviewer+)' })
  async requestInformation(
    @Param('publicId') publicId: string,
    @Body() dto: AdminRequestInformationDto,
    @Req() req: any,
  ) {
    await this.moderationService.requestInformation(publicId, dto.publicMessage, dto.version || 1, req.staffUser);
    return { status: 'SUCCESS', message: 'Đã gửi yêu cầu bổ sung thông tin tới người đóng góp.' };
  }

  @Post(':publicId/recommend')
  @RequireRoles(StaffRole.REVIEWER, StaffRole.EDITOR, StaffRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gửi khuyến nghị kiểm duyệt (Reviewer+)' })
  async submitRecommendation(
    @Param('publicId') publicId: string,
    @Body() dto: AdminRecommendationDto,
    @Req() req: any,
  ) {
    await this.moderationService.submitRecommendation(publicId, dto, req.staffUser);
    return { status: 'SUCCESS', message: 'Đã lưu khuyến nghị kiểm duyệt.' };
  }

  @Post(':publicId/approve')
  @RequireRoles(StaffRole.EDITOR, StaffRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Phê duyệt đóng góp (EDITOR/ADMIN)' })
  async approveContribution(
    @Param('publicId') publicId: string,
    @Body() dto: AdminApproveDto,
    @Req() req: any,
  ) {
    await this.moderationService.approveContribution(publicId, dto, req.staffUser);
    return { status: 'SUCCESS', message: 'Bài đóng góp đã được phê duyệt thành công.' };
  }

  @Post(':publicId/reject')
  @RequireRoles(StaffRole.EDITOR, StaffRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Từ chối đóng góp (EDITOR/ADMIN)' })
  async rejectContribution(
    @Param('publicId') publicId: string,
    @Body() dto: AdminRejectDto,
    @Req() req: any,
  ) {
    await this.moderationService.rejectContribution(publicId, dto, req.staffUser);
    return { status: 'SUCCESS', message: 'Bài đóng góp đã bị từ chối.' };
  }

  @Post(':publicId/publish')
  @RequireRoles(StaffRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xuất bản bài đóng góp vào PhumData Core (Chỉ dành cho ADMIN)' })
  async publishContribution(
    @Param('publicId') publicId: string,
    @Body() plan: AdminPublicationPlanDto,
    @Req() req: any,
  ) {
    const result = await this.publicationService.publishContributionToPhumData(publicId, plan, req.staffUser);
    return {
      status: 'SUCCESS',
      message: `Đã xuất bản đóng góp thành công vào PhumData Core (Mã di sản: ${result.canonicalCode}).`,
      data: result,
    };
  }
}
