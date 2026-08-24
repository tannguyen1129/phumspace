import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL } from "../../../common/database/database.module";

export interface TaxonomyTerm {
  id: string;
  scheme: string;
  code: string;
  label: string;
}

@Injectable()
export class TaxonomyRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async listBySchema(scheme?: string): Promise<TaxonomyTerm[]> {
    const { rows } = scheme
      ? await this.pool.query<TaxonomyTerm>(
          `SELECT id, scheme, code, label FROM heritage.taxonomy_terms WHERE scheme = $1 ORDER BY label`,
          [scheme]
        )
      : await this.pool.query<TaxonomyTerm>(
          `SELECT id, scheme, code, label FROM heritage.taxonomy_terms ORDER BY scheme, label`
        );
    return rows;
  }

  async attachToEntity(entityId: string, termId: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO heritage.entity_categories (entity_id, term_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [entityId, termId]
    );
  }
}
