import { IsIn, IsUUID } from "class-validator";
import { RELATION_TYPES, type RelationType } from "@phumspace/contracts";

export class CreateRelationDto {
  @IsUUID()
  subjectEntityId!: string;

  @IsIn(RELATION_TYPES)
  predicate!: RelationType;

  @IsUUID()
  objectEntityId!: string;
}
