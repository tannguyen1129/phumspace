import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL } from "../../../common/database/database.module";
import type { LeaderboardEntry } from "../domain/quiz";

export interface SubmissionRecord {
  id: string;
  userId: string;
  questionId: string;
  competitionId: string | null;
  selectedChoiceId: string;
  isCorrect: boolean;
  submittedAt: Date;
  idempotencyKey: string | null;
}

interface SubmissionRow {
  id: string;
  user_id: string;
  question_id: string;
  competition_id: string | null;
  selected_choice_id: string;
  is_correct: boolean;
  submitted_at: Date;
  idempotency_key: string | null;
}

interface LeaderboardRow {
  user_id: string;
  display_name: string;
  correct_count: string;
  answered_count: string;
}

function mapRow(row: SubmissionRow): SubmissionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    questionId: row.question_id,
    competitionId: row.competition_id,
    selectedChoiceId: row.selected_choice_id,
    isCorrect: row.is_correct,
    submittedAt: row.submitted_at,
    idempotencyKey: row.idempotency_key,
  };
}

@Injectable()
export class SubmissionsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(input: {
    userId: string;
    questionId: string;
    competitionId?: string;
    selectedChoiceId: string;
    isCorrect: boolean;
    idempotencyKey?: string;
    questionVersion?: number;
  }): Promise<SubmissionRecord> {
    const { rows } = await this.pool.query<SubmissionRow>(
      `INSERT INTO olympiad.submissions (user_id, question_id, competition_id, selected_choice_id, is_correct, idempotency_key, question_version)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [input.userId, input.questionId, input.competitionId ?? null, input.selectedChoiceId, input.isCorrect, input.idempotencyKey ?? null, input.questionVersion ?? 1]
    );
    return mapRow(rows[0]);
  }

  async findByIdempotencyKey(userId: string, key: string): Promise<SubmissionRecord | null> {
    const { rows } = await this.pool.query<SubmissionRow>(`SELECT * FROM olympiad.submissions WHERE user_id = $1 AND idempotency_key = $2`, [userId, key]);
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async hasSubmitted(userId: string, questionId: string, competitionId: string): Promise<boolean> {
    const { rows } = await this.pool.query(
      `SELECT 1 FROM olympiad.submissions WHERE user_id = $1 AND question_id = $2 AND competition_id = $3`,
      [userId, questionId, competitionId]
    );
    return rows.length > 0;
  }

  /** JOIN toi iam.users chi de lay display_name hien thi bang xep hang — khong doc du lieu nhay cam. */
  async leaderboard(competitionId: string): Promise<LeaderboardEntry[]> {
    const { rows } = await this.pool.query<LeaderboardRow>(
      `SELECT s.user_id,
              u.display_name,
              COUNT(*) FILTER (WHERE s.is_correct) AS correct_count,
              COUNT(*) AS answered_count
       FROM olympiad.submissions s
       JOIN iam.users u ON u.id = s.user_id
       WHERE s.competition_id = $1
       GROUP BY s.user_id, u.display_name
       ORDER BY correct_count DESC, answered_count ASC`,
      [competitionId]
    );
    return rows.map((row) => ({
      userId: row.user_id,
      displayName: row.display_name,
      correctCount: Number(row.correct_count),
      answeredCount: Number(row.answered_count),
    }));
  }
}
