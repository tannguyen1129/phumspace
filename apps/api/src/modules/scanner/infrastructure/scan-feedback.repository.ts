import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL } from "../../../common/database/database.module";
export type ScanFeedbackType =
  | "CORRECT"
  | "INCORRECT"
  | "UNSURE"
  | "SELECTED_CANDIDATE"
  | "REQUEST_REVIEW";
@Injectable()
export class ScanFeedbackRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}
  async create(input: {
    scanRequestId: string;
    userId: string;
    feedbackType: ScanFeedbackType;
    selectedEntityId?: string;
    note?: string;
  }) {
    const { rows } = await this.pool.query(
      `INSERT INTO scanner.scan_feedback(scan_request_id,user_id,feedback_type,selected_entity_id,note) VALUES($1,$2,$3,$4,$5) RETURNING id,feedback_type,selected_entity_id,created_at`,
      [
        input.scanRequestId,
        input.userId,
        input.feedbackType,
        input.selectedEntityId ?? null,
        input.note ?? null,
      ],
    );
    return rows[0];
  }
}
