import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MapMarkerContract, MapPlacesResponseContract } from '@phumspace/contracts';

export class MapMarkerDto implements MapMarkerContract {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  id!: string;

  @ApiProperty({ example: 'phuong-8-tp-tra-vinh' })
  slug!: string;

  @ApiProperty({ example: 'Phường 8, TP. Trà Vinh' })
  name!: string;

  @ApiProperty({ example: 9.932467, description: 'Vĩ độ trong khoảng -90 đến 90' })
  latitude!: number;

  @ApiProperty({ example: 106.345759, description: 'Kinh độ trong khoảng -180 đến 180' })
  longitude!: number;

  @ApiProperty({ example: 'TEMPLE', description: 'Loại hình địa điểm' })
  placeType!: string;

  @ApiPropertyOptional({ example: 'Khu vực danh thắng Ao Bà Om và Chùa Âng cổ kính' })
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'Phường 8, TP. Trà Vinh' })
  address?: string;

  @ApiProperty({ example: 2, description: 'Số lượng di sản công bố gắn liền với địa điểm' })
  relatedHeritageCount!: number;
}

export class MapPlacesResponseDto implements MapPlacesResponseContract {
  @ApiProperty({ type: [MapMarkerDto] })
  data!: MapMarkerDto[];
}
