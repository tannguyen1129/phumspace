import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsBoolean,
  ValidateNested,
  Equals,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContributionType, LanguageCode } from '@prisma/client';

export class ConsentDto {
  @ApiProperty({ example: true, description: 'Bắt buộc xác nhận sở hữu hoặc có quyền cung cấp tư liệu' })
  @IsBoolean()
  @Equals(true, { message: 'Bạn phải xác nhận sở hữu hoặc có quyền cung cấp tư liệu này.' })
  contributorOwnsRights!: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  allowPublicDisplay?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  allowEducationalUse?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  allowResearchUse?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  allowCommercialUse?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Nếu false, tuyệt đối không gửi tệp cho Gemini AI' })
  @IsOptional()
  @IsBoolean()
  allowAiProcessing?: boolean;

  @ApiPropertyOptional({ example: 'COMMUNITY' })
  @IsOptional()
  @IsString()
  attributionPreference?: string;
}

export class CreateContributionDto {
  @ApiProperty({ enum: ContributionType, example: ContributionType.NEW_HERITAGE_CONTENT })
  @IsEnum(ContributionType)
  contributionType!: ContributionType;

  @ApiProperty({ example: 'Đề xuất thông tin Lễ hội Ok Om Bok tại Cầu Kè' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Lễ hội Ok Om Bok tại Cầu Kè có nét đặc trưng đua ghe ngo sông Hậu...' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({ enum: LanguageCode, example: LanguageCode.vi })
  @IsOptional()
  @IsEnum(LanguageCode)
  languageCode?: LanguageCode;

  @ApiPropertyOptional({ example: '11111111-1111-1111-1111-111111111111' })
  @IsOptional()
  @IsUUID()
  relatedHeritageEntityId?: string;

  @ApiPropertyOptional({ example: '22222222-2222-2222-2222-222222222222' })
  @IsOptional()
  @IsUUID()
  relatedPlaceId?: string;

  @ApiProperty({ type: ConsentDto })
  @ValidateNested()
  @Type(() => ConsentDto)
  consent!: ConsentDto;

  @ApiPropertyOptional({ example: true, description: 'Gửi ngay vào hàng đợi kiểm duyệt thay vì lưu nháp' })
  @IsOptional()
  @IsBoolean()
  submitImmediately?: boolean;
}
