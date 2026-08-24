import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL } from "../../../common/database/database.module";
import type { HandbookTerm, TermExample } from "../domain/term";

interface TermRow {
  id: string;
  khmer_text: string;
  latin_transliteration: string | null;
  meaning_vi: string;
  meaning_en: string | null;
  entity_id: string | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

function mapRow(row: TermRow): HandbookTerm {
  return {
    id: row.id,
    khmerText: row.khmer_text,
    latinTransliteration: row.latin_transliteration,
    meaningVi: row.meaning_vi,
    meaningEn: row.meaning_en,
    entityId: row.entity_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

@Injectable()
export class TermsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(input: {
    khmerText: string;
    latinTransliteration?: string;
    meaningVi: string;
    meaningEn?: string;
    entityId?: string;
    createdBy: string;
  }): Promise<HandbookTerm> {
    const { rows } = await this.pool.query<TermRow>(
      `INSERT INTO handbook.terms (khmer_text, latin_transliteration, meaning_vi, meaning_en, entity_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        input.khmerText,
        input.latinTransliteration ?? null,
        input.meaningVi,
        input.meaningEn ?? null,
        input.entityId ?? null,
        input.createdBy,
      ]
    );
    return mapRow(rows[0]);
  }

  async findById(id: string): Promise<HandbookTerm | null> {
    const { rows } = await this.pool.query<TermRow>(`SELECT * FROM handbook.terms WHERE id = $1`, [id]);
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async list(input: { entityId?: string; query?: string; limit: number; offset: number }): Promise<HandbookTerm[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (input.entityId) {
      params.push(input.entityId);
      conditions.push(`entity_id = $${params.length}`);
    }
    if (input.query) {
      params.push(`%${input.query}%`);
      conditions.push(`(khmer_text ILIKE $${params.length} OR latin_transliteration ILIKE $${params.length} OR meaning_vi ILIKE $${params.length} OR meaning_en ILIKE $${params.length})`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    params.push(input.limit, input.offset);
    const { rows } = await this.pool.query<TermRow>(
      `SELECT * FROM handbook.terms ${where} ORDER BY khmer_text LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return rows.map(mapRow);
  }

  async addExample(termId: string, exampleKhmer: string, exampleVi: string): Promise<TermExample> {
    const { rows } = await this.pool.query(
      `INSERT INTO handbook.term_examples (term_id, example_khmer, example_vi)
       VALUES ($1, $2, $3)
       RETURNING id, term_id, example_khmer, example_vi`,
      [termId, exampleKhmer, exampleVi]
    );
    return {
      id: rows[0].id,
      termId: rows[0].term_id,
      exampleKhmer: rows[0].example_khmer,
      exampleVi: rows[0].example_vi,
    };
  }

  async listExamples(termId: string): Promise<TermExample[]> {
    const { rows } = await this.pool.query(
      `SELECT id, term_id, example_khmer, example_vi FROM handbook.term_examples WHERE term_id = $1 ORDER BY created_at`,
      [termId]
    );
    return rows.map((row) => ({
      id: row.id,
      termId: row.term_id,
      exampleKhmer: row.example_khmer,
      exampleVi: row.example_vi,
    }));
  }
}
