import { IsIn, IsOptional, IsString, Length } from "class-validator";
import { MODERATION_DECISIONS, type ModerationDecision } from "@phumspace/contracts";

export class DecideContributionDto {
  @IsIn(MODERATION_DECISIONS)
  decision!: ModerationDecision;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  reason?: string;
}
