import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL } from "../../../common/database/database.module";
export interface PrivacyRequest {
  id: string;
  userId: string;
  requestType: "EXPORT" | "DELETE";
  status: string;
  dueAt: Date;
  completedAt: Date | null;
  resultPayload: unknown;
  createdAt: Date;
}
interface PrivacyRequestRow {
  id: string;
  user_id: string;
  request_type: "EXPORT" | "DELETE";
  status: string;
  due_at: Date;
  completed_at: Date | null;
  result_payload: unknown;
  created_at: Date;
}
@Injectable()
export class PrivacyRequestsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}
  async create(
    userId: string,
    type: "EXPORT" | "DELETE",
    dueAt: Date,
  ): Promise<PrivacyRequest> {
    const { rows } = await this.pool.query(
      `INSERT INTO ops.privacy_requests(user_id,request_type,due_at) VALUES($1,$2,$3) RETURNING *`,
      [userId, type, dueAt],
    );
    return map(rows[0]);
  }
  async list(userId: string): Promise<PrivacyRequest[]> {
    const { rows } = await this.pool.query(
      `SELECT * FROM ops.privacy_requests WHERE user_id=$1 ORDER BY created_at DESC`,
      [userId],
    );
    return rows.map(map);
  }
  async findOwned(id: string, userId: string): Promise<PrivacyRequest | null> {
    const { rows } = await this.pool.query(
      `SELECT * FROM ops.privacy_requests WHERE id=$1 AND user_id=$2`,
      [id, userId],
    );
    return rows[0] ? map(rows[0]) : null;
  }
  async complete(id: string, payload?: unknown): Promise<void> {
    await this.pool.query(
      `UPDATE ops.privacy_requests SET status='COMPLETED',completed_at=now(),result_payload=$2,updated_at=now() WHERE id=$1`,
      [id, payload ? JSON.stringify(payload) : null],
    );
  }
  async cancel(id: string, userId: string): Promise<boolean> {
    const result = await this.pool.query(
      `UPDATE ops.privacy_requests SET status='CANCELLED',updated_at=now() WHERE id=$1 AND user_id=$2 AND status='REQUESTED'`,
      [id, userId],
    );
    return (result.rowCount ?? 0) > 0;
  }
}
function map(row: PrivacyRequestRow): PrivacyRequest {
  return {
    id: row.id,
    userId: row.user_id,
    requestType: row.request_type,
    status: row.status,
    dueAt: row.due_at,
    completedAt: row.completed_at,
    resultPayload: row.result_payload,
    createdAt: row.created_at,
  };
}
