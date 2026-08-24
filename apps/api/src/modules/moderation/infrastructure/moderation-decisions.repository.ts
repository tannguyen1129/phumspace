import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import type { ModerationDecision } from "@phumspace/contracts";
import { PG_POOL } from "../../../common/database/database.module";

export interface ModerationDecisionRecord {
  id: string;
  contributionId: string;
  reviewerId: string;
  decision: ModerationDecision;
  reason: string | null;
  createdAt: Date;
}

interface ModerationDecisionRow {
  id: string;
  contribution_id: string;
  reviewer_id: string;
  decision: ModerationDecision;
  reason: string | null;
  created_at: Date;
}

function mapRow(row: ModerationDecisionRow): ModerationDecisionRecord {
  return {
    id: row.id,
    contributionId: row.contribution_id,
    reviewerId: row.reviewer_id,
    decision: row.decision,
    reason: row.reason,
    createdAt: row.created_at,
  };
}

@Injectable()
export class ModerationDecisionsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(input: {
    contributionId: string;
    reviewerId: string;
    decision: ModerationDecision;
    reason?: string;
  }): Promise<ModerationDecisionRecord> {
    const { rows } = await this.pool.query<ModerationDecisionRow>(
      `INSERT INTO contribution.moderation_decisions (contribution_id, reviewer_id, decision, reason)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.contributionId, input.reviewerId, input.decision, input.reason ?? null]
    );
    return mapRow(rows[0]);
  }

  async listForContribution(contributionId: string): Promise<ModerationDecisionRecord[]> {
    const { rows } = await this.pool.query<ModerationDecisionRow>(
      `SELECT * FROM contribution.moderation_decisions WHERE contribution_id = $1 ORDER BY created_at`,
      [contributionId]
    );
    return rows.map(mapRow);
  }
}
