import { IsIn, IsOptional, IsString, Length } from "class-validator";
import {
  ACCESS_LEVELS,
  ENTITY_TYPES,
  SENSITIVITY_LEVELS,
  type AccessLevel,
  type EntityType,
  type SensitivityLevel,
} from "@phumspace/contracts";

export class CreateEntityDto {
  @IsString()
  @Length(2, 80)
  canonicalCode!: string;

  @IsIn(ENTITY_TYPES)
  entityType!: EntityType;

  @IsIn(ACCESS_LEVELS)
  accessLevel!: AccessLevel;

  @IsString()
  @Length(1, 200)
  preferredLabel!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(SENSITIVITY_LEVELS)
  sensitivityLevel!: SensitivityLevel;
}
