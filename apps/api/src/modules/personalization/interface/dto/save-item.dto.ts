import { IsOptional, IsUUID } from "class-validator";

/** Chi dung 1 trong 2 truong — controller kiem tra "exactly one" truoc khi goi service. */
export class SaveItemDto {
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @IsUUID()
  termId?: string;
}
