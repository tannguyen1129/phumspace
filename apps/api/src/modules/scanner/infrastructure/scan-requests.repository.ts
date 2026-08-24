import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import type { ScanRequestStatus } from "@phumspace/contracts";
import { PG_POOL } from "../../../common/database/database.module";
import type { ScanRequest } from "../domain/scan";

interface ScanRequestRow {
  id: string;
  user_id: string;
  media_key: string;
  mime_type: string;
  place_id: string | null;
  status: ScanRequestStatus;
  error_message: string | null;
  created_at: Date;
  updated_at: Date;
}

function mapRow(row: ScanRequestRow): ScanRequest {
  return {
    id: row.id,
    userId: row.user_id,
    mediaKey: row.media_key,
    mimeType: row.mime_type,
    placeId: row.place_id,
    status: row.status,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

@Injectable()
export class ScanRequestsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(input: {
    userId: string;
    mediaKey: string;
    mimeType: string;
    placeId?: string;
  }): Promise<ScanRequest> {
    const { rows } = await this.pool.query<ScanRequestRow>(
      `INSERT INTO scanner.scan_requests (user_id, media_key, mime_type, place_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.userId, input.mediaKey, input.mimeType, input.placeId ?? null],
    );
    return mapRow(rows[0]);
  }

  async findById(id: string): Promise<ScanRequest | null> {
    const { rows } = await this.pool.query<ScanRequestRow>(
      `SELECT * FROM scanner.scan_requests WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  /** Lich su quet cua 1 user, moi nhat truoc (FR-PER-002). */
  async listForUser(userId: string): Promise<ScanRequest[]> {
    const { rows } = await this.pool.query<ScanRequestRow>(
      `SELECT * FROM scanner.scan_requests WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
    return rows.map(mapRow);
  }

  /** Xoa that 1 ban ghi — scan_results cascade theo FK (ON DELETE CASCADE). */
  async delete(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM scanner.scan_requests WHERE id = $1`, [
      id,
    ]);
  }
}
