import { ApiProperty } from '@nestjs/swagger';
import { PaginatedMetaContract, PaginatedResponseContract } from '@phumspace/contracts';

export class PaginatedMetaDto implements PaginatedMetaContract {
  @ApiProperty({ example: 42, description: 'Tổng số phần tử' })
  total!: number;

  @ApiProperty({ example: 1, description: 'Trang hiện tại' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Số lượng mỗi trang' })
  limit!: number;

  @ApiProperty({ example: 5, description: 'Tổng số trang' })
  totalPages!: number;
}

export class PaginatedResponseDto<T> implements PaginatedResponseContract<T> {
  data!: T[];

  @ApiProperty({ type: PaginatedMetaDto })
  meta!: PaginatedMetaDto;
}
