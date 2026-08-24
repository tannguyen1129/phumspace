import { IsString, Length } from "class-validator";

export class RejectOrganizationDto {
  @IsString()
  @Length(1, 500)
  reason!: string;
}
