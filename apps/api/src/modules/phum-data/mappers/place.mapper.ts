import { PlaceResponseDto } from '../dto/response/place-response.dto';

export class PlaceMapper {
  static toPublicDto(place: any): PlaceResponseDto {
    return {
      id: place.id,
      slug: place.slug,
      name: place.name,
      address: place.address ?? undefined,
      latitude: place.latitude ?? undefined,
      longitude: place.longitude ?? undefined,
      summary: place.summary ?? undefined,
      createdAt: place.createdAt.toISOString(),
    };
  }
}
