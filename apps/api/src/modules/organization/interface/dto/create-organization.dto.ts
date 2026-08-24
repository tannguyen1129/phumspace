import { IsIn, IsOptional, IsString, IsUUID, Length } from "class-validator";
import { ORGANIZATION_TYPES, type OrganizationType } from "@phumspace/contracts";

export class CreateOrganizationDto {
  @IsString()
  @Length(1, 200)
  name!: string;

  @IsIn(ORGANIZATION_TYPES)
  orgType!: OrganizationType;

  @IsOptional()
  @IsUUID()
  homePlaceId?: string;
}
