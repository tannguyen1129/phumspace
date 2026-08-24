import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { OrganizationType, UserRole } from "@phumspace/contracts";
import { AuditLogService } from "../../../common/audit/audit-log.service";
import { OrganizationsRepository } from "../infrastructure/organizations.repository";
import { OrganizationMembershipsRepository } from "../infrastructure/organization-memberships.repository";
import { OrganizationInvitesRepository } from "../infrastructure/organization-invites.repository";
import { EmailDeliveryService } from "../../identity/application/email-delivery.service";
import type { Organization, OrganizationMemberView } from "../domain/organization";

/**
 * OrganizationService — FR-ORG-003/004 (MUST/R1, M8): chua/truong so huu competition/event va
 * xem bao cao rieng cua minh. FR-ORG-001/002/005/006 (self-service, M9): moi REGISTERED_USER
 * gui duoc yeu cau tao to chuc, SYSTEM_ADMIN duyet; Manager tu quan ly thanh vien/branding/export.
 */
@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationsRepository: OrganizationsRepository,
    private readonly membershipsRepository: OrganizationMembershipsRepository,
    private readonly auditLogService: AuditLogService,
    private readonly invitesRepository: OrganizationInvitesRepository,
    private readonly emailDeliveryService: EmailDeliveryService
  ) {}

  /**
   * FR-ORG-001: "System Admin phai co the tao/duyet organization." SYSTEM_ADMIN tao thang
   * ACTIVE (khong can tu duyet cho chinh minh); nguoi dung khac gui yeu cau PENDING_APPROVAL.
   */
  async create(input: {
    name: string;
    orgType: OrganizationType;
    homePlaceId?: string;
    createdBy: string;
    createdByRole: UserRole;
  }): Promise<Organization> {
    const status = input.createdByRole === "SYSTEM_ADMIN" ? "ACTIVE" : "PENDING_APPROVAL";
    const organization = await this.organizationsRepository.create({ ...input, status });
    await this.membershipsRepository.add({
      organizationId: organization.id,
      userId: input.createdBy,
      role: "MANAGER",
    });
    return organization;
  }

  async approve(id: string, adminId: string): Promise<Organization> {
    const organization = await this.getById(id);
    if (organization.status !== "PENDING_APPROVAL") {
      throw new BadRequestException("To chuc nay khong o trang thai cho duyet.");
    }
    const updated = await this.organizationsRepository.updateStatus(id, "ACTIVE");
    await this.auditLogService.record({
      actorId: adminId,
      action: "ORGANIZATION_APPROVED",
      targetType: "organization",
      targetId: id,
    });
    return updated;
  }

  async reject(id: string, adminId: string, reason: string): Promise<Organization> {
    const organization = await this.getById(id);
    if (organization.status !== "PENDING_APPROVAL") {
      throw new BadRequestException("To chuc nay khong o trang thai cho duyet.");
    }
    const updated = await this.organizationsRepository.updateStatus(id, "REJECTED");
    await this.auditLogService.record({
      actorId: adminId,
      action: "ORGANIZATION_REJECTED",
      targetType: "organization",
      targetId: id,
      metadata: { reason },
    });
    return updated;
  }

  async listPendingApproval(): Promise<Organization[]> {
    return this.organizationsRepository.listByStatus("PENDING_APPROVAL");
  }

  async getById(id: string): Promise<Organization> {
    const organization = await this.organizationsRepository.findById(id);
    if (!organization) throw new NotFoundException("Khong tim thay to chuc.");
    return organization;
  }

  async list(): Promise<Organization[]> {
    return this.organizationsRepository.list();
  }

  async addMember(input: {
    organizationId: string;
    userId: string;
    role: "MANAGER" | "MEMBER";
    requestedBy: string;
  }): Promise<void> {
    await this.assertIsManager(input.organizationId, input.requestedBy);
    await this.membershipsRepository.add({
      organizationId: input.organizationId,
      userId: input.userId,
      role: input.role,
    });
  }

  /** FR-ORG-002 "moi, go va phan vai thanh vien" — chan go/ha cap MANAGER cuoi cung. */
  async removeMember(organizationId: string, targetUserId: string, requestedBy: string): Promise<void> {
    await this.assertIsManager(organizationId, requestedBy);
    const target = await this.membershipsRepository.findMembership(organizationId, targetUserId);
    if (!target) throw new NotFoundException("Nguoi nay khong phai thanh vien cua to chuc.");
    if (target.role === "MANAGER") {
      const managerCount = await this.membershipsRepository.countManagers(organizationId);
      if (managerCount <= 1) {
        throw new BadRequestException("Khong the go Manager cuoi cung cua to chuc — hay chi dinh Manager khac truoc.");
      }
    }
    await this.membershipsRepository.remove(organizationId, targetUserId);
  }

  async listMembers(organizationId: string, requestedBy: string): Promise<OrganizationMemberView[]> {
    await this.assertIsManager(organizationId, requestedBy);
    return this.membershipsRepository.listForOrganization(organizationId);
  }

  /**
   * FR-ORG-006: branding nhe (chi mau accent) — KHONG duoc che khuat nguon/nhan xac minh cua
   * PhumData, nen chu de dung UI (border/badge accent), khong dieu khien layout noi dung chinh.
   */
  async updateBranding(id: string, brandColor: string | null, requestedBy: string): Promise<Organization> {
    await this.assertIsManager(id, requestedBy);
    return this.organizationsRepository.updateBrandColor(id, brandColor);
  }

  async invite(organizationId:string,email:string,role:"MANAGER"|"MEMBER",requestedBy:string){await this.assertIsManager(organizationId,requestedBy);const invite=await this.invitesRepository.create({organizationId,email,role,invitedBy:requestedBy});const delivered=await this.emailDeliveryService.sendOrganizationInvite(email,invite.token);await this.auditLogService.record({actorId:requestedBy,action:"ORGANIZATION_MEMBER_INVITED",targetType:"organization",targetId:organizationId,metadata:{inviteId:invite.id,role,delivered}});return {...invite,delivered};}
  async acceptInvite(token:string,user:{id:string;email:string}){const accepted=await this.invitesRepository.accept(token,user.id,user.email);if(!accepted)throw new BadRequestException("Loi moi khong hop le, da het han hoac khong dung email.");await this.auditLogService.record({actorId:user.id,action:"ORGANIZATION_INVITE_ACCEPTED",targetType:"organization",targetId:accepted.organizationId});return accepted;}

  async isManager(organizationId: string, userId: string): Promise<boolean> {
    const organization = await this.organizationsRepository.findById(organizationId);
    if (!organization || organization.status !== "ACTIVE") return false;
    const membership = await this.membershipsRepository.findMembership(organizationId, userId);
    return membership?.role === "MANAGER";
  }

  /** Dung lam ownership check trong module khac (vd Olympiad) qua facade — khong lo ton tai to chuc qua thong bao loi khac nhau (chong IDOR). */
  async assertIsManager(organizationId: string, userId: string): Promise<void> {
    const isManager = await this.isManager(organizationId, userId);
    if (!isManager) {
      throw new ForbiddenException("Ban khong phai Organization Manager cua to chuc nay (hoac to chuc chua duoc duyet).");
    }
  }
}
