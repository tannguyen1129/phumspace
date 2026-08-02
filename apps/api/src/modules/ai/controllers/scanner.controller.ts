import { Controller, Post, UseInterceptors, UploadedFile, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ScannerService } from '../services/scanner.service';
import { ScanResponseDto } from '../dto/scan-response.dto';

@ApiTags('AI Scanner')
@Controller('scans')
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Phân tích hình ảnh di sản văn hóa bằng Gemini AI và kiểm chứng với PhumData PUBLISHED',
    description: 'Nhận tệp hình ảnh, trích xuất đặc điểm thị giác và đối chiếu dữ liệu di sản (Tự động cộng điểm Phum Passport nếu có session cookie và kết quả MATCH).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Tệp hình ảnh di sản văn hóa (JPEG, PNG, WebP <= 5MB)',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Kết quả phân tích di sản thành công',
    type: ScanResponseDto,
  })
  async scanImage(
    @Req() req: Request,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ScanResponseDto> {
    const rawPassportToken = req.cookies?.['phum_passport_session'];
    return this.scannerService.processScan(file, rawPassportToken);
  }
}
