import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsOptional, IsString, Length, ValidateNested } from "class-validator";

class AccessibilityPreferencesDto {
  @IsOptional()
  @IsBoolean()
  reducedMotion?: boolean;

  @IsOptional()
  @IsBoolean()
  largeText?: boolean;
}

class NotificationPreferencesDto {
  @IsOptional() @IsBoolean() inApp?: boolean;
  @IsOptional() @IsBoolean() email?: boolean;
  @IsOptional() @IsBoolean() festivalUpdates?: boolean;
  @IsOptional() @IsBoolean() securityAlerts?: boolean;
}

export class UpdatePreferencesDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  displayName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 10)
  preferredLanguage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => AccessibilityPreferencesDto)
  accessibilityPreferences?: AccessibilityPreferencesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationPreferencesDto)
  notificationPreferences?: NotificationPreferencesDto;
}
