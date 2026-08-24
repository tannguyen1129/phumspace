import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  AccessLevel,
  EntityType,
  RelationType,
  SensitivityLevel,
  VerificationLevel,
} from "@phumspace/contracts";
import { EntitiesRepository } from "../infrastructure/entities.repository";
import { EntityVersionsRepository } from "../infrastructure/entity-versions.repository";
import {
  TaxonomyRepository,
  type TaxonomyTerm,
} from "../infrastructure/taxonomy.repository";
import {
  RelationsRepository,
  type HeritageRelation,
} from "../infrastructure/relations.repository";
import {
  SourcesRepository,
  type HeritageSource,
} from "../infrastructure/sources.repository";
import { VersionSourcesRepository } from "../infrastructure/version-sources.repository";
import type {
  HeritageEntityVersion,
  HeritageEntityWithCurrentVersion,
} from "../domain/entity";

/**
 * PhumDataService — Heritage Module / PhumData Catalog (System Design Document).
 * Day la nguon su that duy nhat cua he thong: Scanner/Map/Handbook/Quiz o cac milestone
 * sau chi doc du lieu PUBLISHED tu day, khong tu suy dien tri thuc van hoa.
 */
@Injectable()
export class PhumDataService {
  constructor(
    private readonly entitiesRepository: EntitiesRepository,
    private readonly entityVersionsRepository: EntityVersionsRepository,
    private readonly taxonomyRepository: TaxonomyRepository,
    private readonly relationsRepository: RelationsRepository,
    private readonly sourcesRepository: SourcesRepository,
    private readonly versionSourcesRepository: VersionSourcesRepository,
  ) {}

  async createDraftEntity(input: {
    canonicalCode: string;
    entityType: EntityType;
    accessLevel: AccessLevel;
    preferredLabel: string;
    description?: string;
    sensitivityLevel: SensitivityLevel;
    createdBy: string;
  }): Promise<HeritageEntityWithCurrentVersion> {
    const existing = await this.entitiesRepository.findByCanonicalCode(
      input.canonicalCode,
    );
    if (existing) {
      throw new BadRequestException(
        `canonicalCode "${input.canonicalCode}" da ton tai.`,
      );
    }

    const entity = await this.entitiesRepository.create({
      canonicalCode: input.canonicalCode,
      entityType: input.entityType,
      accessLevel: input.accessLevel,
      createdBy: input.createdBy,
    });

    const version = await this.entityVersionsRepository.create({
      entityId: entity.id,
      versionNo: 1,
      preferredLabel: input.preferredLabel,
      description: input.description,
      sensitivityLevel: input.sensitivityLevel,
      createdBy: input.createdBy,
    });

    return { ...entity, currentVersion: version };
  }

  /**
   * Compensating action: xoa mot entity vua tao khi buoc tiep theo cua caller that bai giua chung
   * (vd DiscoveryService tao heritage entity thanh cong nhung insert place.places loi). CHI cho
   * xoa entity chua tung publish (currentVersionId con null) — tranh xoa nham du lieu da cong bo.
   */
  async deleteDraftEntity(entityId: string): Promise<void> {
    const entity = await this.entitiesRepository.findById(entityId);
    if (!entity) return;
    if (entity.currentVersionId) {
      throw new BadRequestException(
        "Khong the xoa entity da co phien ban duoc publish.",
      );
    }
    await this.entitiesRepository.deleteById(entityId);
  }

  async createNewVersion(input: {
    entityId: string;
    preferredLabel: string;
    description?: string;
    sensitivityLevel: SensitivityLevel;
    createdBy: string;
  }): Promise<HeritageEntityVersion> {
    const entity = await this.entitiesRepository.findById(input.entityId);
    if (!entity) throw new NotFoundException("Khong tim thay thuc the.");

    const latest = await this.entityVersionsRepository.findLatestByEntityId(
      entity.id,
    );
    const nextVersionNo = (latest?.versionNo ?? 0) + 1;

    return this.entityVersionsRepository.create({
      entityId: entity.id,
      versionNo: nextVersionNo,
      preferredLabel: input.preferredLabel,
      description: input.description,
      sensitivityLevel: input.sensitivityLevel,
      createdBy: input.createdBy,
    });
  }

