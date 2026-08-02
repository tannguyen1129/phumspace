import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PublicationStatus, AccessLevel, LanguageCode, NameType } from '@prisma/client';
import { PhumDataCandidateBundle, VisualObservationResult } from '../interfaces/ai-provider.interface';

@Injectable()
export class CandidateRetrievalService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublishedCandidates(
    observation: VisualObservationResult,
  ): Promise<PhumDataCandidateBundle[]> {
    // Retrieve published entities from DB
    const entities = await this.prisma.heritageEntity.findMany({
      where: {
        accessLevel: AccessLevel.PUBLIC,
        currentVersionId: { not: null },
        currentVersion: {
          publicationStatus: PublicationStatus.PUBLISHED,
        },
      },
      include: {
        currentVersion: {
          include: {
            names: true,
            evidenceAssertions: {
              include: {
                source: true,
              },
            },
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
      take: 10,
    });

    const candidates: PhumDataCandidateBundle[] = entities
      .filter((e) => e.currentVersion !== null)
      .map((e) => {
        const v = e.currentVersion!;
        const prefVi =
          v.names.find((n) => n.language === LanguageCode.vi && n.nameType === NameType.PREFERRED)?.originalValue || e.canonicalCode;
        const prefKm = v.names.find((n) => n.language === LanguageCode.km)?.originalValue;

        const sourcesMap = new Map<string, { id: string; title: string; creator?: string; locator?: string }>();
        v.evidenceAssertions.forEach((ea) => {
          if (ea.source) {
            sourcesMap.set(ea.source.id, {
              id: ea.source.id,
              title: ea.source.title,
              creator: ea.source.creator ?? undefined,
              locator: ea.source.locator ?? undefined,
            });
          }
        });

        return {
          entityId: e.id,
          slug: e.canonicalCode,
          canonicalCode: e.canonicalCode,
          type: e.type,
          preferredViName: prefVi,
          preferredKmName: prefKm,
          summary: v.summary,
          culturalMeaning: v.culturalMeaning ?? undefined,
          categories: e.categories.map((c) => c.category.name),
          places: e.places.map((p) => p.place.name),
          sources: Array.from(sourcesMap.values()),
        };
      });

    // Score & Rank Candidates against visual keywords
    const keywords = [
      ...observation.objectTypes,
      ...observation.visibleFeatures,
      ...observation.architecturalElements,
      ...(observation.visibleText ? [observation.visibleText.toLowerCase()] : []),
    ];

    const scored = candidates.map((cand) => {
      let score = 0;
      const textToSearch = `${cand.preferredViName} ${cand.preferredKmName || ''} ${cand.summary} ${cand.categories.join(' ')} ${cand.places.join(' ')}`.toLowerCase();

      keywords.forEach((kw) => {
        if (kw && textToSearch.includes(kw.toLowerCase())) {
          score += 2;
        }
      });

      return { candidate: cand, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Limit to top 5 candidates
    return scored.slice(0, 5).map((item) => item.candidate);
  }
}
