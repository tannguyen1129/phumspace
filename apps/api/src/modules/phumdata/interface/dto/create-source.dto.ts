import { IsOptional, IsString, IsUrl, Length } from "class-validator";

export class CreateSourceDto {
  @IsString()
  @Length(1, 300)
  title!: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  reliability?: string;
}
