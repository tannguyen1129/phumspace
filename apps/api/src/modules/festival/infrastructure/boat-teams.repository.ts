import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL } from "../../../common/database/database.module";
import type { BoatTeam } from "../domain/festival";

interface BoatTeamRow {
  id: string;
  organization_id: string | null;
  display_name: string;
  home_place_id: string | null;
  symbol_color: string | null;
  story: string | null;
  created_by: string;
  created_at: Date;
}

function mapRow(row: BoatTeamRow): BoatTeam {
  return {
    id: row.id,
    organizationId: row.organization_id,
    displayName: row.display_name,
    homePlaceId: row.home_place_id,
    symbolColor: row.symbol_color,
    story: row.story,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

/**
 * BoatTeamsRepository — FR-FES-004: ho so doi ghe Ngo (ten, dia phuong, mau sac, cau chuyen).
 * Khong co truong thanh vien ca nhan — xem ghi chu tai migration 1700000013000_festival-full.
 */
@Injectable()
export class BoatTeamsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(input: {
    displayName: string;
    organizationId?: string;
    homePlaceId?: string;
    symbolColor?: string;
    story?: string;
    createdBy: string;
  }): Promise<BoatTeam> {
    const { rows } = await this.pool.query<BoatTeamRow>(
      `INSERT INTO place.boat_teams (display_name, organization_id, home_place_id, symbol_color, story, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        input.displayName,
        input.organizationId ?? null,
        input.homePlaceId ?? null,
        input.symbolColor ?? null,
        input.story ?? null,
        input.createdBy,
      ]
    );
    return mapRow(rows[0]);
  }

  async findById(id: string): Promise<BoatTeam | null> {
    const { rows } = await this.pool.query<BoatTeamRow>(`SELECT * FROM place.boat_teams WHERE id = $1`, [id]);
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async list(): Promise<BoatTeam[]> {
    const { rows } = await this.pool.query<BoatTeamRow>(`SELECT * FROM place.boat_teams ORDER BY created_at DESC`);
    return rows.map(mapRow);
  }
}
