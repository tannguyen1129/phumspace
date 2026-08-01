import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PublicationStatus } from '@prisma/client';

@Injectable()
export class HeritageEntityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPublishedPaginated(params: {
    page: number;
    limit: number;
    categorySlug?: string;
    placeSlug?: string;
  }) {
    const { page, limit, categorySlug, placeSlug } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      currentVersionId: { not: null },
      currentVersion: {
        publicationStatus: PublicationStatus.PUBLISHED,
      },
    };

    if (categorySlug) {
      where.categories = {
        some: {
          category: {
            slug: categorySlug,
          },
        },
      };
    }

    if (placeSlug) {
      where.places = {
        some: {
          place: {
            slug: placeSlug,
          },
        },
      };
    }

    const [total, items] = await Promise.all([
      this.prisma.heritageEntity.count({ where }),
      this.prisma.heritageEntity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          currentVersion: {
            include: {
              names: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
          places: {
            include: {
              place: true,
            },
          },
        },
      }),
    ]);

    return { total, items };
  }

  async findPublishedBySlug(slug: string) {
    return this.prisma.heritageEntity.findFirst({
      where: {
        canonicalCode: slug,
        currentVersionId: { not: null },
        currentVersion: {
          publicationStatus: PublicationStatus.PUBLISHED,
        },
      },
      include: {
        currentVersion: {
          include: {
            names: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        places: {
          include: {
            place: true,
          },
        },
      },
    });
  }
}
