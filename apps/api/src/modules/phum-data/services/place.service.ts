import { Injectable, NotFoundException } from '@nestjs/common';
import { PlaceRepository } from '../repositories/place.repository';
import { PlaceMapper } from '../mappers/place.mapper';
import { PlaceResponseDto } from '../dto/response/place-response.dto';

@Injectable()
export class PlaceService {
  constructor(private readonly repository: PlaceRepository) {}

  async getAllPlaces(): Promise<PlaceResponseDto[]> {
    const places = await this.repository.findAll();
    return places.map((p) => PlaceMapper.toPublicDto(p));
  }

  async getBySlug(slug: string): Promise<PlaceResponseDto> {
    const place = await this.repository.findBySlug(slug);
    if (!place) {
      throw new NotFoundException(`Place with slug '${slug}' not found.`);
    }

    return PlaceMapper.toPublicDto(place);
  }
}
