-- CreateEnum
CREATE TYPE "TermLearningStatus" AS ENUM ('NEW', 'LEARNING', 'LEARNED');

-- AlterEnum
ALTER TYPE "PassportActivityType" ADD VALUE 'HANDBOOK_COLLECTION_COMPLETED';

-- CreateTable
CREATE TABLE "passport_term_progress" (
    "id" UUID NOT NULL,
    "passport_id" UUID NOT NULL,
    "term_id" UUID NOT NULL,
    "status" "TermLearningStatus" NOT NULL DEFAULT 'LEARNING',
    "first_viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_reviewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "learned_at" TIMESTAMP(3),
    "review_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passport_term_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passport_collection_progress" (
    "id" UUID NOT NULL,
    "passport_id" UUID NOT NULL,
    "collection_id" UUID NOT NULL,
    "learned_term_count" INTEGER NOT NULL DEFAULT 0,
    "total_term_count_snapshot" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passport_collection_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "passport_term_progress_passport_id_idx" ON "passport_term_progress"("passport_id");

-- CreateIndex
CREATE UNIQUE INDEX "passport_term_progress_passport_id_term_id_key" ON "passport_term_progress"("passport_id", "term_id");

-- CreateIndex
CREATE INDEX "passport_collection_progress_passport_id_idx" ON "passport_collection_progress"("passport_id");

-- CreateIndex
CREATE UNIQUE INDEX "passport_collection_progress_passport_id_collection_id_key" ON "passport_collection_progress"("passport_id", "collection_id");

-- AddForeignKey
ALTER TABLE "passport_term_progress" ADD CONSTRAINT "passport_term_progress_passport_id_fkey" FOREIGN KEY ("passport_id") REFERENCES "passport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passport_term_progress" ADD CONSTRAINT "passport_term_progress_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "khmer_term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passport_collection_progress" ADD CONSTRAINT "passport_collection_progress_passport_id_fkey" FOREIGN KEY ("passport_id") REFERENCES "passport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passport_collection_progress" ADD CONSTRAINT "passport_collection_progress_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "handbook_collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
