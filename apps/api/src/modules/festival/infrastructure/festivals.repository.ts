import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL } from "../../../common/database/database.module";
import type { Festival } from "../domain/festival";

interface FestivalRow {
  id: string;
  entity_id: string;
  recurrence_rule: string | null;
  organizer_org_id: string | null;
  created_at: Date;
}

function mapRow(row: FestivalRow): Festival {
  return {
    id: row.id,
    entityId: row.entity_id,
    recurrenceRule: row.recurrence_rule,
    organizerOrgId: row.organizer_org_id,
    createdAt: row.created_at,
  };
}

@Injectable()
export class FestivalsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(input: { entityId: string; recurrenceRule?: string; organizerOrgId?: string }): Promise<Festival> {
    const { rows } = await this.pool.query<FestivalRow>(
      `INSERT INTO place.festivals (entity_id, recurrence_rule, organizer_org_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [input.entityId, input.recurrenceRule ?? null, input.organizerOrgId ?? null]
    );
    return mapRow(rows[0]);
  }

  async findByEntityId(entityId: string): Promise<Festival | null> {
    const { rows } = await this.pool.query<FestivalRow>(
      `SELECT * FROM place.festivals WHERE entity_id = $1`,
      [entityId]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async findById(id: string): Promise<Festival | null> {
    const { rows } = await this.pool.query<FestivalRow>(`SELECT * FROM place.festivals WHERE id = $1`, [id]);
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async listAll(): Promise<Festival[]> {
    const { rows } = await this.pool.query<FestivalRow>(`SELECT * FROM place.festivals ORDER BY created_at DESC`);
    return rows.map(mapRow);
  }
}