  /**
   * Publish rut gon cho M1: chuyen thang version sang PUBLISHED va cap nhat entities.current_version_id.
   * Quy trinh kiem duyet day du (DRAFT -> IN_REVIEW -> APPROVED -> PUBLISHED, Reviewer/Publisher
   * tach vai tro ro rang) se den o Milestone M5 (Moderation & Publication) — xem plan.md muc 2.4.
   */
  async publishVersion(
    versionId: string,
    verificationLevel: VerificationLevel,
  ): Promise<HeritageEntityVersion> {
    const version = await this.entityVersionsRepository.findById(versionId);
    if (!version) throw new NotFoundException("Khong tim thay phien ban.");

    // "One knowledge core": moi noi dung cong khai phai truy duoc ve nguon (Phu luc D "PhumData:
    // nguon thieu" — tim thay khi dien tap nghiem thu M7). Chan publish thay vi chi trong cay
    // vao ky luat nguoi van hanh khai bao nguon truoc do.
    const sources =
      await this.versionSourcesRepository.listForVersion(versionId);
    if (sources.length === 0) {
      throw new BadRequestException(
        "Khong the cong bo: phien ban chua co nguon trich dan nao.",
      );
    }

    const published = await this.entityVersionsRepository.publish(
      versionId,
      verificationLevel,
    );
    await this.entitiesRepository.setCurrentVersion(
      version.entityId,
      versionId,
    );
    return published;
  }

  async getEntity(entityId: string): Promise<HeritageEntityWithCurrentVersion> {
    const entity = await this.entitiesRepository.findById(entityId);
    if (!entity) throw new NotFoundException("Khong tim thay thuc the.");
    const currentVersion = entity.currentVersionId
      ? await this.entityVersionsRepository.findById(entity.currentVersionId)
      : await this.entityVersionsRepository.findLatestByEntityId(entityId);
    return { ...entity, currentVersion: currentVersion ?? null };
  }

  async listEntities(input: {
    entityType?: EntityType;
    limit?: number;
    offset?: number;
  }) {
    return this.entitiesRepository.list({
      entityType: input.entityType,
      limit: input.limit ?? 20,
      offset: input.offset ?? 0,
    });
  }

  async search(input: {
    query?: string;
    limit?: number;
    offset?: number;
  }): Promise<HeritageEntityVersion[]> {
    const versions = await this.entityVersionsRepository.searchPublished({
      query: input.query,
      limit: input.limit ?? 20,
      offset: input.offset ?? 0,
    });
    const visible = await Promise.all(
      versions.map(async (version) => ({
        version,
        entity: await this.entitiesRepository.findById(version.entityId),
      })),
    );
    return visible
      .filter(
        ({ entity }) =>
          entity &&
          !["COMMUNITY_ONLY", "RESTRICTED"].includes(entity.accessLevel),
      )
      .map(({ version }) => version);
  }

  async listTaxonomy(scheme?: string): Promise<TaxonomyTerm[]> {
    return this.taxonomyRepository.listBySchema(scheme);
  }

  async attachCategory(entityId: string, termId: string): Promise<void> {
    const entity = await this.entitiesRepository.findById(entityId);
    if (!entity) throw new NotFoundException("Khong tim thay thuc the.");
    await this.taxonomyRepository.attachToEntity(entityId, termId);
  }

  async createRelation(input: {
    subjectEntityId: string;
    predicate: RelationType;
    objectEntityId: string;
    createdBy: string;
  }): Promise<HeritageRelation> {
    const [subject, object] = await Promise.all([
      this.entitiesRepository.findById(input.subjectEntityId),
      this.entitiesRepository.findById(input.objectEntityId),
    ]);
    if (!subject || !object) {
      throw new NotFoundException("Subject hoac object entity khong ton tai.");
    }
    return this.relationsRepository.create(input);
  }

  async listRelations(entityId: string): Promise<HeritageRelation[]> {
    return this.relationsRepository.listForEntity(entityId);
  }

  async createSource(input: {
    title: string;
    author?: string;
    url?: string;
    reliability?: string;
    createdBy: string;
  }): Promise<HeritageSource> {
    return this.sourcesRepository.create(input);
  }

  async listSources(limit = 20, offset = 0): Promise<HeritageSource[]> {
    return this.sourcesRepository.list(limit, offset);
  }

  async attachSourceToVersion(
    entityVersionId: string,
    sourceId: string,
  ): Promise<void> {
    const version =
      await this.entityVersionsRepository.findById(entityVersionId);
    if (!version) throw new NotFoundException("Khong tim thay phien ban.");
    await this.versionSourcesRepository.attach(entityVersionId, sourceId);
  }

  async listSourcesForVersion(
    entityVersionId: string,
  ): Promise<HeritageSource[]> {
    return this.versionSourcesRepository.listForVersion(entityVersionId);
  }
}
