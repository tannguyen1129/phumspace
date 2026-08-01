import { HeritageEntityResponseDto, HeritageNameDto } from '../dto/response/heritage-entity-response.dto';
import { HeritageCategorySummaryDto } from '../dto/response/category-response.dto';
import { PlaceSummaryDto } from '../dto/response/place-response.dto';

export class HeritageEntityMapper {
  static toPublicDto(entity: any): HeritageEntityResponseDto | null {
    if (!entity || !entity.currentVersion) {
      return null;
    }

    const version = entity.currentVersion;

    const names: HeritageNameDto[] = (version.names || []).map((n: any) => ({
      language: n.language,
      nameType: n.nameType,
      originalValue: n.originalValue,
      normalizedValue: n.normalizedValue,
      script: n.script ?? undefined,
    }));

    const categories: HeritageCategorySummaryDto[] = (entity.categories || [])
      .map((c: any) => c.category)
      .filter(Boolean)
      .map((cat: any) => ({
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
      }));

    const places: PlaceSummaryDto[] = (entity.places || [])
      .map((p: any) => p.place)
      .filter(Boolean)
      .map((pl: any) => ({
        id: pl.id,
        slug: pl.slug,
        name: pl.name,
        address: pl.address ?? undefined,
        latitude: pl.latitude ?? undefined,
        longitude: pl.longitude ?? undefined,
      }));

    return {
      id: entity.id,
      slug: entity.canonicalCode,
      type: entity.type,
      summary: version.summary,
      historicalContent: version.historicalContent ?? undefined,
      culturalMeaning: version.culturalMeaning ?? undefined,
      names,
      categories,
      places,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
