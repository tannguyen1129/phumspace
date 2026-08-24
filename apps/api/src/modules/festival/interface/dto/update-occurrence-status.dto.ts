import { IsIn } from "class-validator";
import { FESTIVAL_OCCURRENCE_STATUSES, type FestivalOccurrenceStatus } from "@phumspace/contracts";

export class UpdateOccurrenceStatusDto {
  @IsIn(FESTIVAL_OCCURRENCE_STATUSES)
  status!: FestivalOccurrenceStatus;
}
