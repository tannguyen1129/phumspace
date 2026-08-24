import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL } from "../../../common/database/database.module";

@Injectable()
export class PasswordResetTokensRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    await this.pool.query(
      `INSERT INTO iam.password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1,$2,$3)`,
      [input.userId, input.tokenHash, input.expiresAt]
    );
  }

  async findValidByHash(tokenHash: string): Promise<{ id: string; userId: string } | null> {
    const { rows } = await this.pool.query<{ id: string; user_id: string }>(
      `SELECT id,user_id FROM iam.password_reset_tokens
       WHERE token_hash=$1 AND consumed_at IS NULL AND expires_at > now()`,
      [tokenHash]
    );
    return rows[0] ? { id: rows[0].id, userId: rows[0].user_id } : null;
  }

  async consumeAllForUser(userId: string): Promise<void> {
    await this.pool.query(
      `UPDATE iam.password_reset_tokens SET consumed_at=now()
       WHERE user_id=$1 AND consumed_at IS NULL`,
      [userId]
    );
  }
}
