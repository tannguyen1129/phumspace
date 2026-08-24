import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import type {
  ModelSynthesisOutput,
  ScanDecisionKind,
} from "@phumspace/contracts";
import { PG_POOL } from "../../../common/database/database.module";
import type { ScanResultRecord } from "../domain/scan";

interface ScanResultRow {
  id: string;
  scan_request_id: string;
  decision: ScanDecisionKind;
  confidence: number;
  entity_id: string | null;
  alternative_entity_ids: string[] | null;
  synthesis: ModelSynthesisOutput;
  requires_human_review: boolean;
  citation_coverage_complete: boolean;
  created_at: Date;
}

function mapRow(row: ScanResultRow): ScanResultRecord {
  return {
    id: row.id,
    scanRequestId: row.scan_request_id,
    decision: row.decision,
    confidence: row.confidence,
    entityId: row.entity_id,
    alternativeEntityIds: row.alternative_entity_ids ?? [],
    synthesis: row.synthesis,
    requiresHumanReview: row.requires_human_review,
    citationCoverageComplete: row.citation_coverage_complete,
    createdAt: row.created_at,
  };
}

/**
 * Chi doc o apps/api (poll ket qua) — viec ghi ket qua thuoc ve apps/worker sau khi
 * ScanPipelineService chay xong (xem apps/worker/src/modules/scanner).
 */
@Injectable()
export class ScanResultsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findByScanRequestId(
    scanRequestId: string,
  ): Promise<ScanResultRecord | null> {
    const { rows } = await this.pool.query<ScanResultRow>(
      `SELECT * FROM scanner.scan_results WHERE scan_request_id = $1`,
      [scanRequestId],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }
}
