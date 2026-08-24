import { IsIn } from "class-validator";
import { LEARNING_PROGRESS_STATUSES, type LearningProgressStatus } from "@phumspace/contracts";

export class UpdateProgressDto {
  @IsIn(LEARNING_PROGRESS_STATUSES)
  status!: LearningProgressStatus;
}
