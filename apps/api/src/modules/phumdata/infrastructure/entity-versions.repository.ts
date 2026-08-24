import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import type {
  PublicationStatus,
  SensitivityLevel,
  VerificationLevel,
} from "@phumspace/contracts";
import { PG_POOL } from "../../../common/database/database.module";
import type { HeritageEntityVersion } from "../domain/entity";

interface EntityVersionRow {
  id: string;
  entity_id: string;
  version_no: number;
  publication_status: PublicationStatus;
  verification_level: VerificationLevel;
  sensitivity_level: SensitivityLevel;
  preferred_label: string;
  description: string | null;
  created_by: string;
  created_at: Date;
}

function mapRow(row: EntityVersionRow): HeritageEntityVersion {
  return {
    id: row.id,
    entityId: row.entity_id,
    versionNo: row.version_no,
    publicationStatus: row.publication_status,
    verificationLevel: row.verification_level,
    sensitivityLevel: row.sensitivity_level,
    preferredLabel: row.preferred_label,
    description: row.description,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

@Injectable()
export class EntityVersionsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(input: {
    entityId: string;
    versionNo: number;
    preferredLabel: string;
    description?: string;
    sensitivityLevel: SensitivityLevel;
    createdBy: string;
  }): Promise<HeritageEntityVersion> {
    const { rows } = await this.pool.query<EntityVersionRow>(
      `INSERT INTO heritage.entity_versions
         (entity_id, version_no, preferred_label, description, sensitivity_level, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        input.entityId,
        input.versionNo,
        input.preferredLabel,
        input.description ?? null,
        input.sensitivityLevel,
        input.createdBy,
      ],
    );
    return mapRow(rows[0]);
  }

  async findById(id: string): Promise<HeritageEntityVersion | null> {
    const { rows } = await this.pool.query<EntityVersionRow>(
      `SELECT * FROM heritage.entity_versions WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async findLatestByEntityId(
    entityId: string,
  ): Promise<HeritageEntityVersion | null> {
    const { rows } = await this.pool.query<EntityVersionRow>(
      `SELECT * FROM heritage.entity_versions WHERE entity_id = $1 ORDER BY version_no DESC LIMIT 1`,
      [entityId],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async publish(
    id: string,
    verificationLevel: VerificationLevel,
  ): Promise<HeritageEntityVersion> {
    const { rows } = await this.pool.query<EntityVersionRow>(
      `UPDATE heritage.entity_versions
       SET publication_status = 'PUBLISHED', verification_level = $2
       WHERE id = $1
       RETURNING *`,
      [id, verificationLevel],
    );
    return mapRow(rows[0]);
  }

  async searchPublished(input: {
    query?: string;
    limit: number;
    offset: number;
  }): Promise<HeritageEntityVersion[]> {
    const conditions = [`publication_status = 'PUBLISHED'`];
    const params: unknown[] = [];
    if (input.query) {
      params.push(`%${input.query.trim()}%`);
      conditions.push(
        `(unaccent(lower(preferred_label)) LIKE unaccent(lower($${params.length})) OR unaccent(lower(COALESCE(description,''))) LIKE unaccent(lower($${params.length})))`,
      );
    }
    params.push(input.limit, input.offset);
    const { rows } = await this.pool.query<EntityVersionRow>(
      `SELECT * FROM heritage.entity_versions
       WHERE ${conditions.join(" AND ")}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    return rows.map(mapRow);
  }
}
