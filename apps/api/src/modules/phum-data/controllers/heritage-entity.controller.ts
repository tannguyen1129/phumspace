import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { HeritageEntityService } from '../services/heritage-entity.service';
import { QueryHeritageEntityDto } from '../dto/query-heritage-entity.dto';
import { HeritageEntityResponseDto } from '../dto/response/heritage-entity-response.dto';
import { PaginatedResponseDto } from '../../../common/dto/api-response.dto';

@ApiTags('Heritage Entities')
@Controller('heritage-entities')
export class HeritageEntityController {
  constructor(private readonly service: HeritageEntityService) {}

  @Get()
  @ApiOperation({ summary: 'Truy vấn danh sách thực thể di sản văn hóa đã công bố (PUBLISHED)' })
  @ApiResponse({ status: 200, description: 'Danh sách thực thể di sản phân trang', type: PaginatedResponseDto })
  async getPublishedEntities(
    @Query() query: QueryHeritageEntityDto,
  ): Promise<PaginatedResponseDto<HeritageEntityResponseDto>> {
    return this.service.getPublishedEntities(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Truy vấn chi tiết thực thể di sản theo slug (canonicalCode)' })
  @ApiParam({ name: 'slug', description: 'Mã slug định danh thực thể (e.g. chua-hang-tra-vinh)' })
  @ApiResponse({ status: 200, description: 'Chi tiết thực thể di sản', type: HeritageEntityResponseDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thực thể hoặc chưa được công bố' })
  async getPublishedBySlug(
    @Param('slug') slug: string,
  ): Promise<HeritageEntityResponseDto> {
    return this.service.getPublishedBySlug(slug);
  }
}
