import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { CategoryMapper } from '../mappers/category.mapper';
import { CategoryResponseDto } from '../dto/response/category-response.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly repository: CategoryRepository) {}

  async getAllCategories(): Promise<CategoryResponseDto[]> {
    const categories = await this.repository.findAll();
    return categories.map((c) => CategoryMapper.toPublicDto(c));
  }
}
