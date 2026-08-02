-- CreateEnum
CREATE TYPE "PlaceType" AS ENUM ('TEMPLE', 'MUSEUM', 'CULTURAL_SITE', 'FESTIVAL_VENUE', 'CRAFT_VILLAGE', 'FOOD_LOCATION', 'OTHER');

-- AlterTable
ALTER TABLE "place" ADD COLUMN     "administrative_area" TEXT,
ADD COLUMN     "coordinate_accuracy" TEXT,
ADD COLUMN     "map_visibility" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "place_type" "PlaceType" NOT NULL DEFAULT 'CULTURAL_SITE';

-- CreateIndex
CREATE INDEX "place_place_type_idx" ON "place"("place_type");

-- CreateIndex
CREATE INDEX "place_map_visibility_idx" ON "place"("map_visibility");
