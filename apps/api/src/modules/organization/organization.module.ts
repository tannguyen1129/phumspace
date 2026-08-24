import { Module } from "@nestjs/common";
import { OrganizationController } from "./interface/organization.controller";
import { OrganizationService } from "./application/organization.service";
import { OrganizationsRepository } from "./infrastructure/organizations.repository";
import { OrganizationMembershipsRepository } from "./infrastructure/organization-memberships.repository";
import { OrganizationInvitesRepository } from "./infrastructure/organization-invites.repository";
import { IdentityModule } from "../identity/identity.module";

/**
 * OrganizationModule — chua/truong/CLB/bao tang so huu du lieu cua rieng minh (FR-ORG-003/004,
 * MUST/R1 — dong no ky thuat tu GD1, xem plan.md Milestone M8). Xuat OrganizationService de
 * OlympiadModule dung qua facade lam ownership check khi tao/bao cao competition thuoc to chuc.
 */
@Module({
  imports: [IdentityModule],
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationsRepository, OrganizationMembershipsRepository, OrganizationInvitesRepository],
  exports: [OrganizationService],
})
export class OrganizationModule {}
