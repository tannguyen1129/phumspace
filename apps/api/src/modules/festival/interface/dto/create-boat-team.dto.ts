import { IsHexColor, IsOptional, IsString, IsUUID, Length } from "class-validator";

export class CreateBoatTeamDto {
  @IsString()
  @Length(1, 200)
  displayName!: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsUUID()
  homePlaceId?: string;

  @IsOptional()
  @IsHexColor()
  symbolColor?: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  story?: string;
}
