import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import type { LearningProgressStatus } from "@phumspace/contracts";
import { PG_POOL } from "../../../common/database/database.module";
import type { LearningProgress } from "../domain/term";

interface LearningProgressRow {
  id: string;
  user_id: string;
  term_id: string;
  status: LearningProgressStatus;
  review_count: number;
  last_reviewed_at: Date | null;
  next_review_at: Date | null;
  last_result: string | null;
}

function mapRow(row: LearningProgressRow): LearningProgress {
  return {
    id: row.id,
    userId: row.user_id,
    termId: row.term_id,
    status: row.status,
    reviewCount: row.review_count,
    lastReviewedAt: row.last_reviewed_at,
    nextReviewAt: row.next_review_at,
    lastResult: row.last_result,
  };
}

@Injectable()
export class LearningProgressRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async upsert(userId: string, termId: string, status: LearningProgressStatus): Promise<LearningProgress> {
    const { rows } = await this.pool.query<LearningProgressRow>(
      `INSERT INTO handbook.learning_progress (user_id, term_id, status, review_count, last_reviewed_at)
       VALUES ($1, $2, $3, 1, now())
       ON CONFLICT (user_id, term_id) DO UPDATE SET
         status = EXCLUDED.status,
         review_count = handbook.learning_progress.review_count + 1,
         last_reviewed_at = now(),
         updated_at = now()
       RETURNING *`,
      [userId, termId, status]
    );
    return mapRow(rows[0]);
  }

  async recordPractice(userId: string, termId: string, result: "AGAIN" | "HARD" | "GOOD"): Promise<LearningProgress> {
    const days = result === "GOOD" ? 7 : result === "HARD" ? 2 : 0;
    const { rows } = await this.pool.query<LearningProgressRow>(
      `INSERT INTO handbook.learning_progress (user_id, term_id, status, review_count, last_reviewed_at, next_review_at, last_result)
       VALUES ($1, $2, 'LEARNING', 1, now(), now() + ($3 || ' days')::interval, $4)
       ON CONFLICT (user_id, term_id) DO UPDATE SET
         status = CASE WHEN $4 = 'GOOD' AND handbook.learning_progress.review_count >= 2 THEN 'LEARNED' ELSE 'LEARNING' END,
         review_count = handbook.learning_progress.review_count + 1,
         last_reviewed_at = now(), next_review_at = now() + ($3 || ' days')::interval,
         last_result = $4, updated_at = now()
       RETURNING *`,
      [userId, termId, String(days), result]
    );
    return mapRow(rows[0]);
  }

  async findForUser(userId: string, termId: string): Promise<LearningProgress | null> {
    const { rows } = await this.pool.query<LearningProgressRow>(
      `SELECT * FROM handbook.learning_progress WHERE user_id = $1 AND term_id = $2`,
      [userId, termId]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async listForUser(userId: string): Promise<LearningProgress[]> {
    const { rows } = await this.pool.query<LearningProgressRow>(
      `SELECT * FROM handbook.learning_progress WHERE user_id = $1 ORDER BY updated_at DESC`,
      [userId]
    );
    return rows.map(mapRow);
  }
}
