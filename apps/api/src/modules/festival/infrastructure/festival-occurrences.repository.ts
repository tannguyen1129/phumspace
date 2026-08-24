import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import type { FestivalOccurrenceStatus } from "@phumspace/contracts";
import { PG_POOL } from "../../../common/database/database.module";
import type { FestivalOccurrence } from "../domain/festival";

interface FestivalOccurrenceRow {
  id: string;
  festival_id: string;
  place_id: string | null;
  starts_at: Date;
  ends_at: Date | null;
  status: FestivalOccurrenceStatus;
  created_at: Date;
}

function mapRow(row: FestivalOccurrenceRow): FestivalOccurrence {
  return {
    id: row.id,
    festivalId: row.festival_id,
    placeId: row.place_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    createdAt: row.created_at,
  };
}

@Injectable()
export class FestivalOccurrencesRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(input: {
    festivalId: string;
    placeId?: string;
    startsAt: Date;
    endsAt?: Date;
    status?: FestivalOccurrenceStatus;
  }): Promise<FestivalOccurrence> {
    const { rows } = await this.pool.query<FestivalOccurrenceRow>(
      `INSERT INTO place.festival_occurrences (festival_id, place_id, starts_at, ends_at, status)
       VALUES ($1, $2, $3, $4, COALESCE($5, 'PLANNED'))
       RETURNING *`,
      [input.festivalId, input.placeId ?? null, input.startsAt, input.endsAt ?? null, input.status ?? null]
    );
    return mapRow(rows[0]);
  }

  async listForFestival(festivalId: string): Promise<FestivalOccurrence[]> {
    const { rows } = await this.pool.query<FestivalOccurrenceRow>(
      `SELECT * FROM place.festival_occurrences WHERE festival_id = $1 ORDER BY starts_at`,
      [festivalId]
    );
    return rows.map(mapRow);
  }

  async findById(id: string): Promise<FestivalOccurrence | null> {
    const { rows } = await this.pool.query<FestivalOccurrenceRow>(
      `SELECT * FROM place.festival_occurrences WHERE id = $1`,
      [id]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  /** FR-FES-003: cap nhat trang thai du kien/xac nhan/hoan/huy — lich su thay doi ghi qua ops.audit_events o service. */
  async updateStatus(id: string, status: FestivalOccurrenceStatus): Promise<FestivalOccurrence> {
    const { rows } = await this.pool.query<FestivalOccurrenceRow>(
      `UPDATE place.festival_occurrences SET status = $2 WHERE id = $1 RETURNING *`,
      [id, status]
    );
    return mapRow(rows[0]);
  }

  /** Lan to chuc sap toi gan nhat trong tat ca le hoi — dung cho danh sach tom tat (FR-FES-001). */
  async findNextUpcomingByFestivalIds(festivalIds: string[]): Promise<Map<string, Date>> {
    if (festivalIds.length === 0) return new Map();
    const { rows } = await this.pool.query<{ festival_id: string; starts_at: Date }>(
      `SELECT DISTINCT ON (festival_id) festival_id, starts_at
       FROM place.festival_occurrences
       WHERE festival_id = ANY($1) AND status IN ('PLANNED', 'CONFIRMED')
       ORDER BY festival_id, starts_at`,
      [festivalIds]
    );
    return new Map(rows.map((row) => [row.festival_id, row.starts_at]));
  }
}
