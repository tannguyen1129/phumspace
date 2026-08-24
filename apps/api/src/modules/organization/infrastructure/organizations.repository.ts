import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import type { OrganizationStatus, OrganizationType } from "@phumspace/contracts";
import { PG_POOL } from "../../../common/database/database.module";
import type { Organization } from "../domain/organization";

interface OrganizationRow {
  id: string;
  name: string;
  org_type: OrganizationType;
  status: OrganizationStatus;
  brand_color: string | null;
  home_place_id: string | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

function mapRow(row: OrganizationRow): Organization {
  return {
    id: row.id,
    name: row.name,
    orgType: row.org_type,
    status: row.status,
    brandColor: row.brand_color,
    homePlaceId: row.home_place_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

@Injectable()
export class OrganizationsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(input: {
    name: string;
    orgType: OrganizationType;
    homePlaceId?: string;
    createdBy: string;
    status: OrganizationStatus;
  }): Promise<Organization> {
    const { rows } = await this.pool.query<OrganizationRow>(
      `INSERT INTO iam.organizations (name, org_type, home_place_id, created_by, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [input.name, input.orgType, input.homePlaceId ?? null, input.createdBy, input.status]
    );
    return mapRow(rows[0]);
  }

  async findById(id: string): Promise<Organization | null> {
    const { rows } = await this.pool.query<OrganizationRow>(
      `SELECT * FROM iam.organizations WHERE id = $1`,
      [id]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async list(): Promise<Organization[]> {
    const { rows } = await this.pool.query<OrganizationRow>(
      `SELECT * FROM iam.organizations ORDER BY created_at DESC`
    );
    return rows.map(mapRow);
  }

  async listByStatus(status: OrganizationStatus): Promise<Organization[]> {
    const { rows } = await this.pool.query<OrganizationRow>(
      `SELECT * FROM iam.organizations WHERE status = $1 ORDER BY created_at`,
      [status]
    );
    return rows.map(mapRow);
  }

  async updateStatus(id: string, status: OrganizationStatus): Promise<Organization> {
    const { rows } = await this.pool.query<OrganizationRow>(
      `UPDATE iam.organizations SET status = $2, updated_at = now() WHERE id = $1 RETURNING *`,
      [id, status]
    );
    return mapRow(rows[0]);
  }

  async updateBrandColor(id: string, brandColor: string | null): Promise<Organization> {
    const { rows } = await this.pool.query<OrganizationRow>(
      `UPDATE iam.organizations SET brand_color = $2, updated_at = now() WHERE id = $1 RETURNING *`,
      [id, brandColor]
    );
    return mapRow(rows[0]);
  }
}
