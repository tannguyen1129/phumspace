import { IsIn, IsOptional, IsString, Length } from "class-validator";
import { SENSITIVITY_LEVELS, type SensitivityLevel } from "@phumspace/contracts";

export class CreateVersionDto {
  @IsString()
  @Length(1, 200)
  preferredLabel!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(SENSITIVITY_LEVELS)
  sensitivityLevel!: SensitivityLevel;
}
