import { IsIn, IsUUID } from "class-validator";
import { FOLLOW_TARGET_TYPES, type FollowTargetType } from "@phumspace/contracts";

export class FollowTargetDto {
  @IsIn(FOLLOW_TARGET_TYPES)
  targetType!: FollowTargetType;

  @IsUUID()
  targetId!: string;
}
