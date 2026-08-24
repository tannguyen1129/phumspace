import { ArrayMaxSize, ArrayMinSize, IsArray, IsUUID } from "class-validator";

export class BuildItineraryDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(8)
  @IsUUID("4", { each: true })
  placeIds!: string[];
}
