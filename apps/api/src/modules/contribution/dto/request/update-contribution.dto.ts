import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LanguageCode } from '@prisma/client';
import { ConsentDto } from './create-contribution.dto';

export class UpdateContributionDto {
  @ApiPropertyOptional({ example: 'Tiêu đề đính chính Chùa Âng' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Nội dung bổ sung mô tả kiến trúc mái chùa...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: LanguageCode })
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

  @ApiPropertyOptional({ type: ConsentDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConsentDto)
  consent?: ConsentDto;
}
