import { IsUUID } from "class-validator";

export class AttachCategoryDto {
  @IsUUID()
  termId!: string;
}
