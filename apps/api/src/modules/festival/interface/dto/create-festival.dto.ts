import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from "class-validator";
import {
  ACCESS_LEVELS,
  FESTIVAL_FACILITY_TYPES,
  FESTIVAL_OCCURRENCE_STATUSES,
  SENSITIVITY_LEVELS,
  type AccessLevel,
  type FestivalFacilityType,
  type FestivalOccurrenceStatus,
  type SensitivityLevel,
} from "@phumspace/contracts";

class FestivalEventInputDto {
  @IsString()
  @Length(1, 60)
  eventType!: string;

  @IsString()
  @Length(1, 200)
  title!: string;

  @IsOptional()
  @IsISO8601()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

class FestivalFacilityInputDto {
  @IsIn(FESTIVAL_FACILITY_TYPES)
  facilityType!: FestivalFacilityType;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

class FestivalOccurrenceInputDto {
  @IsOptional()
  @IsUUID()
  placeId?: string;

  @IsISO8601()
  startsAt!: string;

  @IsOptional()
  @IsISO8601()
  endsAt?: string;

  @IsOptional()
  @IsIn(FESTIVAL_OCCURRENCE_STATUSES)
  status?: FestivalOccurrenceStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FestivalEventInputDto)
  events?: FestivalEventInputDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FestivalFacilityInputDto)
  facilities?: FestivalFacilityInputDto[];
}

export class CreateFestivalDto {
  @IsString()
  @Length(2, 80)
  canonicalCode!: string;

  @IsString()
  @Length(1, 200)
  preferredLabel!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(ACCESS_LEVELS)
  accessLevel!: AccessLevel;

  @IsIn(SENSITIVITY_LEVELS)
  sensitivityLevel!: SensitivityLevel;

  @IsOptional()
  @IsString()
  recurrenceRule?: string;

  @IsOptional()
  @IsUUID()
  organizerOrgId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FestivalOccurrenceInputDto)
  occurrences!: FestivalOccurrenceInputDto[];
}
