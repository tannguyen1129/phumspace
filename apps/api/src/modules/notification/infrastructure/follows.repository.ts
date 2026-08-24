import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import type { FollowTargetType } from "@phumspace/contracts";
import { PG_POOL } from "../../../common/database/database.module";
import type { Follow } from "../domain/notification";

interface FollowRow {
  id: string;
  user_id: string;
  target_type: FollowTargetType;
  target_id: string;
  created_at: Date;
}

function mapRow(row: FollowRow): Follow {
  return {
    id: row.id,
    userId: row.user_id,
    targetType: row.target_type,
    targetId: row.target_id,
    createdAt: row.created_at,
  };
}

@Injectable()
export class FollowsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async follow(userId: string, targetType: FollowTargetType, targetId: string): Promise<Follow> {
    const { rows } = await this.pool.query<FollowRow>(
      `INSERT INTO experience.follows (user_id, target_type, target_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, target_type, target_id) DO UPDATE SET user_id = EXCLUDED.user_id
       RETURNING *`,
      [userId, targetType, targetId]
    );
    return mapRow(rows[0]);
  }

  async unfollow(userId: string, targetType: FollowTargetType, targetId: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM experience.follows WHERE user_id = $1 AND target_type = $2 AND target_id = $3`,
      [userId, targetType, targetId]
    );
  }

  async isFollowing(userId: string, targetType: FollowTargetType, targetId: string): Promise<boolean> {
    const { rows } = await this.pool.query(
      `SELECT 1 FROM experience.follows WHERE user_id = $1 AND target_type = $2 AND target_id = $3`,
      [userId, targetType, targetId]
    );
    return rows.length > 0;
  }

  async listForUser(userId: string): Promise<Follow[]> {
    const { rows } = await this.pool.query<FollowRow>(
      `SELECT * FROM experience.follows WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return rows.map(mapRow);
  }

  /** Danh sach user_id dang theo doi 1 target — dung de broadcast (FR-FES-003/006). */
  async listFollowerIds(targetType: FollowTargetType, targetId: string): Promise<string[]> {
    const { rows } = await this.pool.query<{ user_id: string }>(
      `SELECT user_id FROM experience.follows WHERE target_type = $1 AND target_id = $2`,
      [targetType, targetId]
    );
    return rows.map((row) => row.user_id);
  }
}
