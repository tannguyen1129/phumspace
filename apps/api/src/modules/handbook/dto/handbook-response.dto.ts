import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  KhmerTermSummaryContract,
  KhmerTermDetailContract,
  HandbookTopicContract,
  HandbookCollectionSummaryContract,
  HandbookCollectionDetailContract,
} from '@phumspace/contracts';

export class KhmerTermSummaryDto implements KhmerTermSummaryContract {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  id!: string;

  @ApiProperty({ example: 'wat-chua' })
  slug!: string;

  @ApiProperty({ example: 'វត្ត' })
  scriptText!: string;

  @ApiPropertyOptional({ example: 'wat' })
  transliteration?: string;

  @ApiProperty({ example: 'Chùa, tu viện Phật giáo Khmer' })
  shortDefinitionVi!: string;

  @ApiPropertyOptional({ example: 'Khmer Buddhist temple or monastery' })
  shortDefinitionEn?: string;

  @ApiPropertyOptional({ example: 'Noun' })
  partOfSpeech?: string;

  @ApiProperty({ example: true })
  hasAudio!: boolean;

  @ApiPropertyOptional({ example: '2026-08-02T10:00:00.000Z' })
  publishedAt?: string;
}

export class KhmerTermDetailDto extends KhmerTermSummaryDto implements KhmerTermDetailContract {
  @ApiPropertyOptional({ example: 'Trang trọng' })
  usageRegister?: string;

  @ApiPropertyOptional({ example: 'Trung tâm sinh hoạt văn hóa và tín ngưỡng của cộng đồng người Khmer.' })
  culturalNote?: string;

  @ApiProperty({ example: [], type: [Object] })
  meanings!: any[];

  @ApiProperty({ example: [], type: [Object] })
  examples!: any[];

  @ApiProperty({ example: [], type: [Object] })
  pronunciations!: any[];

  @ApiProperty({ example: [], type: [Object] })
  topics!: { slug: string; titleVi: string }[];

  @ApiProperty({ example: [], type: [Object] })
  collections!: { slug: string; title: string }[];

  @ApiPropertyOptional({ example: { slug: 'chua-ang-tra-vinh', canonicalCode: 'chua-ang-tra-vinh' } })
  relatedHeritageEntity?: { slug: string; canonicalCode: string };

  @ApiPropertyOptional({ example: { slug: 'chua-ang-tra-vinh', name: 'Chùa Âng Trà Vinh' } })
  relatedPlace?: { slug: string; name: string };
}

export class HandbookTopicDto implements HandbookTopicContract {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  id!: string;

  @ApiProperty({ example: 'kien-truc-chua' })
  slug!: string;

  @ApiProperty({ example: 'Kiến trúc Chùa Khmer' })
  titleVi!: string;

  @ApiPropertyOptional({ example: 'វត្ត' })
  titleKm?: string;

  @ApiPropertyOptional({ example: 'Các từ vựng liên quan đến kiến trúc chùa cổ Khmer.' })
  description?: string;

  @ApiProperty({ example: 5 })
  termCount!: number;
}

export class HandbookCollectionSummaryDto implements HandbookCollectionSummaryContract {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  id!: string;

  @ApiProperty({ example: 'tu-vung-nhap-mon' })
  slug!: string;

  @ApiProperty({ example: 'Từ vựng Nhập môn Văn hóa' })
  title!: string;

  @ApiPropertyOptional({ example: 'Bộ từ vựng cơ bản về văn hóa truyền thống.' })
  description?: string;

  @ApiPropertyOptional({ example: 'EASY' })
  difficulty?: string;

  @ApiProperty({ example: 10 })
  itemCount!: number;
}

export class HandbookCollectionDetailDto extends HandbookCollectionSummaryDto implements HandbookCollectionDetailContract {
  @ApiProperty({ type: [KhmerTermSummaryDto] })
  terms!: KhmerTermSummaryDto[];
}
