import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PlaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.place.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.place.findUnique({
      where: { slug },
    });
  }
}
