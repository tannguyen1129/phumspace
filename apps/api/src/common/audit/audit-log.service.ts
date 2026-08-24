import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL } from "../database/database.module";

export interface AuditEvent {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

interface AuditEventRow {
  id: string;
  actor_id: string;
  action: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, unknown> | null;
  created_at: Date;
}

function mapRow(row: AuditEventRow): AuditEvent {
  return {
    id: row.id,
    actorId: row.actor_id,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
}

/**
 * AuditLogService — ghi vet hanh dong nhay cam (MOD-*, System Design schema "ops").
 * Chi co insert/read o tang API — "bat bien" duoc dam bao boi khong bao gio expose
 * endpoint UPDATE/DELETE, chap nhan duoc o quy mo MVP.
 */
@Injectable()
export class AuditLogService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async record(input: {
    actorId: string;
    action: string;
    targetType: string;
    targetId: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.pool.query(
      `INSERT INTO ops.audit_events (actor_id, action, target_type, target_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        input.actorId,
        input.action,
        input.targetType,
        input.targetId,
        input.metadata ? JSON.stringify(input.metadata) : null,
      ]
    );
  }

  async listForTarget(targetType: string, targetId: string): Promise<AuditEvent[]> {
    const { rows } = await this.pool.query<AuditEventRow>(
      `SELECT * FROM ops.audit_events WHERE target_type = $1 AND target_id = $2 ORDER BY created_at`,
      [targetType, targetId]
    );
    return rows.map(mapRow);
  }
}
