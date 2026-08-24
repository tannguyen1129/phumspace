import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import type { RelationType } from "@phumspace/contracts";
import { PG_POOL } from "../../../common/database/database.module";

export interface HeritageRelation {
  id: string;
  subjectEntityId: string;
  predicate: RelationType;
  objectEntityId: string;
  createdBy: string;
  createdAt: Date;
}

interface RelationRow {
  id: string;
  subject_entity_id: string;
  predicate: RelationType;
  object_entity_id: string;
  created_by: string;
  created_at: Date;
}

function mapRow(row: RelationRow): HeritageRelation {
  return {
    id: row.id,
    subjectEntityId: row.subject_entity_id,
    predicate: row.predicate,
    objectEntityId: row.object_entity_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

@Injectable()
export class RelationsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(input: {
    subjectEntityId: string;
    predicate: RelationType;
    objectEntityId: string;
    createdBy: string;
  }): Promise<HeritageRelation> {
    const { rows } = await this.pool.query<RelationRow>(
      `INSERT INTO heritage.relations (subject_entity_id, predicate, object_entity_id, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.subjectEntityId, input.predicate, input.objectEntityId, input.createdBy]
    );
    return mapRow(rows[0]);
  }

  async listForEntity(entityId: string): Promise<HeritageRelation[]> {
    const { rows } = await this.pool.query<RelationRow>(
      `SELECT * FROM heritage.relations
       WHERE subject_entity_id = $1 OR object_entity_id = $1
       ORDER BY created_at DESC`,
      [entityId]
    );
    return rows.map(mapRow);
  }
}
