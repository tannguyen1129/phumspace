import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class QueryHeritageEntityDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter theo slug danh mục di sản' })
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiPropertyOptional({ description: 'Filter theo slug địa điểm' })
  @IsOptional()
  @IsString()
  placeSlug?: string;
}
