import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import type { FollowTargetType, NotificationPriority } from "@phumspace/contracts";
import { PG_POOL } from "../../../common/database/database.module";
import type { Notification } from "../domain/notification";

interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  target_type: FollowTargetType | null;
  target_id: string | null;
  expires_at: Date | null;
  created_at: Date;
  read_at: Date | null;
}

function mapRow(row: NotificationRow): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    body: row.body,
    priority: row.priority,
    targetType: row.target_type,
    targetId: row.target_id,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

@Injectable()
export class NotificationsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async createMany(
    userIds: string[],
    input: {
      title: string;
      body: string;
      priority: NotificationPriority;
      targetType?: FollowTargetType;
      targetId?: string;
      expiresAt?: Date;
    }
  ): Promise<number> {
    if (userIds.length === 0) return 0;
    const { rowCount } = await this.pool.query(
      `INSERT INTO ops.notifications (user_id, title, body, priority, target_type, target_id, expires_at)
       SELECT unnest($1::uuid[]), $2, $3, $4, $5, $6, $7`,
      [
        userIds,
        input.title,
        input.body,
        input.priority,
        input.targetType ?? null,
        input.targetId ?? null,
        input.expiresAt ?? null,
      ]
    );
    return rowCount ?? 0;
  }

  async listForUser(userId: string): Promise<Notification[]> {
    const { rows } = await this.pool.query<NotificationRow>(
      `SELECT * FROM ops.notifications
       WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > now())
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows.map(mapRow);
  }

  async markRead(id: string, userId: string): Promise<void> {
    await this.pool.query(
      `UPDATE ops.notifications SET read_at = now() WHERE id = $1 AND user_id = $2 AND read_at IS NULL`,
      [id, userId]
    );
  }
}
