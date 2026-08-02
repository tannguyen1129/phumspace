import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Req,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ContributionService } from '../services/contribution.service';
import { PassportSessionGuard } from '../../passport/guards/passport-session.guard';
import { CreateContributionDto } from '../dto/request/create-contribution.dto';
import { UpdateContributionDto } from '../dto/request/update-contribution.dto';
import {
  ContributionSummaryDto,
  ContributionDetailDto,
} from '../dto/response/contribution-response.dto';

@ApiTags('Community Contributions')
@Controller('contributions')
@UseGuards(PassportSessionGuard)
export class ContributionController {
  constructor(private readonly contributionService: ContributionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Khởi tạo bản đóng góp tư liệu văn hóa mới (DRAFT hoặc SUBMITTED)',
    description: 'Tiếp nhận đóng góp tri thức di sản từ cộng đồng vào hàng đợi kiểm duyệt.',
  })
  @ApiResponse({ status: 201, description: 'Khởi tạo bản đóng góp thành công', type: ContributionDetailDto })
  async createContribution(
    @Req() req: any,
    @Body() dto: CreateContributionDto,
  ): Promise<ContributionDetailDto> {
    return this.contributionService.createContribution(req.passport.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Danh sách các bản đóng góp của người dùng guest hiện tại (Phân trang)',
    description: 'Truy vấn danh sách đóng góp gắn liền với Passport Session từ cookie HttpOnly.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Danh sách đóng góp phân trang', type: [ContributionSummaryDto] })
  async getMyContributions(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: ContributionSummaryDto[]; total: number }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.contributionService.getMyContributions(req.passport.id, pageNum, limitNum);
  }

  @Get(':publicId')
  @ApiOperation({
    summary: 'Xem chi tiết bản đóng góp theo publicId',
    description: 'Hiển thị thông tin mô tả, media đính kèm, consent và timeline trạng thái kiểm duyệt.',
  })
  @ApiParam({ name: 'publicId', example: '33333333-3333-3333-3333-333333333333' })
  @ApiResponse({ status: 200, description: 'Chi tiết bản đóng góp', type: ContributionDetailDto })
  async getContributionDetail(
    @Req() req: any,
    @Param('publicId') publicId: string,
  ): Promise<ContributionDetailDto> {
    return this.contributionService.getContributionDetail(publicId, req.passport.id);
  }

  @Patch(':publicId')
  @ApiOperation({
    summary: 'Cập nhật nội dung bản thảo đóng góp (DRAFT / NEEDS_MORE_INFORMATION)',
    description: 'Chỉnh sửa tiêu đề, mô tả hoặc liên kết di sản khi bản đóng góp chưa gửi hoặc cần bổ sung.',
  })
  @ApiParam({ name: 'publicId', example: '33333333-3333-3333-3333-333333333333' })
  @ApiResponse({ status: 200, description: 'Cập nhật bản đóng góp thành công', type: ContributionDetailDto })
  async updateDraft(
    @Req() req: any,
    @Param('publicId') publicId: string,
    @Body() dto: UpdateContributionDto,
  ): Promise<ContributionDetailDto> {
    return this.contributionService.updateDraft(publicId, req.passport.id, dto);
  }

  @Post(':publicId/media')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload hình ảnh hoặc tệp âm thanh đính kèm bản đóng góp',
    description: 'Tải tệp phương tiện (Ảnh JPEG/PNG/WebP <=10MB, Âm thanh MP3/WAV/WebM/OGG <=25MB) lên đĩa lưu trữ private local.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Tệp hình ảnh hoặc âm thanh tư liệu đóng góp',
        },
      },
      required: ['file'],
    },
  })
  @ApiParam({ name: 'publicId', example: '33333333-3333-3333-3333-333333333333' })
  @ApiResponse({ status: 200, description: 'Upload media đính kèm thành công', type: ContributionDetailDto })
  async uploadMedia(
    @Req() req: any,
    @Param('publicId') publicId: string,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ContributionDetailDto> {
    return this.contributionService.uploadMedia(publicId, req.passport.id, file);
  }

  @Post(':publicId/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gửi bản đóng góp vào hàng đợi kiểm duyệt (DRAFT -> SUBMITTED)',
    description: 'Khóa khả năng chỉnh sửa trực tiếp và chính thức đưa tư liệu vào quy trình duyệt PhumSpace.',
  })
  @ApiParam({ name: 'publicId', example: '33333333-3333-3333-3333-333333333333' })
  @ApiResponse({ status: 200, description: 'Gửi đóng góp thành công', type: ContributionDetailDto })
  async submitContribution(
    @Req() req: any,
    @Param('publicId') publicId: string,
  ): Promise<ContributionDetailDto> {
    return this.contributionService.submitContribution(publicId, req.passport.id);
  }

  @Post(':publicId/withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Yêu cầu rút bản đóng góp khỏi hệ thống (SUBMITTED -> WITHDRAWN)',
    description: 'Thu hồi quyền sử dụng tư liệu trước khi ban quản trị duyệt xuất bản.',
  })
  @ApiParam({ name: 'publicId', example: '33333333-3333-3333-3333-333333333333' })
  @ApiResponse({ status: 200, description: 'Rút đóng góp thành công', type: ContributionDetailDto })
  async withdrawContribution(
    @Req() req: any,
    @Param('publicId') publicId: string,
  ): Promise<ContributionDetailDto> {
    return this.contributionService.withdrawContribution(publicId, req.passport.id);
  }
}
