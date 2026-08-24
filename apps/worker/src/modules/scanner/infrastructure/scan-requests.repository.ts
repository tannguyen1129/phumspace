import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL } from "../../../common/database/database.module";

export interface ScanRequestRecord {
  id: string;
  userId: string;
  mediaKey: string;
  mimeType: string;
  placeId: string | null;
}

interface ScanRequestRow {
  id: string;
  user_id: string;
  media_key: string;
  mime_type: string;
  place_id: string | null;
}

/** Ghi trang thai vong doi scan_request — doi lap voi ban chi-doc o apps/api (worker moi la noi xu ly that). */
@Injectable()
export class ScanRequestsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findById(id: string): Promise<ScanRequestRecord | null> {
    const { rows } = await this.pool.query<ScanRequestRow>(
      `SELECT id, user_id, media_key, mime_type, place_id FROM scanner.scan_requests WHERE id = $1`,
      [id],
    );
    if (!rows[0]) return null;
    return {
      id: rows[0].id,
      userId: rows[0].user_id,
      mediaKey: rows[0].media_key,
      mimeType: rows[0].mime_type,
      placeId: rows[0].place_id,
    };
  }

  async markProcessing(id: string): Promise<void> {
    await this.pool.query(
      `UPDATE scanner.scan_requests SET status = 'PROCESSING', updated_at = now() WHERE id = $1`,
      [id],
    );
  }

  async markCompleted(id: string): Promise<void> {
    await this.pool.query(
      `UPDATE scanner.scan_requests SET status = 'COMPLETED', updated_at = now() WHERE id = $1`,
      [id],
    );
  }

  async markFailed(id: string, errorMessage: string): Promise<void> {
    await this.pool.query(
      `UPDATE scanner.scan_requests SET status = 'FAILED', error_message = $2, updated_at = now() WHERE id = $1`,
      [id, errorMessage],
    );
  }
}
