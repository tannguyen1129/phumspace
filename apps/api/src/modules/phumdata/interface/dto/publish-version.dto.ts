import { IsIn } from "class-validator";
import { VERIFICATION_LEVELS, type VerificationLevel } from "@phumspace/contracts";

export class PublishVersionDto {
  @IsIn(VERIFICATION_LEVELS)
  verificationLevel!: VerificationLevel;
}
