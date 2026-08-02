import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HandbookService } from '../services/handbook.service';
import { HandbookTermQueryDto } from '../dto/handbook-query.dto';
import {
  KhmerTermSummaryDto,
  KhmerTermDetailDto,
  HandbookTopicDto,
  HandbookCollectionSummaryDto,
  HandbookCollectionDetailDto,
} from '../dto/handbook-response.dto';
import { StoragePort } from '../../contribution/ports/storage.port';

@ApiTags('Khmer Handbook Core')
@Controller('handbook')
export class HandbookController {
  constructor(
    private readonly handbookService: HandbookService,
    @Inject('StoragePort') private readonly storageAdapter: StoragePort,
  ) {}

  @Get('terms')
  @ApiOperation({
    summary: 'Tra cứu & Danh sách từ vựng Sổ tay Khmer Nam Bộ (Public)',
    description: 'Hỗ trợ tìm kiếm theo chữ Khmer nguyên bản, phiên âm, nghĩa tiếng Việt/Anh và bộ lọc theo topic/collection.',
  })
  @ApiResponse({ status: 200, description: 'Danh sách từ vựng' })
  async getTerms(@Query() query: HandbookTermQueryDto) {
    return this.handbookService.getPublishedTerms(query);
  }

  @Get('terms/:slug')
  @ApiOperation({
    summary: 'Chi tiết từ vựng Khmer theo mã slug (Public)',
    description: 'Trả về chữ Khmer nguyên bản, phiên âm, nghĩa, ví dụ, chủ đề, audio phát âm và nguồn trích dẫn.',
  })
  @ApiResponse({ status: 200, description: 'Chi tiết từ vựng', type: KhmerTermDetailDto })
  async getTermDetail(@Param('slug') slug: string): Promise<KhmerTermDetailDto> {
    return this.handbookService.getPublishedTermBySlug(slug);
  }

  @Get('topics')
  @ApiOperation({
    summary: 'Danh sách chủ đề học tập Sổ tay Khmer (Public)',
  })
  @ApiResponse({ status: 200, description: 'Danh sách topics', type: [HandbookTopicDto] })
  async getTopics(): Promise<HandbookTopicDto[]> {
    return this.handbookService.getPublishedTopics();
  }

  @Get('topics/:slug/terms')
  @ApiOperation({
    summary: 'Danh sách từ vựng thuộc một Chủ đề (Public)',
  })
  @ApiResponse({ status: 200, description: 'Chủ đề và từ vựng đính kèm' })
  async getTermsByTopic(@Param('slug') slug: string) {
    return this.handbookService.getTermsByTopicSlug(slug);
  }

  @Get('collections')
  @ApiOperation({
    summary: 'Danh sách Bộ sưu tập học tập Sổ tay (Public)',
  })
  @ApiResponse({ status: 200, description: 'Danh sách collections', type: [HandbookCollectionSummaryDto] })
  async getCollections(): Promise<HandbookCollectionSummaryDto[]> {
    return this.handbookService.getPublishedCollections();
  }

  @Get('collections/:slug')
  @ApiOperation({
    summary: 'Chi tiết Bộ sưu tập kèm danh sách từ vựng (Public)',
  })
  @ApiResponse({ status: 200, description: 'Chi tiết collection', type: HandbookCollectionDetailDto })
  async getCollectionDetail(@Param('slug') slug: string): Promise<HandbookCollectionDetailDto> {
    return this.handbookService.getCollectionDetailBySlug(slug);
  }

  @Get('pronunciations/:pronunciationId/audio')
  @ApiOperation({
    summary: 'Stream tệp audio phát âm người bản địa đã được thẩm định (Public)',
    description: 'Stream tệp audio MP3 công khai với các HTTP response headers an toàn.',
  })
  async streamPronunciationAudio(
    @Param('pronunciationId') pronunciationId: string,
    @Res() res: Response,
  ) {
    const pronunciation = await this.handbookService.getPronunciationForStream(pronunciationId);

    if (!pronunciation.mediaStorageKey) {
      throw new NotFoundException('Từ vựng chưa có tệp âm thanh đính kèm.');
    }

    const stream = await this.storageAdapter.getFileStream(pronunciation.mediaStorageKey);
    if (!stream) {
      throw new NotFoundException('Tệp âm thanh phát âm không tồn tại trên máy chủ lưu trữ.');
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `inline; filename="${pronunciation.id}.mp3"`);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    (stream as any).pipe(res);
  }
}
