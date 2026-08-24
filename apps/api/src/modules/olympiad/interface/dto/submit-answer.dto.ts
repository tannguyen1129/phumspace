import { IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class SubmitAnswerDto {
  @IsString()
  questionId!: string;

  @IsString()
  selectedChoiceId!: string;

  @IsOptional() @IsUUID() idempotencyKey?: string;
  @IsOptional() @IsInt() @Min(1) questionVersion?: number;
}
