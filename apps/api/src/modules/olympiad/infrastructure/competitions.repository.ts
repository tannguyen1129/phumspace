import { randomBytes } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import type { CompetitionStatus } from "@phumspace/contracts";
import { PG_POOL } from "../../../common/database/database.module";

export interface Competition {
  id: string;
  title: string;
  status: CompetitionStatus;
  roomCode: string;
  createdBy: string;
  organizationId: string | null;
  createdAt: Date;
}

interface CompetitionRow {
  id: string;
  title: string;
  status: CompetitionStatus;
  room_code: string;
  created_by: string;
  organization_id: string | null;
  created_at: Date;
}

export interface OrganizationCompetitionStatsRow {
  id: string;
  title: string;
  status: CompetitionStatus;
  participant_count: string;
  submission_count: string;
  correct_submission_count: string;
}

interface CompetitionQuestionRow {
  question_id: string;
  order_index: number;
}

function mapRow(row: CompetitionRow): Competition {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    roomCode: row.room_code,
    createdBy: row.created_by,
    organizationId: row.organization_id,
    createdAt: row.created_at,
  };
}

/** Bang chu hoa/so, tranh 0/O/1/I de nguoi choi go tay tren dien thoai khong nham lan. */
const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ROOM_CODE_LENGTH = 6;

function generateRoomCode(): string {
  const bytes = randomBytes(ROOM_CODE_LENGTH);
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_ALPHABET[bytes[i] % ROOM_CODE_ALPHABET.length];
  }
  return code;
}

@Injectable()
export class CompetitionsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(input: { title: string; createdBy: string; organizationId?: string }): Promise<Competition> {
    const roomCode = generateRoomCode();
    const { rows } = await this.pool.query<CompetitionRow>(
      `INSERT INTO olympiad.competitions (title, room_code, created_by, organization_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [input.title, roomCode, input.createdBy, input.organizationId ?? null]
    );
    return mapRow(rows[0]);
  }

  async findById(id: string): Promise<Competition | null> {
    const { rows } = await this.pool.query<CompetitionRow>(
      `SELECT * FROM olympiad.competitions WHERE id = $1`,
      [id]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async findByRoomCode(roomCode: string): Promise<Competition | null> {
    const { rows } = await this.pool.query<CompetitionRow>(
      `SELECT * FROM olympiad.competitions WHERE room_code = $1`,
      [roomCode.toUpperCase()]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async updateStatus(id: string, status: CompetitionStatus): Promise<Competition> {
    const { rows } = await this.pool.query<CompetitionRow>(
      `UPDATE olympiad.competitions SET status = $2, updated_at = now() WHERE id = $1 RETURNING *`,
      [id, status]
    );
    return mapRow(rows[0]);
  }

  async addQuestion(competitionId: string, questionId: string, orderIndex: number): Promise<void> {
    await this.pool.query(
      `INSERT INTO olympiad.competition_questions (competition_id, question_id, order_index)
       VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [competitionId, questionId, orderIndex]
    );
  }

  async listQuestions(competitionId: string): Promise<Array<{ questionId: string; orderIndex: number }>> {
    const { rows } = await this.pool.query<CompetitionQuestionRow>(
      `SELECT question_id, order_index FROM olympiad.competition_questions
       WHERE competition_id = $1 ORDER BY order_index`,
      [competitionId]
    );
    return rows.map((row) => ({ questionId: row.question_id, orderIndex: row.order_index }));
  }

  async join(competitionId: string, userId: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO olympiad.competition_participants (competition_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [competitionId, userId]
    );
  }

  async isParticipant(competitionId: string, userId: string): Promise<boolean> {
    const { rows } = await this.pool.query(
      `SELECT 1 FROM olympiad.competition_participants WHERE competition_id = $1 AND user_id = $2`,
      [competitionId, userId]
    );
    return rows.length > 0;
  }

  /** FR-ORG-003/004: bao cao chi trong pham vi cac competition thuoc 1 to chuc — khong lo du lieu ngoai to chuc. */
  async listStatsForOrganization(organizationId: string): Promise<OrganizationCompetitionStatsRow[]> {
    const { rows } = await this.pool.query<OrganizationCompetitionStatsRow>(
      `SELECT
         c.id,
         c.title,
         c.status,
         COUNT(DISTINCT p.user_id) AS participant_count,
         COUNT(s.id) AS submission_count,
         COUNT(s.id) FILTER (WHERE s.is_correct) AS correct_submission_count
       FROM olympiad.competitions c
       LEFT JOIN olympiad.competition_participants p ON p.competition_id = c.id
       LEFT JOIN olympiad.submissions s ON s.competition_id = c.id
       WHERE c.organization_id = $1
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [organizationId]
    );
    return rows;
  }
}
