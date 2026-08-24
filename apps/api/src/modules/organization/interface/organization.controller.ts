import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../../common/auth/current-user.decorator";
import { JwtAuthGuard, type AuthenticatedUser } from "../../../common/auth/jwt-auth.guard";
import { Roles } from "../../../common/auth/roles.decorator";
import { RolesGuard } from "../../../common/auth/roles.guard";
import { OrganizationService } from "../application/organization.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { AddMemberDto } from "./dto/add-member.dto";
import { RejectOrganizationDto } from "./dto/reject-organization.dto";
import { UpdateBrandingDto } from "./dto/update-branding.dto";

/**
 * OrganizationController — FR-ORG-001..006. Tu M9, moi REGISTERED_USER goi POST / duoc (tao
 * yeu cau PENDING_APPROVAL); chi SYSTEM_ADMIN tao thang duoc ACTIVE va duyet/tu choi yeu cau
 * cua nguoi khac (xem OrganizationService.create/approve/reject).
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("organizations")
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get("health")
  health() {
    return { module: "organization", status: "ok" };
  }

  @Post()
  create(@CurrentUser() currentUser: AuthenticatedUser, @Body() dto: CreateOrganizationDto) {
    return this.organizationService.create({
      ...dto,
      createdBy: currentUser.id,
      createdByRole: currentUser.role,
    });
  }

  @Get()
  list() {
    return this.organizationService.list();
  }

  @Roles("SYSTEM_ADMIN")
  @Get("pending")
  listPending() {
    return this.organizationService.listPendingApproval();
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.organizationService.getById(id);
  }

  @Roles("SYSTEM_ADMIN")
  @Patch(":id/approve")
  approve(@CurrentUser() currentUser: AuthenticatedUser, @Param("id") id: string) {
    return this.organizationService.approve(id, currentUser.id);
  }

  @Roles("SYSTEM_ADMIN")
  @Patch(":id/reject")
  reject(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: RejectOrganizationDto
  ) {
    return this.organizationService.reject(id, currentUser.id, dto.reason);
  }

  @Post(":id/members")
  addMember(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: AddMemberDto
  ) {
    return this.organizationService.addMember({
      organizationId: id,
      userId: dto.userId,
      role: dto.role,
      requestedBy: currentUser.id,
    });
  }

  @Get(":id/members")
  listMembers(@CurrentUser() currentUser: AuthenticatedUser, @Param("id") id: string) {
    return this.organizationService.listMembers(id, currentUser.id);
  }

  @Delete(":id/members/:userId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id") id: string,
    @Param("userId") userId: string
  ) {
    await this.organizationService.removeMember(id, userId, currentUser.id);
  }

  @Patch(":id/branding")
  updateBranding(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateBrandingDto
  ) {
    return this.organizationService.updateBranding(id, dto.brandColor ?? null, currentUser.id);
  }

  @Post(":id/invites")
  invite(@CurrentUser()user:AuthenticatedUser,@Param("id")id:string,@Body()body:{email:string;role:"MANAGER"|"MEMBER"}){return this.organizationService.invite(id,body.email,body.role,user.id);}

  @Post("invites/accept")
  acceptInvite(@CurrentUser()user:AuthenticatedUser,@Body()body:{token:string}){return this.organizationService.acceptInvite(body.token,{id:user.id,email:user.email});}
}
