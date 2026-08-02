import { Injectable } from '@nestjs/common';
import { PlaceType } from '@prisma/client';
import { MapRepository } from '../repositories/map.repository';
import { MapPlacesResponseDto, MapMarkerDto } from '../dto/response/map-marker-response.dto';

@Injectable()
export class MapService {
  constructor(private readonly repository: MapRepository) {}

  async getMapPlaces(placeType?: string): Promise<MapPlacesResponseDto> {
    let validPlaceType: PlaceType | undefined = undefined;

    if (placeType && Object.values(PlaceType).includes(placeType as PlaceType)) {
      validPlaceType = placeType as PlaceType;
    }

    const places = await this.repository.findMapPlaces({ placeType: validPlaceType });

    const markers: MapMarkerDto[] = places.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      latitude: p.latitude!,
      longitude: p.longitude!,
      placeType: p.placeType,
      shortDescription: p.summary ?? undefined,
      address: p.address ?? undefined,
      relatedHeritageCount: p.entities ? p.entities.length : 0,
    }));

    return { data: markers };
  }
}
