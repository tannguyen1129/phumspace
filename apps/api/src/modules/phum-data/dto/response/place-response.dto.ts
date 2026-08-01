import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlacePublicContract, PlaceSummaryContract } from '@phumspace/contracts';

export class PlaceSummaryDto implements PlaceSummaryContract {
  @ApiProperty({ example: '22222222-2222-2222-2222-222222222222' })
  id!: string;

  @ApiProperty({ example: 'phuong-8-tp-tra-vinh' })
  slug!: string;

  @ApiProperty({ example: 'Phường 8, TP. Trà Vinh' })
  name!: string;

  @ApiPropertyOptional({ example: 'Phường 8, TP. Trà Vinh, Trà Vinh' })
  address?: string;

  @ApiPropertyOptional({ example: 9.9325 })
  latitude?: number;

  @ApiPropertyOptional({ example: 106.3458 })
  longitude?: number;
}

export class PlaceResponseDto implements PlacePublicContract {
  @ApiProperty({ example: '22222222-2222-2222-2222-222222222222' })
  id!: string;

  @ApiProperty({ example: 'phuong-8-tp-tra-vinh' })
  slug!: string;

  @ApiProperty({ example: 'Phường 8, TP. Trà Vinh' })
  name!: string;

  @ApiPropertyOptional({ example: 'Phường 8, TP. Trà Vinh, Trà Vinh' })
  address?: string;

  @ApiPropertyOptional({ example: 9.9325 })
  latitude?: number;

  @ApiPropertyOptional({ example: 106.3458 })
  longitude?: number;

  @ApiPropertyOptional({ example: 'Khu vực tập trung nhiều di tích chùa cổ kính' })
  summary?: string;

  @ApiProperty({ example: '2026-08-02T02:00:00.000Z' })
  createdAt!: string;
}
