import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
const TYPES = [
  "CORRECT",
  "INCORRECT",
  "UNSURE",
  "SELECTED_CANDIDATE",
  "REQUEST_REVIEW",
] as const;
export class ScanFeedbackDto {
  @IsIn(TYPES) feedbackType!: (typeof TYPES)[number];
  @IsOptional() @IsUUID() selectedEntityId?: string;
  @IsOptional() @IsString() @MaxLength(500) note?: string;
}
