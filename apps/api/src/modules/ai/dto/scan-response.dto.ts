import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ScanResponseContract,
  ScanMatchedEntityContract,
  ScanSourceCitationContract,
} from '@phumspace/contracts';

export class ScanSourceCitationDto implements ScanSourceCitationContract {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  id!: string;

  @ApiProperty({ example: 'Địa chí Trà Vinh — Phần Văn hóa Dân gian' })
  title!: string;

  @ApiPropertyOptional({ example: 'Ủy ban Nhân dân tỉnh Trà Vinh' })
  creator?: string;

  @ApiPropertyOptional({ example: 'NXB Chính trị Quốc gia, 2008, tr. 145-180' })
  locator?: string;
}

export class ScanMatchedEntityDto implements ScanMatchedEntityContract {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  id!: string;

  @ApiProperty({ example: 'chua-hang-tra-vinh' })
  slug!: string;

  @ApiProperty({ example: 'chua-hang-tra-vinh' })
  canonicalCode!: string;

  @ApiProperty({ example: 'ARCHITECTURE' })
  type!: string;

  @ApiProperty({ example: 'Chùa Âng' })
  preferredViName!: string;

  @ApiPropertyOptional({ example: 'វត្តកំពង់ជ្រៃ' })
  preferredKmName?: string;

  @ApiProperty({ example: 'Chùa Âng (Wat Kompong Chray) là ngôi chùa Khmer cổ kính bậc nhất tại Trà Vinh' })
  summary!: string;

  @ApiPropertyOptional({ example: 'Nơi diễn ra các nghi lễ văn hóa truyền thống' })
  culturalMeaning?: string;

  @ApiProperty({ example: ['Kiến trúc Tôn giáo'] })
  categories!: string[];

  @ApiProperty({ example: ['Phường 8, TP. Trà Vinh'] })
  places!: string[];
}

export class ObservationSummaryDto {
  @ApiProperty({ example: ['temple', 'statue', 'roof_spire'] })
  objectTypes!: string[];

  @ApiProperty({ example: ['multi-tiered roof', 'naga balustrade'] })
  visibleFeatures!: string[];

  @ApiProperty({ example: 'HIGH' })
  imageQuality!: string;
}

export class ScanResponseDto implements ScanResponseContract {
  @ApiProperty({ example: '55555555-5555-5555-5555-555555555555' })
  scanId!: string;

  @ApiProperty({ example: 'SUCCESS' })
  status!: 'SUCCESS' | 'FAILED';

  @ApiProperty({ example: 'MATCH', enum: ['MATCH', 'SUGGEST', 'UNKNOWN', 'HUMAN_REVIEW'] })
  decision!: 'MATCH' | 'SUGGEST' | 'UNKNOWN' | 'HUMAN_REVIEW';

  @ApiProperty({ example: 'HIGH', enum: ['HIGH', 'MEDIUM', 'LOW', 'NONE'] })
  confidenceBand!: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

  @ApiProperty({ type: ObservationSummaryDto })
  observationSummary!: ObservationSummaryDto;

  @ApiPropertyOptional({ type: ScanMatchedEntityDto })
  matchedEntity?: ScanMatchedEntityDto;

  @ApiPropertyOptional({ type: [ScanMatchedEntityDto] })
  candidates?: ScanMatchedEntityDto[];

  @ApiPropertyOptional({ example: 'SOURCE_VERIFIED' })
  verificationLabel?: string;

  @ApiProperty({ type: [ScanSourceCitationDto] })
  sources!: ScanSourceCitationDto[];

  @ApiProperty({ example: [] })
  warnings!: string[];

  @ApiProperty({ example: '2026-08-01T20:00:00.000Z' })
  createdAt!: string;
}
