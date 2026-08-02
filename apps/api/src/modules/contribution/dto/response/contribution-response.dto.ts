import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ContributionMediaContract,
  ContributionConsentContract,
  ContributionStatusHistoryContract,
  ContributionSummaryContract,
  ContributionDetailContract,
} from '@phumspace/contracts';

export class ContributionMediaDto implements ContributionMediaContract {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  id!: string;

  @ApiProperty({ example: 'IMAGE' })
  mediaType!: 'IMAGE' | 'AUDIO';

  @ApiProperty({ example: 'chua_ang_tu_lieu.jpg' })
  originalFileName!: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType!: string;

  @ApiProperty({ example: 1048576 })
  sizeBytes!: number;

  @ApiPropertyOptional({ example: 120 })
  durationSeconds?: number;
}

export class ContributionConsentDto implements ContributionConsentContract {
  @ApiProperty({ example: '1.0.0' })
  consentVersion!: string;

  @ApiProperty({ example: true })
  contributorOwnsRights!: boolean;

  @ApiProperty({ example: true })
  allowPublicDisplay!: boolean;

  @ApiProperty({ example: true })
  allowEducationalUse!: boolean;

  @ApiProperty({ example: true })
  allowResearchUse!: boolean;

  @ApiProperty({ example: false })
  allowCommercialUse!: boolean;

  @ApiProperty({ example: false })
  allowAiProcessing!: boolean;

  @ApiProperty({ example: 'COMMUNITY' })
  attributionPreference!: string;

  @ApiProperty({ example: '2026-08-02T10:00:00.000Z' })
  consentedAt!: string;
}

export class ContributionStatusHistoryDto implements ContributionStatusHistoryContract {
  @ApiProperty({ example: 'DRAFT' })
  fromStatus!: string;

  @ApiProperty({ example: 'SUBMITTED' })
  toStatus!: string;

  @ApiPropertyOptional({ example: 'Gửi bản đóng góp thành công.' })
  publicMessage?: string;

  @ApiProperty({ example: '2026-08-02T10:00:00.000Z' })
  createdAt!: string;
}

export class ContributionSummaryDto implements ContributionSummaryContract {
  @ApiProperty({ example: '33333333-3333-3333-3333-333333333333' })
  publicId!: string;

  @ApiProperty({ example: 'NEW_HERITAGE_CONTENT' })
  contributionType!: string;

  @ApiProperty({ example: 'SUBMITTED' })
  status!: string;

  @ApiProperty({ example: 'Đề xuất thông tin Lễ hội Ok Om Bok' })
  title!: string;

  @ApiProperty({ example: 'vi' })
  languageCode!: string;

  @ApiPropertyOptional({ example: '2026-08-02T10:00:00.000Z' })
  submittedAt?: string;

  @ApiProperty({ example: '2026-08-02T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: 1 })
  mediaCount!: number;
}

export class ContributionDetailDto extends ContributionSummaryDto implements ContributionDetailContract {
  @ApiProperty({ example: 'Mô tả chi tiết nét đẹp văn hóa đua ghe ngo...' })
  description!: string;

  @ApiPropertyOptional({
    example: { id: 'entity-1', slug: 'chua-hang-tra-vinh', name: 'Chùa Âng' },
  })
  relatedHeritageEntity?: {
    id: string;
    slug: string;
    name: string;
  };

  @ApiPropertyOptional({
    example: { id: 'place-1', slug: 'phuong-8-tp-tra-vinh', name: 'Phường 8, TP. Trà Vinh' },
  })
  relatedPlace?: {
    id: string;
    slug: string;
    name: string;
  };

  @ApiProperty({ type: [ContributionMediaDto] })
  media!: ContributionMediaDto[];

  @ApiPropertyOptional({ type: ContributionConsentDto })
  consent?: ContributionConsentDto;

  @ApiProperty({ type: [ContributionStatusHistoryDto] })
  statusHistory!: ContributionStatusHistoryDto[];
}
