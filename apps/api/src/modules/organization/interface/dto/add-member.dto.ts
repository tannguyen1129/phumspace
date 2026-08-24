import { IsIn, IsUUID } from "class-validator";
import { ORGANIZATION_MEMBER_ROLES, type OrganizationMemberRole } from "@phumspace/contracts";

export class AddMemberDto {
  @IsUUID()
  userId!: string;

  @IsIn(ORGANIZATION_MEMBER_ROLES)
  role!: OrganizationMemberRole;
}
