import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL } from "../../../common/database/database.module";
import type { HeritageSource } from "./sources.repository";

interface SourceRow {
  id: string;
  title: string;
  author: string | null;
  url: string | null;
  reliability: string | null;
  created_by: string;
  created_at: Date;
}

function mapSourceRow(row: SourceRow): HeritageSource {
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
export class VersionSourcesRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async attach(entityVersionId: string, sourceId: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO heritage.version_sources (entity_version_id, source_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [entityVersionId, sourceId]
    );
  }

  async listForVersion(entityVersionId: string): Promise<HeritageSource[]> {
    const { rows } = await this.pool.query<SourceRow>(
      `SELECT s.*
       FROM heritage.version_sources vs
       JOIN heritage.sources s ON s.id = vs.source_id
       WHERE vs.entity_version_id = $1
       ORDER BY s.created_at`,
      [entityVersionId]
    );
    return rows.map(mapSourceRow);
  }
}
