import { Injectable, NotFoundException } from '@nestjs/common';
import { HeritageEntityRepository } from '../repositories/heritage-entity.repository';
import { QueryHeritageEntityDto } from '../dto/query-heritage-entity.dto';
import { HeritageEntityMapper } from '../mappers/heritage-entity.mapper';
import { PaginatedResponseDto } from '../../../common/dto/api-response.dto';
import { HeritageEntityResponseDto } from '../dto/response/heritage-entity-response.dto';

@Injectable()
export class HeritageEntityService {
  constructor(private readonly repository: HeritageEntityRepository) {}

  async getPublishedEntities(query: QueryHeritageEntityDto): Promise<PaginatedResponseDto<HeritageEntityResponseDto>> {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const { total, items } = await this.repository.findPublishedPaginated({
      page,
      limit,
      categorySlug: query.categorySlug,
      placeSlug: query.placeSlug,
    });

    const dtos = items
      .map((item) => HeritageEntityMapper.toPublicDto(item))
      .filter((dto): dto is HeritageEntityResponseDto => dto !== null);

    const totalPages = Math.ceil(total / limit) || 0;

    return {
      data: dtos,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getPublishedBySlug(slug: string): Promise<HeritageEntityResponseDto> {
    const entity = await this.repository.findPublishedBySlug(slug);
    if (!entity) {
      throw new NotFoundException(`Heritage entity with slug '${slug}' not found or not published.`);
    }

    const dto = HeritageEntityMapper.toPublicDto(entity);
    if (!dto) {
      throw new NotFoundException(`Heritage entity with slug '${slug}' not found or not published.`);
    }

    return dto;
  }
}
