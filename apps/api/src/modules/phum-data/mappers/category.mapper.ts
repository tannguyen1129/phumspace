import { CategoryResponseDto } from '../dto/response/category-response.dto';

export class CategoryMapper {
  static toPublicDto(category: any): CategoryResponseDto {
    return {
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description ?? undefined,
      createdAt: category.createdAt.toISOString(),
    };
  }
}
