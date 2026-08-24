import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL } from "../../../common/database/database.module";

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
}

function mapRow(row: RefreshTokenRow): RefreshTokenRecord {
  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
  };
}

@Injectable()
export class RefreshTokensRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    await this.pool.query(
      `INSERT INTO iam.refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [input.userId, input.tokenHash, input.expiresAt]
    );
  }

  async findValidByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const { rows } = await this.pool.query<RefreshTokenRow>(
      `SELECT id, user_id, token_hash, expires_at, revoked_at
       FROM iam.refresh_tokens
       WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()`,
      [tokenHash]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async revoke(id: string): Promise<void> {
    await this.pool.query(`UPDATE iam.refresh_tokens SET revoked_at = now() WHERE id = $1`, [id]);
  }

  /** Thu hoi toan bo phien dang nhap cua user — dung khi xoa/an danh hoa tai khoan (FR-PER-007). */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.pool.query(
      `UPDATE iam.refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId]
    );
  }
}
