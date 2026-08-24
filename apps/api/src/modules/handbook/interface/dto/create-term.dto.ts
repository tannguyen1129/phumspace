import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, Length, ValidateNested } from "class-validator";

class TermExampleDto {
  @IsString()
  @Length(1, 500)
  exampleKhmer!: string;

  @IsString()
  @Length(1, 500)
  exampleVi!: string;
}

export class CreateTermDto {
  @IsString()
  @Length(1, 200)
  khmerText!: string;

  @IsOptional()
  @IsString()
  latinTransliteration?: string;

  @IsString()
  @Length(1, 500)
  meaningVi!: string;

  @IsOptional()
  @IsString()
  meaningEn?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TermExampleDto)
  examples?: TermExampleDto[];
}
