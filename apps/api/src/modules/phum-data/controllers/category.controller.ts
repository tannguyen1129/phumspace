import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoryService } from '../services/category.service';
import { CategoryResponseDto } from '../dto/response/category-response.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Truy vấn danh sách tất cả danh mục di sản văn hóa' })
  @ApiResponse({ status: 200, description: 'Danh sách danh mục di sản', type: [CategoryResponseDto] })
  async getAllCategories(): Promise<CategoryResponseDto[]> {
    return this.service.getAllCategories();
  }
}
