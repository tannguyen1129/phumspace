import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL } from "../../../common/database/database.module";

export interface HeritageSource {
  id: string;
  title: string;
  author: string | null;
  url: string | null;
  reliability: string | null;
  createdBy: string;
  createdAt: Date;
}

interface SourceRow {
  id: string;
  title: string;
  author: string | null;
  url: string | null;
  reliability: string | null;
  created_by: string;
  created_at: Date;
}

function mapRow(row: SourceRow): HeritageSource {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    url: row.url,
    reliability: row.reliability,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

@Injectable()
export class SourcesRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(input: {
    title: string;
    author?: string;
    url?: string;
    reliability?: string;
    createdBy: string;
  }): Promise<HeritageSource> {
    const { rows } = await this.pool.query<SourceRow>(
      `INSERT INTO heritage.sources (title, author, url, reliability, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [input.title, input.author ?? null, input.url ?? null, input.reliability ?? null, input.createdBy]
    );
    return mapRow(rows[0]);
  }

  async list(limit: number, offset: number): Promise<HeritageSource[]> {
    const { rows } = await this.pool.query<SourceRow>(
      `SELECT * FROM heritage.sources ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows.map(mapRow);
  }
}
