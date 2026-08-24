import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL } from "../../../common/database/database.module";
import type { TermAudio } from "../domain/term";

@Injectable()
export class TermAudioRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(input: {
    termId: string;
    mediaKey: string;
    speakerName?: string;
    region?: string;
    recordedAt?: Date;
    rightsNote?: string;
    transcript?: string;
    createdBy: string;
  }): Promise<TermAudio> {
    const { rows } = await this.pool.query(
      `INSERT INTO handbook.term_audio (term_id, media_key, speaker_name, region, created_by, recorded_at, rights_note, transcript)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, term_id, media_key, speaker_name, region, recorded_at, rights_note, transcript, verification_status`,
      [input.termId, input.mediaKey, input.speakerName ?? null, input.region ?? null, input.createdBy, input.recordedAt ?? null, input.rightsNote ?? null, input.transcript ?? null]
    );
    return {
      id: rows[0].id,
      termId: rows[0].term_id,
      mediaKey: rows[0].media_key,
      speakerName: rows[0].speaker_name,
      region: rows[0].region,
      recordedAt: rows[0].recorded_at,
      rightsNote: rows[0].rights_note,
      transcript: rows[0].transcript,
      verificationStatus: rows[0].verification_status,
    };
  }

  async listForTerm(termId: string): Promise<TermAudio[]> {
    const { rows } = await this.pool.query(
      `SELECT id, term_id, media_key, speaker_name, region, recorded_at, rights_note, transcript, verification_status
       FROM handbook.term_audio WHERE term_id = $1 ORDER BY created_at`,
      [termId]
    );
    return rows.map((row) => ({
      id: row.id,
      termId: row.term_id,
      mediaKey: row.media_key,
      speakerName: row.speaker_name,
      region: row.region,
      recordedAt: row.recorded_at,
      rightsNote: row.rights_note,
      transcript: row.transcript,
      verificationStatus: row.verification_status,
    }));
  }
}
