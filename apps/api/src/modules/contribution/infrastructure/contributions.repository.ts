import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import type { AiPermission, ConsentScope, ContributionState } from "@phumspace/contracts";
import { PG_POOL } from "../../../common/database/database.module";
import type { Contribution } from "../domain/contribution";

interface ContributionRow {
  id: string;
  contributor_id: string;
  term_id: string | null;
  proposed_khmer_text: string | null;
  proposed_latin_transliteration: string | null;
  proposed_meaning_vi: string | null;
  media_key: string;
  region: string | null;
  consent_scope: ConsentScope;
  ai_permission: AiPermission;
  attribution_name: string | null;
  sensitive: boolean;
  status: ContributionState;
  result_term_id: string | null;
  result_audio_id: string | null;
  created_at: Date;
  updated_at: Date;
  contribution_type: string; language: string; recorded_at: Date | null; recorded_by: string | null;
  context_note: string | null; location_note: string | null; consent_version: string; consent_confirmed_at: Date;
  consent_method: string; attribution_role: string | null; attribution_community: string | null;
  assigned_reviewer_id: string | null; priority: string;
}

function mapRow(row: ContributionRow): Contribution {
  return {
    id: row.id,
    contributorId: row.contributor_id,
    termId: row.term_id,
    proposedKhmerText: row.proposed_khmer_text,
    proposedLatinTransliteration: row.proposed_latin_transliteration,
    proposedMeaningVi: row.proposed_meaning_vi,
    mediaKey: row.media_key,
    region: row.region,
    consentScope: row.consent_scope,
    aiPermission: row.ai_permission,
    attributionName: row.attribution_name,
    sensitive: row.sensitive,
    status: row.status,
    resultTermId: row.result_term_id,
    resultAudioId: row.result_audio_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    contributionType: row.contribution_type, language: row.language, recordedAt: row.recorded_at,
    recordedBy: row.recorded_by, contextNote: row.context_note, locationNote: row.location_note,
    consentVersion: row.consent_version, consentConfirmedAt: row.consent_confirmed_at,
    consentMethod: row.consent_method, attributionRole: row.attribution_role,
    attributionCommunity: row.attribution_community, assignedReviewerId: row.assigned_reviewer_id,
    priority: row.priority,
  };
}

