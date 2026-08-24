import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL } from "../../../common/database/database.module";

export interface EmailVerificationTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
}

interface EmailVerificationTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  consumed_at: Date | null;
}

function mapRow(row: EmailVerificationTokenRow): EmailVerificationTokenRecord {
  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    expiresAt: row.expires_at,
    consumedAt: row.consumed_at,
  };
}

@Injectable()
export class EmailVerificationTokensRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    await this.pool.query(
      `INSERT INTO iam.email_verification_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [input.userId, input.tokenHash, input.expiresAt]
    );
  }

  async findValidByHash(tokenHash: string): Promise<EmailVerificationTokenRecord | null> {
    const { rows } = await this.pool.query<EmailVerificationTokenRow>(
      `SELECT id, user_id, token_hash, expires_at, consumed_at
       FROM iam.email_verification_tokens
       WHERE token_hash = $1 AND consumed_at IS NULL AND expires_at > now()`,
      [tokenHash]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async consume(id: string): Promise<void> {
    await this.pool.query(
      `UPDATE iam.email_verification_tokens SET consumed_at = now() WHERE id = $1`,
      [id]
    );
  }

  async consumeAllForUser(userId: string): Promise<void> {
    await this.pool.query(
      `UPDATE iam.email_verification_tokens SET consumed_at=now() WHERE user_id=$1 AND consumed_at IS NULL`,
      [userId]
    );
  }
}
