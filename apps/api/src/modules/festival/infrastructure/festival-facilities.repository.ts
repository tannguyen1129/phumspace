import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import type { FestivalFacilityType } from "@phumspace/contracts";
import { PG_POOL } from "../../../common/database/database.module";
import type { FestivalFacility } from "../domain/festival";

interface FestivalFacilityRow {
  id: string;
  occurrence_id: string;
  facility_type: FestivalFacilityType;
  note: string | null;
  latitude: number | null;
  longitude: number | null;
}

function mapRow(row: FestivalFacilityRow): FestivalFacility {
  return {
    id: row.id,
    occurrenceId: row.occurrence_id,
    facilityType: row.facility_type,
    note: row.note,
    latitude: row.latitude,
    longitude: row.longitude,
  };
}

@Injectable()
export class FestivalFacilitiesRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(input: {
    occurrenceId: string;
    facilityType: FestivalFacilityType;
    note?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<FestivalFacility> {
    const { rows } = await this.pool.query<FestivalFacilityRow>(
      `INSERT INTO place.festival_facilities (occurrence_id, facility_type, note, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [input.occurrenceId, input.facilityType, input.note ?? null, input.latitude ?? null, input.longitude ?? null]
    );
    return mapRow(rows[0]);
  }

  async listForOccurrences(occurrenceIds: string[]): Promise<Map<string, FestivalFacility[]>> {
    if (occurrenceIds.length === 0) return new Map();
    const { rows } = await this.pool.query<FestivalFacilityRow>(
      `SELECT * FROM place.festival_facilities WHERE occurrence_id = ANY($1) ORDER BY facility_type`,
      [occurrenceIds]
    );
    const map = new Map<string, FestivalFacility[]>();
    for (const row of rows) {
      const facility = mapRow(row);
      const list = map.get(facility.occurrenceId) ?? [];
      list.push(facility);
      map.set(facility.occurrenceId, list);
    }
    return map;
  }
}