@Injectable()
export class ContributionsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(input: {
    contributorId: string;
    termId?: string;
    proposedKhmerText?: string;
    proposedLatinTransliteration?: string;
    proposedMeaningVi?: string;
    mediaKey: string;
    region?: string;
    consentScope: ConsentScope;
    aiPermission: AiPermission;
    attributionName?: string;
    sensitive: boolean;
    contributionType?: string; language?: string; recordedAt?: Date; recordedBy?: string;
    contextNote?: string; locationNote?: string; consentVersion?: string;
    attributionRole?: string; attributionCommunity?: string;
  }): Promise<Contribution> {
    const { rows } = await this.pool.query<ContributionRow>(
      `INSERT INTO contribution.contributions
         (contributor_id, term_id, proposed_khmer_text, proposed_latin_transliteration,
          proposed_meaning_vi, media_key, region, consent_scope, ai_permission,
          attribution_name, sensitive, contribution_type, language, recorded_at, recorded_by,
          context_note, location_note, consent_version, attribution_role, attribution_community)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
       RETURNING *`,
      [
        input.contributorId,
        input.termId ?? null,
        input.proposedKhmerText ?? null,
        input.proposedLatinTransliteration ?? null,
        input.proposedMeaningVi ?? null,
        input.mediaKey,
        input.region ?? null,
        input.consentScope,
        input.aiPermission,
        input.attributionName ?? null,
        input.sensitive,
        input.contributionType ?? "AUDIO", input.language ?? "km", input.recordedAt ?? null,
        input.recordedBy ?? null, input.contextNote ?? null, input.locationNote ?? null,
        input.consentVersion ?? "2026-08", input.attributionRole ?? null, input.attributionCommunity ?? null,
      ]
    );
    return mapRow(rows[0]);
  }

  async saveDraft(userId: string, input: { id?: string; contributionType: string; payload: Record<string, unknown> }) {
    if (input.id) {
      const { rows } = await this.pool.query(`UPDATE contribution.drafts SET contribution_type=$3,payload=$4,updated_at=now() WHERE id=$1 AND contributor_id=$2 RETURNING *`, [input.id,userId,input.contributionType,JSON.stringify(input.payload)]);
      return rows[0] ?? null;
    }
    const { rows } = await this.pool.query(`INSERT INTO contribution.drafts(contributor_id,contribution_type,payload) VALUES($1,$2,$3) RETURNING *`, [userId,input.contributionType,JSON.stringify(input.payload)]);
    return rows[0];
  }

  async listDrafts(userId: string) {
    const { rows } = await this.pool.query(`SELECT * FROM contribution.drafts WHERE contributor_id=$1 ORDER BY updated_at DESC`, [userId]);
    return rows;
  }

  async deleteDraft(id: string, userId: string): Promise<boolean> {
    const result = await this.pool.query(`DELETE FROM contribution.drafts WHERE id=$1 AND contributor_id=$2`, [id,userId]);
    return (result.rowCount ?? 0) > 0;
  }

  async resubmit(id: string, userId: string, updates: { contextNote?: string; locationNote?: string }): Promise<Contribution | null> {
    const client = await this.pool.connect();
    try { await client.query("BEGIN");
      const current = await client.query(`SELECT * FROM contribution.contributions WHERE id=$1 AND contributor_id=$2 AND status='CHANGES_REQUESTED' FOR UPDATE`, [id,userId]);
      if (!current.rows[0]) { await client.query("ROLLBACK"); return null; }
      const revision = await client.query(`SELECT COALESCE(MAX(revision_number),0)+1 AS n FROM contribution.revisions WHERE contribution_id=$1`, [id]);
      await client.query(`INSERT INTO contribution.revisions(contribution_id,revision_number,snapshot,changed_by) VALUES($1,$2,$3,$4)`, [id,revision.rows[0].n,JSON.stringify(current.rows[0]),userId]);
      const updated = await client.query<ContributionRow>(`UPDATE contribution.contributions SET context_note=COALESCE($3,context_note),location_note=COALESCE($4,location_note),status='SUBMITTED',assigned_reviewer_id=NULL,updated_at=now() WHERE id=$1 AND contributor_id=$2 RETURNING *`, [id,userId,updates.contextNote ?? null,updates.locationNote ?? null]);
      await client.query("COMMIT"); return mapRow(updated.rows[0]);
    } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
  }

  async listRevisions(id: string) { const { rows } = await this.pool.query(`SELECT * FROM contribution.revisions WHERE contribution_id=$1 ORDER BY revision_number DESC`,[id]); return rows; }
  async assign(id: string, reviewerId: string): Promise<Contribution | null> { const {rows}=await this.pool.query<ContributionRow>(`UPDATE contribution.contributions SET assigned_reviewer_id=$2,status='TRIAGE',updated_at=now() WHERE id=$1 AND status IN ('SUBMITTED','TRIAGE') AND (assigned_reviewer_id IS NULL OR assigned_reviewer_id=$2) RETURNING *`,[id,reviewerId]); return rows[0]?mapRow(rows[0]):null; }
  async createRequest(contributionId:string,requesterId:string,type:string,reason:string){const {rows}=await this.pool.query(`INSERT INTO contribution.requests(contribution_id,requester_id,request_type,reason,priority) VALUES($1,$2,$3,$4,$5) RETURNING *`,[contributionId,requesterId,type,reason,type==="TAKEDOWN"?"URGENT":"HIGH"]);return rows[0];}

  async findById(id: string): Promise<Contribution | null> {
    const { rows } = await this.pool.query<ContributionRow>(
      `SELECT * FROM contribution.contributions WHERE id = $1`,
      [id]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async listForContributor(contributorId: string): Promise<Contribution[]> {
    const { rows } = await this.pool.query<ContributionRow>(
      `SELECT * FROM contribution.contributions WHERE contributor_id = $1 ORDER BY created_at DESC`,
      [contributorId]
    );
    return rows.map(mapRow);
  }

  async listByStatus(status: ContributionState): Promise<Contribution[]> {
    const { rows } = await this.pool.query<ContributionRow>(
      `SELECT * FROM contribution.contributions WHERE status = $1 ORDER BY created_at ASC`,
      [status]
    );
    return rows.map(mapRow);
  }
  async listQueue(): Promise<Contribution[]> { const {rows}=await this.pool.query<ContributionRow>(`SELECT * FROM contribution.contributions WHERE status IN ('SUBMITTED','TRIAGE','EXPERT_REVIEW','RIGHTS_REVIEW') ORDER BY CASE priority WHEN 'URGENT' THEN 0 WHEN 'HIGH' THEN 1 ELSE 2 END, created_at ASC`);return rows.map(mapRow); }

  async updateStatus(id: string, status: ContributionState): Promise<Contribution> {
    const { rows } = await this.pool.query<ContributionRow>(
      `UPDATE contribution.contributions SET status = $2, updated_at = now() WHERE id = $1 RETURNING *`,
      [id, status]
    );
    return mapRow(rows[0]);
  }

  async markPublished(id: string, resultTermId: string, resultAudioId: string): Promise<Contribution> {
    const { rows } = await this.pool.query<ContributionRow>(
      `UPDATE contribution.contributions
       SET status = 'PUBLISHED', result_term_id = $2, result_audio_id = $3, updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, resultTermId, resultAudioId]
    );
    return mapRow(rows[0]);
  }
}
