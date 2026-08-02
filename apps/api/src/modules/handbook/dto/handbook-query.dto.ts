import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class HandbookTermQueryDto {
  @ApiPropertyOptional({ example: 'wat', description: 'Từ khóa tìm kiếm (chữ Khmer, phiên âm hoặc nghĩa tiếng Việt/Anh)' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: 'kien-truc-chua', description: 'Slug chủ đề học tập' })
  @IsOptional()
  @IsString()
  topicSlug?: string;

  @ApiPropertyOptional({ example: 'tu-vung-nhap-mon', description: 'Slug bộ sưu tập học tập' })
  @IsOptional()
  @IsString()
  collectionSlug?: string;

  @ApiPropertyOptional({ example: 'Noun', description: 'Từ loại' })
  @IsOptional()
  @IsString()
  partOfSpeech?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
