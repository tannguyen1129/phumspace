import { ArrayMinSize, IsArray, IsOptional, IsString, IsUUID, Length } from "class-validator";

export class CreateCompetitionDto {
  @IsString()
  @Length(1, 200)
  title!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  questionIds!: string[];

  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
