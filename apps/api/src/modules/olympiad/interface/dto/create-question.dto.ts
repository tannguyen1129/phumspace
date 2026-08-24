import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsOptional, IsString, Length, ValidateNested } from "class-validator";

class QuestionChoiceDto {
  @IsString()
  @Length(1, 10)
  id!: string;

  @IsString()
  @Length(1, 300)
  text!: string;
}

export class CreateQuestionDto {
  @IsOptional()
  @IsString()
  entityId?: string;

  @IsString()
  @Length(1, 500)
  questionText!: string;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => QuestionChoiceDto)
  choices!: QuestionChoiceDto[];

  @IsString()
  correctChoiceId!: string;

  @IsOptional()
  @IsString()
  explanation?: string;
}
