import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import type { AccessLevel, EntityType } from "@phumspace/contracts";
import { PG_POOL } from "../../../common/database/database.module";
import type { HeritageEntity } from "../domain/entity";

interface EntityRow {
  id: string;
  canonical_code: string;
  entity_type: EntityType;
  access_level: AccessLevel;
  current_version_id: string | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

function mapRow(row: EntityRow): HeritageEntity {
  return {
    id: row.id,
    canonicalCode: row.canonical_code,
    entityType: row.entity_type,
    accessLevel: row.access_level,
    currentVersionId: row.current_version_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

@Injectable()
export class EntitiesRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(input: {
    canonicalCode: string;
    entityType: EntityType;
    accessLevel: AccessLevel;
    createdBy: string;
  }): Promise<HeritageEntity> {
    const { rows } = await this.pool.query<EntityRow>(
      `INSERT INTO heritage.entities (canonical_code, entity_type, access_level, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.canonicalCode, input.entityType, input.accessLevel, input.createdBy]
    );
    return mapRow(rows[0]);
  }

  async findById(id: string): Promise<HeritageEntity | null> {
    const { rows } = await this.pool.query<EntityRow>(`SELECT * FROM heritage.entities WHERE id = $1`, [
      id,
    ]);
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async findByCanonicalCode(canonicalCode: string): Promise<HeritageEntity | null> {
    const { rows } = await this.pool.query<EntityRow>(
      `SELECT * FROM heritage.entities WHERE canonical_code = $1`,
      [canonicalCode]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  /** Xoa cung — chi dung cho compensating action khi tao entity that bai giua chung (xem PhumDataService.deleteDraftEntity). */
  async deleteById(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM heritage.entities WHERE id = $1`, [id]);
  }

  async setCurrentVersion(entityId: string, versionId: string): Promise<void> {
    await this.pool.query(
      `UPDATE heritage.entities SET current_version_id = $2, updated_at = now() WHERE id = $1`,
      [entityId, versionId]
    );
  }

  async list(input: { entityType?: EntityType; limit: number; offset: number }): Promise<HeritageEntity[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (input.entityType) {
      params.push(input.entityType);
      conditions.push(`entity_type = $${params.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    params.push(input.limit, input.offset);
    const { rows } = await this.pool.query<EntityRow>(
      `SELECT * FROM heritage.entities ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return rows.map(mapRow);
  }
}
