import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL } from "../../../common/database/database.module";
import type { Question, QuestionChoice } from "../domain/quiz";

interface QuestionRow {
  id: string;
  entity_id: string | null;
  question_text: string;
  choices: QuestionChoice[];
  correct_choice_id: string;
  explanation: string | null;
  created_by: string;
  created_at: Date;
  version: number; question_type: string; difficulty: string; topic: string | null; language: string; time_limit_seconds: number | null; source_note: string | null;
}

function mapRow(row: QuestionRow): Question {
  return {
    id: row.id,
    entityId: row.entity_id,
    questionText: row.question_text,
    choices: row.choices,
    correctChoiceId: row.correct_choice_id,
    explanation: row.explanation,
    createdBy: row.created_by,
    createdAt: row.created_at,
    version: row.version, questionType: row.question_type, difficulty: row.difficulty, topic: row.topic,
    language: row.language, timeLimitSeconds: row.time_limit_seconds, sourceNote: row.source_note,
  };
}

@Injectable()
export class QuestionsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(input: {
    entityId?: string;
    questionText: string;
    choices: QuestionChoice[];
    correctChoiceId: string;
    explanation?: string;
    createdBy: string;
  }): Promise<Question> {
    const { rows } = await this.pool.query<QuestionRow>(
      `INSERT INTO olympiad.questions (entity_id, question_text, choices, correct_choice_id, explanation, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        input.entityId ?? null,
        input.questionText,
        JSON.stringify(input.choices),
        input.correctChoiceId,
        input.explanation ?? null,
        input.createdBy,
      ]
    );
    return mapRow(rows[0]);
  }

  async findById(id: string): Promise<Question | null> {
    const { rows } = await this.pool.query<QuestionRow>(`SELECT * FROM olympiad.questions WHERE id = $1`, [id]);
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async list(input: { entityId?: string; limit: number; offset: number }): Promise<Question[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (input.entityId) {
      params.push(input.entityId);
      conditions.push(`entity_id = $${params.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    params.push(input.limit, input.offset);
    const { rows } = await this.pool.query<QuestionRow>(
      `SELECT * FROM olympiad.questions ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return rows.map(mapRow);
  }

  async findRandom(limit: number, entityId?: string): Promise<Question[]> {
    const params: unknown[] = [];
    let where = "";
    if (entityId) {
      params.push(entityId);
      where = `WHERE entity_id = $1`;
    }
    params.push(limit);
    const { rows } = await this.pool.query<QuestionRow>(
      `SELECT * FROM olympiad.questions ${where} ORDER BY random() LIMIT $${params.length}`,
      params
    );
    return rows.map(mapRow);
  }
}
