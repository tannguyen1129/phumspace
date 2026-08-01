import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HeritageEntityPublicContract, HeritageNameContract } from '@phumspace/contracts';
import { HeritageCategorySummaryDto } from './category-response.dto';
import { PlaceSummaryDto } from './place-response.dto';

export class HeritageNameDto implements HeritageNameContract {
  @ApiProperty({ example: 'vi', description: 'Mã ngôn ngữ (vi, km, en)' })
  language!: string;

  @ApiProperty({ example: 'PREFERRED', description: 'Loại tên (PREFERRED, ALTERNATE, TRANSLITERATION,...)' })
  nameType!: string;

  @ApiProperty({ example: 'Chùa Âng', description: 'Tên nguyên bản' })
  originalValue!: string;

  @ApiProperty({ example: 'chua ang', description: 'Tên tìm kiếm chuẩn hóa' })
  normalizedValue!: string;

  @ApiPropertyOptional({ example: 'Latn', description: 'Hệ chữ viết (Latn, Khmr)' })
  script?: string;
}

export class HeritageEntityResponseDto implements HeritageEntityPublicContract {
  @ApiProperty({ example: '33333333-3333-3333-3333-333333333333' })
  id!: string;

  @ApiProperty({ example: 'chua-hang-tra-vinh' })
  slug!: string;

  @ApiProperty({ example: 'ARCHITECTURE' })
  type!: string;

  @ApiProperty({ example: 'Chùa Âng là ngôi chùa Khmer cổ kính tại Trà Vinh' })
  summary!: string;

  @ApiPropertyOptional({ example: 'Nội dung lịch sử đã xác minh...' })
  historicalContent?: string;

  @ApiPropertyOptional({ example: 'Ý nghĩa văn hóa tâm linh...' })
  culturalMeaning?: string;

  @ApiProperty({ type: [HeritageNameDto] })
  names!: HeritageNameDto[];

  @ApiProperty({ type: [HeritageCategorySummaryDto] })
  categories!: HeritageCategorySummaryDto[];

  @ApiProperty({ type: [PlaceSummaryDto] })
  places!: PlaceSummaryDto[];

  @ApiProperty({ example: '2026-08-02T02:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-08-02T02:00:00.000Z' })
  updatedAt!: string;
}
