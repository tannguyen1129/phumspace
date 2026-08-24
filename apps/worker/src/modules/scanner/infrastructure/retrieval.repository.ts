import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import type { VerificationLevel } from "@phumspace/contracts";
import { PG_POOL } from "../../../common/database/database.module";

export interface RetrievalCandidate {
  entityId: string;
  versionId: string;
  preferredLabel: string;
  description: string | null;
  verificationLevel: VerificationLevel;
  score: number;
}

interface RetrievalRow {
  entity_id: string;
  version_id: string;
  preferred_label: string;
  description: string | null;
  verification_level: VerificationLevel;
  text_score: number;
  context_match: boolean;
}

function mapRow(row: RetrievalRow): RetrievalCandidate {
  return {
    entityId: row.entity_id,
    versionId: row.version_id,
    preferredLabel: row.preferred_label,
    description: row.description,
    verificationLevel: row.verification_level,
    score: rankCandidate(
      row.text_score,
      row.verification_level,
      row.context_match,
    ),
  };
}

/**
 * Buoc Retrieve (Controlled RAG rut gon cho M3): trigram similarity tren preferred_label
 * (pg_trgm, index da tao o migration M1) — chi ung vien PUBLISHED moi duoc xet, dung
 * nguyen tac "PhumData la nguon su that duy nhat".
 */
@Injectable()
export class RetrievalRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findCandidates(
    queryText: string,
    limit = 5,
    placeId?: string,
  ): Promise<RetrievalCandidate[]> {
    if (!queryText.trim()) return [];
    const { rows } = await this.pool.query<RetrievalRow>(
      `SELECT e.id AS entity_id, v.id AS version_id, v.preferred_label, v.description,
              v.verification_level,
              GREATEST(similarity(v.preferred_label, $1), similarity(COALESCE(v.description,''), $1)) AS text_score,
              ($2::uuid IS NOT NULL AND (e.id=$2 OR EXISTS(
                SELECT 1 FROM heritage.relations r
                WHERE (r.subject_entity_id=e.id AND r.object_entity_id=$2)
                   OR (r.object_entity_id=e.id AND r.subject_entity_id=$2)
              ))) AS context_match
       FROM heritage.entities e
       JOIN heritage.entity_versions v ON v.id = e.current_version_id
       WHERE v.publication_status = 'PUBLISHED'
       ORDER BY text_score DESC
       LIMIT $3`,
      [queryText, placeId ?? null, Math.max(limit * 4, 20)],
    );
    return rows
      .map(mapRow)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async listSourceIdsForVersion(versionId: string): Promise<string[]> {
    const { rows } = await this.pool.query<{ source_id: string }>(
      `SELECT source_id FROM heritage.version_sources WHERE entity_version_id = $1`,
      [versionId],
    );
    return rows.map((row) => row.source_id);
  }
}

export function rankCandidate(
  textScore: number,
  verificationLevel: VerificationLevel,
  contextMatch: boolean,
): number {
  const verificationBoost =
    verificationLevel === "EXPERT_REVIEWED"
      ? 0.08
      : verificationLevel === "SOURCE_VERIFIED"
        ? 0.05
        : verificationLevel === "COMMUNITY_CONFIRMED"
          ? 0.02
          : 0;
  return Math.min(1, textScore + verificationBoost + (contextMatch ? 0.18 : 0));
}
