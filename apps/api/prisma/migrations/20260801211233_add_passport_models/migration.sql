-- CreateEnum
CREATE TYPE "PassportStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PassportActivityType" AS ENUM ('QUIZ_COMPLETED', 'QUIZ_PASSED', 'PERFECT_QUIZ', 'SCAN_MATCHED');

-- CreateEnum
CREATE TYPE "AchievementStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "passport" (
    "id" UUID NOT NULL,
    "status" "PassportStatus" NOT NULL DEFAULT 'ACTIVE',
    "total_points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "passport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passport_session" (
    "id" UUID NOT NULL,
    "passport_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "passport_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passport_activity" (
    "id" UUID NOT NULL,
    "passport_id" UUID NOT NULL,
    "activity_type" "PassportActivityType" NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "points_awarded" INTEGER NOT NULL DEFAULT 0,
    "idempotency_key" TEXT NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "passport_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon_key" TEXT NOT NULL,
    "status" "AchievementStatus" NOT NULL DEFAULT 'PUBLISHED',
    "rule_type" TEXT NOT NULL,
    "rule_config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passport_achievement" (
    "id" UUID NOT NULL,
    "passport_id" UUID NOT NULL,
    "achievement_id" UUID NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "triggering_activity_id" TEXT,

    CONSTRAINT "passport_achievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "passport_status_idx" ON "passport"("status");

-- CreateIndex
CREATE UNIQUE INDEX "passport_session_token_hash_key" ON "passport_session"("token_hash");

-- CreateIndex
CREATE INDEX "passport_session_passport_id_idx" ON "passport_session"("passport_id");

-- CreateIndex
CREATE INDEX "passport_session_token_hash_idx" ON "passport_session"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "passport_activity_idempotency_key_key" ON "passport_activity"("idempotency_key");

-- CreateIndex
CREATE INDEX "passport_activity_passport_id_idx" ON "passport_activity"("passport_id");

-- CreateIndex
CREATE INDEX "passport_activity_idempotency_key_idx" ON "passport_activity"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "achievement_code_key" ON "achievement"("code");

-- CreateIndex
CREATE INDEX "achievement_code_idx" ON "achievement"("code");

-- CreateIndex
CREATE INDEX "achievement_status_idx" ON "achievement"("status");

-- CreateIndex
CREATE INDEX "passport_achievement_passport_id_idx" ON "passport_achievement"("passport_id");

-- CreateIndex
CREATE UNIQUE INDEX "passport_achievement_passport_id_achievement_id_key" ON "passport_achievement"("passport_id", "achievement_id");

-- AddForeignKey
ALTER TABLE "passport_session" ADD CONSTRAINT "passport_session_passport_id_fkey" FOREIGN KEY ("passport_id") REFERENCES "passport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passport_activity" ADD CONSTRAINT "passport_activity_passport_id_fkey" FOREIGN KEY ("passport_id") REFERENCES "passport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passport_achievement" ADD CONSTRAINT "passport_achievement_passport_id_fkey" FOREIGN KEY ("passport_id") REFERENCES "passport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passport_achievement" ADD CONSTRAINT "passport_achievement_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
