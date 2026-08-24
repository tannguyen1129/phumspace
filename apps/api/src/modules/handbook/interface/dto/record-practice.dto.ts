import { IsIn, IsUUID } from "class-validator";
export class RecordPracticeDto {
  @IsUUID() termId!: string;
  @IsIn(["AGAIN", "HARD", "GOOD"]) result!: "AGAIN" | "HARD" | "GOOD";
}
