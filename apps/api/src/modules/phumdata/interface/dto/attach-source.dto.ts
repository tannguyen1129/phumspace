import { IsUUID } from "class-validator";

export class AttachSourceDto {
  @IsUUID()
  sourceId!: string;
}
