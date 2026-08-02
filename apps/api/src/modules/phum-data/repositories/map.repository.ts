import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PlaceType, PublicationStatus } from '@prisma/client';

@Injectable()
export class MapRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMapPlaces(params: { placeType?: PlaceType }) {
    const { placeType } = params;

    const where: any = {
      mapVisibility: true,
      latitude: { not: null, gte: -90, lte: 90 },
      longitude: { not: null, gte: -180, lte: 180 },
    };

    if (placeType) {
      where.placeType = placeType;
    }

    return this.prisma.place.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        entities: {
          where: {
            entity: {
              currentVersionId: { not: null },
              currentVersion: {
                publicationStatus: PublicationStatus.PUBLISHED,
              },
            },
          },
        },
      },
    });
  }
}
