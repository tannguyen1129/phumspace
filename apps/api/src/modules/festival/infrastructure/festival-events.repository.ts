import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL } from "../../../common/database/database.module";
import type { FestivalEvent } from "../domain/festival";

interface FestivalEventRow {
  id: string;
  occurrence_id: string;
  event_type: string;
  title: string;
  scheduled_at: Date | null;
  note: string | null;
  created_at: Date;
}

function mapRow(row: FestivalEventRow): FestivalEvent {
  return {
    id: row.id,
    occurrenceId: row.occurrence_id,
    eventType: row.event_type,
    title: row.title,
    scheduledAt: row.scheduled_at,
    note: row.note,
    createdAt: row.created_at,
  };
}

@Injectable()
export class FestivalEventsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(input: {
    occurrenceId: string;
    eventType: string;
    title: string;
    scheduledAt?: Date;
    note?: string;
  }): Promise<FestivalEvent> {
    const { rows } = await this.pool.query<FestivalEventRow>(
      `INSERT INTO place.festival_events (occurrence_id, event_type, title, scheduled_at, note)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [input.occurrenceId, input.eventType, input.title, input.scheduledAt ?? null, input.note ?? null]
    );
    return mapRow(rows[0]);
  }

  async listForOccurrence(occurrenceId: string): Promise<FestivalEvent[]> {
    const { rows } = await this.pool.query<FestivalEventRow>(
      `SELECT * FROM place.festival_events WHERE occurrence_id = $1 ORDER BY scheduled_at NULLS LAST, created_at`,
      [occurrenceId]
    );
    return rows.map(mapRow);
  }

  async listForOccurrences(occurrenceIds: string[]): Promise<Map<string, FestivalEvent[]>> {
    if (occurrenceIds.length === 0) return new Map();
    const { rows } = await this.pool.query<FestivalEventRow>(
      `SELECT * FROM place.festival_events WHERE occurrence_id = ANY($1) ORDER BY scheduled_at NULLS LAST, created_at`,
      [occurrenceIds]
    );
    const map = new Map<string, FestivalEvent[]>();
    for (const row of rows) {
      const event = mapRow(row);
      const list = map.get(event.occurrenceId) ?? [];
      list.push(event);
      map.set(event.occurrenceId, list);
    }
    return map;
  }
}
