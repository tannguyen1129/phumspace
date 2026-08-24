import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import type { OrganizationMemberRole } from "@phumspace/contracts";
import { PG_POOL } from "../../../common/database/database.module";
import type { OrganizationMembership, OrganizationMemberView } from "../domain/organization";

interface MembershipRow {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationMemberRole;
  created_at: Date;
}

interface MembershipWithUserRow extends MembershipRow {
  display_name: string;
  email: string;
}

function mapRow(row: MembershipRow): OrganizationMembership {
  return {
    id: row.id,
    organizationId: row.organization_id,
    userId: row.user_id,
    role: row.role,
    createdAt: row.created_at,
  };
}

@Injectable()
export class OrganizationMembershipsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async add(input: {
    organizationId: string;
    userId: string;
    role: OrganizationMemberRole;
  }): Promise<OrganizationMembership> {
    const { rows } = await this.pool.query<MembershipRow>(
      `INSERT INTO iam.organization_memberships (organization_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role
       RETURNING *`,
      [input.organizationId, input.userId, input.role]
    );
    return mapRow(rows[0]);
  }

  async findMembership(organizationId: string, userId: string): Promise<OrganizationMembership | null> {
    const { rows } = await this.pool.query<MembershipRow>(
      `SELECT * FROM iam.organization_memberships WHERE organization_id = $1 AND user_id = $2`,
      [organizationId, userId]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async listForOrganization(organizationId: string): Promise<OrganizationMemberView[]> {
    const { rows } = await this.pool.query<MembershipWithUserRow>(
      `SELECT m.*, u.display_name, u.email
       FROM iam.organization_memberships m
       JOIN iam.users u ON u.id = m.user_id
       WHERE m.organization_id = $1
       ORDER BY m.created_at`,
      [organizationId]
    );
    return rows.map((row) => ({ ...mapRow(row), displayName: row.display_name, email: row.email }));
  }

  async remove(organizationId: string, userId: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM iam.organization_memberships WHERE organization_id = $1 AND user_id = $2`,
      [organizationId, userId]
    );
  }

  /** Dung de chan xoa/ha cap MANAGER cuoi cung — tranh to chuc "mo coi" khong ai quan ly duoc. */
  async countManagers(organizationId: string): Promise<number> {
    const { rows } = await this.pool.query<{ count: string }>(
      `SELECT count(*) FROM iam.organization_memberships WHERE organization_id = $1 AND role = 'MANAGER'`,
      [organizationId]
    );
    return Number(rows[0].count);
  }
}
