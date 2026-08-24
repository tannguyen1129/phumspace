import {
  IsIn,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import {
  ACCESS_LEVELS,
  PLACE_TYPES,
  SENSITIVITY_LEVELS,
  type AccessLevel,
  type PlaceType,
  type SensitivityLevel,
} from "@phumspace/contracts";

export class CreatePlaceDto {
  @IsString()
  @Length(2, 80)
  canonicalCode!: string;

  @IsIn(PLACE_TYPES)
  placeType!: PlaceType;

  @IsString()
  @Length(1, 200)
  preferredLabel!: string;

  @IsOptional()
  @IsString()
  localName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(ACCESS_LEVELS)
  accessLevel!: AccessLevel;

  @IsIn(SENSITIVITY_LEVELS)
  sensitivityLevel!: SensitivityLevel;

  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;

  @IsOptional()
  @IsString()
  visitorSummary?: string;

  @IsOptional()
  @IsString()
  openingHoursNote?: string;

  @IsOptional()
  @IsString()
  etiquetteNote?: string;

  @IsOptional()
  @IsString()
  administrativeArea?: string;
}
