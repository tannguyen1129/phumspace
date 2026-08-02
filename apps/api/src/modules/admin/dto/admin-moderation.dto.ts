import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContributionStatus } from '@prisma/client';
import { AdminPublicationPlanContract } from '@phumspace/contracts';

export class AdminModerationQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ enum: ContributionStatus })
  @IsOptional()
  @IsEnum(ContributionStatus)
  status?: ContributionStatus;

  @ApiPropertyOptional({ example: 'NEW_HERITAGE_CONTENT' })
  @IsOptional()
  contributionType?: string;
}

export class AdminRequestInformationDto {
  @ApiProperty({ example: 'Vui lòng cung cấp thêm hình ảnh rõ nét hơn của bản điêu khắc.' })
  @IsString()
  @IsNotEmpty()
  publicMessage!: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  version?: number;
}

export class AdminRecommendationDto {
  @ApiProperty({ example: 'RECOMMEND_APPROVE' })
  @IsString()
  @IsNotEmpty()
  recommendation!: string;

  @ApiPropertyOptional({ example: 'Đã kiểm tra nguồn trích dẫn từ sách tư liệu.' })
  @IsOptional()
  @IsString()
  internalNote?: string;

  @ApiPropertyOptional({ example: { culturalScope: true, verifiability: true } })
  @IsOptional()
  checklistResult?: any;
}

export class AdminApproveDto {
  @ApiPropertyOptional({ example: 'Chấp nhận thông tin đã thẩm định.' })
  @IsOptional()
  @IsString()
  internalNote?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  version?: number;
}

export class AdminRejectDto {
  @ApiProperty({ example: 'Nội dung trùng lặp hoặc không thuộc phạm vi di sản Khmer Nam Bộ.' })
  @IsString()
  @IsNotEmpty()
  publicMessage!: string;

  @ApiPropertyOptional({ example: 'OUT_OF_SCOPE' })
  @IsOptional()
  @IsString()
  reasonCode?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  version?: number;
}

export class AdminPublicationPlanDto implements AdminPublicationPlanContract {
  @ApiProperty({ example: 'NEW_ENTITY', enum: ['NEW_ENTITY', 'UPDATE_ENTITY'] })
  @IsString()
  @IsNotEmpty()
  publicationTarget!: 'NEW_ENTITY' | 'UPDATE_ENTITY';

  @ApiPropertyOptional({ example: '11111111-1111-1111-1111-111111111111' })
  @IsOptional()
  @IsString()
  targetEntityId?: string;

  @ApiProperty({ example: 'chua-ang-tra-vinh' })
  @IsString()
  @IsNotEmpty()
  canonicalCode!: string;

  @ApiProperty({ example: 'ARCHITECTURE' })
  @IsString()
  @IsNotEmpty()
  entityType!: string;

  @ApiProperty({ example: 'Chùa Âng Trà Vinh' })
  @IsString()
  @IsNotEmpty()
  preferredViName!: string;

  @ApiPropertyOptional({ example: 'វត្តអង្គ' })
  @IsOptional()
  @IsString()
  preferredKmName?: string;

  @ApiProperty({ example: 'Chùa Âng (Wat Angkor Raaj Borey) là ngôi chùa Khmer cổ kính bậc nhất Trà Vinh.' })
  @IsString()
  @IsNotEmpty()
  summary!: string;

  @ApiPropertyOptional({ example: 'Biểu tượng tâm linh và văn hóa nghệ thuật điêu khắc Khmer Nam Bộ.' })
  @IsOptional()
  @IsString()
  culturalMeaning?: string;

  @ApiPropertyOptional({ example: 'Được xây dựng từ thế kỷ X và đại tu năm 1842.' })
  @IsOptional()
  @IsString()
  historicalContent?: string;

  @ApiPropertyOptional({ example: '22222222-2222-2222-2222-222222222222' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: '33333333-3333-3333-3333-333333333333' })
  @IsOptional()
  @IsString()
  placeId?: string;

  @ApiProperty({ example: 'SOURCE_VERIFIED', enum: ['COMMUNITY_CONFIRMED', 'SOURCE_VERIFIED', 'EXPERT_REVIEWED'] })
  @IsString()
  @IsNotEmpty()
  verificationOutcome!: 'COMMUNITY_CONFIRMED' | 'SOURCE_VERIFIED' | 'EXPERT_REVIEWED';

  @ApiProperty({ example: [], type: [String] })
  @IsArray()
  selectedMediaIds!: string[];
}
