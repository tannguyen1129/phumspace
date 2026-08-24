import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import type { ScanDecision } from "@phumspace/contracts";
import { PG_POOL } from "../../../common/database/database.module";

/** Ghi ket qua Decision Engine — idempotent qua ON CONFLICT de an toan khi BullMQ retry (attempts: 2). */
@Injectable()
export class ScanResultsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async save(scanRequestId: string, decision: ScanDecision): Promise<void> {
    await this.pool.query(
      `INSERT INTO scanner.scan_results
         (scan_request_id, decision, confidence, entity_id, alternative_entity_ids, synthesis,
          requires_human_review, citation_coverage_complete)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (scan_request_id) DO UPDATE SET
         decision = EXCLUDED.decision,
         confidence = EXCLUDED.confidence,
         entity_id = EXCLUDED.entity_id,
         alternative_entity_ids = EXCLUDED.alternative_entity_ids,
         synthesis = EXCLUDED.synthesis,
         requires_human_review = EXCLUDED.requires_human_review,
         citation_coverage_complete = EXCLUDED.citation_coverage_complete`,
      [
        scanRequestId,
        decision.decision,
        decision.confidence,
        decision.entityId,
        decision.alternativeEntityIds.length > 0
          ? decision.alternativeEntityIds
          : null,
        JSON.stringify(decision.synthesis),
        decision.requiresHumanReview,
        decision.citationCoverageComplete,
      ],
    );
  }
}
