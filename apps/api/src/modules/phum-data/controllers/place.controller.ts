import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PlaceService } from '../services/place.service';
import { PlaceResponseDto } from '../dto/response/place-response.dto';

@ApiTags('Places')
@Controller('places')
export class PlaceController {
  constructor(private readonly service: PlaceService) {}

  @Get()
  @ApiOperation({ summary: 'Truy vấn danh sách tất cả địa điểm liên quan' })
  @ApiResponse({ status: 200, description: 'Danh sách địa điểm', type: [PlaceResponseDto] })
  async getAllPlaces(): Promise<PlaceResponseDto[]> {
    return this.service.getAllPlaces();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Truy vấn chi tiết địa điểm theo slug' })
  @ApiParam({ name: 'slug', description: 'Slug địa điểm (e.g. phuong-8-tp-tra-vinh)' })
  @ApiResponse({ status: 200, description: 'Chi tiết địa điểm', type: PlaceResponseDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy địa điểm' })
  async getBySlug(@Param('slug') slug: string): Promise<PlaceResponseDto> {
    return this.service.getBySlug(slug);
  }
}
