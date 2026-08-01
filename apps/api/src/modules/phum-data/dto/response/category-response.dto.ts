import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryPublicContract, HeritageCategorySummaryContract } from '@phumspace/contracts';

export class HeritageCategorySummaryDto implements HeritageCategorySummaryContract {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  id!: string;

  @ApiProperty({ example: 'kien-truc-ton-giao' })
  slug!: string;

  @ApiProperty({ example: 'Kiến trúc Tôn giáo' })
  name!: string;
}

export class CategoryResponseDto implements CategoryPublicContract {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  id!: string;

  @ApiProperty({ example: 'kien-truc-ton-giao' })
  slug!: string;

  @ApiProperty({ example: 'Kiến trúc Tôn giáo' })
  name!: string;

  @ApiPropertyOptional({ example: 'Các công trình kiến trúc chùa chiền Khmer' })
  description?: string;

  @ApiProperty({ example: '2026-08-02T02:00:00.000Z' })
  createdAt!: string;
}
