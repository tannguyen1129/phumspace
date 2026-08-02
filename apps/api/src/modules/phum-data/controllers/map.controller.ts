import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MapService } from '../services/map.service';
import { MapPlacesResponseDto } from '../dto/response/map-marker-response.dto';

@ApiTags('Map')
@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get('places')
  @ApiOperation({ summary: 'Truy vấn danh sách marker địa điểm di sản công bố phục vụ hiển thị bản đồ' })
  @ApiQuery({ name: 'placeType', required: false, description: 'Lọc theo loại hình địa điểm (TEMPLE, MUSEUM, CULTURAL_SITE,...)' })
  @ApiResponse({ status: 200, description: 'Danh sách marker địa điểm có tọa độ hợp lệ', type: MapPlacesResponseDto })
  async getMapPlaces(
    @Query('placeType') placeType?: string,
  ): Promise<MapPlacesResponseDto> {
    return this.mapService.getMapPlaces(placeType);
  }
}
