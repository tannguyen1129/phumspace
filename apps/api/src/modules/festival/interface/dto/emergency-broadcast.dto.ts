import { IsIn, IsISO8601, IsOptional, IsString, Length } from "class-validator";
import { NOTIFICATION_PRIORITIES, type NotificationPriority } from "@phumspace/contracts";

export class EmergencyBroadcastDto {
  @IsString()
  @Length(1, 200)
  title!: string;

  @IsString()
  @Length(1, 1000)
  body!: string;

  @IsOptional()
  @IsIn(NOTIFICATION_PRIORITIES)
  priority?: NotificationPriority;

  @IsOptional()
  @IsISO8601()
  expiresAt?: string;
}
