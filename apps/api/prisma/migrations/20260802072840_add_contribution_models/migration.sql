-- CreateEnum
CREATE TYPE "ContributionType" AS ENUM ('NEW_HERITAGE_CONTENT', 'CORRECTION', 'LOCAL_NAME', 'KHMER_LANGUAGE', 'AUDIO_RECORDING', 'IMAGE_MEDIA', 'PLACE_INFORMATION', 'CULTURAL_STORY');

-- CreateEnum
CREATE TYPE "ContributionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'NEEDS_MORE_INFORMATION', 'APPROVED', 'REJECTED', 'WITHDRAWN', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ContributionMediaType" AS ENUM ('IMAGE', 'AUDIO');

-- CreateTable
CREATE TABLE "community_contribution" (
    "id" UUID NOT NULL,
    "public_id" UUID NOT NULL,
    "passport_id" UUID,
    "contribution_type" "ContributionType" NOT NULL,
    "status" "ContributionStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "language_code" "LanguageCode" NOT NULL DEFAULT 'vi',
    "related_heritage_entity_id" UUID,
    "related_place_id" UUID,
    "submitted_at" TIMESTAMP(3),
    "withdrawn_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_contribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contribution_field" (
    "id" UUID NOT NULL,
    "contribution_id" UUID NOT NULL,
    "field_key" TEXT NOT NULL,
    "submitted_value" TEXT NOT NULL,
    "language_code" "LanguageCode",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contribution_field_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contribution_media" (
    "id" UUID NOT NULL,
    "contribution_id" UUID NOT NULL,
    "media_type" "ContributionMediaType" NOT NULL,
    "storage_key" TEXT NOT NULL,
    "original_file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "checksum" TEXT,
    "duration_seconds" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contribution_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contribution_consent" (
    "id" UUID NOT NULL,
    "contribution_id" UUID NOT NULL,
    "consent_version" TEXT NOT NULL DEFAULT '1.0.0',
    "contributor_owns_rights" BOOLEAN NOT NULL DEFAULT true,
    "allow_public_display" BOOLEAN NOT NULL DEFAULT true,
    "allow_educational_use" BOOLEAN NOT NULL DEFAULT true,
    "allow_research_use" BOOLEAN NOT NULL DEFAULT true,
    "allow_commercial_use" BOOLEAN NOT NULL DEFAULT false,
    "allow_ai_processing" BOOLEAN NOT NULL DEFAULT false,
    "attribution_preference" TEXT NOT NULL DEFAULT 'COMMUNITY',
    "consented_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawn_at" TIMESTAMP(3),

    CONSTRAINT "contribution_consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contribution_status_history" (
    "id" UUID NOT NULL,
    "contribution_id" UUID NOT NULL,
    "from_status" "ContributionStatus" NOT NULL,
    "to_status" "ContributionStatus" NOT NULL,
    "reason_code" TEXT,
    "public_message" TEXT,
    "actor_type" TEXT NOT NULL DEFAULT 'GUEST_USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contribution_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "community_contribution_public_id_key" ON "community_contribution"("public_id");

-- CreateIndex
CREATE INDEX "community_contribution_public_id_idx" ON "community_contribution"("public_id");

-- CreateIndex
CREATE INDEX "community_contribution_passport_id_idx" ON "community_contribution"("passport_id");

-- CreateIndex
CREATE INDEX "community_contribution_status_idx" ON "community_contribution"("status");

-- CreateIndex
CREATE INDEX "contribution_field_contribution_id_idx" ON "contribution_field"("contribution_id");

-- CreateIndex
CREATE INDEX "contribution_media_contribution_id_idx" ON "contribution_media"("contribution_id");

-- CreateIndex
CREATE UNIQUE INDEX "contribution_consent_contribution_id_key" ON "contribution_consent"("contribution_id");

-- CreateIndex
CREATE INDEX "contribution_status_history_contribution_id_idx" ON "contribution_status_history"("contribution_id");

-- AddForeignKey
ALTER TABLE "community_contribution" ADD CONSTRAINT "community_contribution_passport_id_fkey" FOREIGN KEY ("passport_id") REFERENCES "passport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_contribution" ADD CONSTRAINT "community_contribution_related_heritage_entity_id_fkey" FOREIGN KEY ("related_heritage_entity_id") REFERENCES "heritage_entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_contribution" ADD CONSTRAINT "community_contribution_related_place_id_fkey" FOREIGN KEY ("related_place_id") REFERENCES "place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution_field" ADD CONSTRAINT "contribution_field_contribution_id_fkey" FOREIGN KEY ("contribution_id") REFERENCES "community_contribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution_media" ADD CONSTRAINT "contribution_media_contribution_id_fkey" FOREIGN KEY ("contribution_id") REFERENCES "community_contribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution_consent" ADD CONSTRAINT "contribution_consent_contribution_id_fkey" FOREIGN KEY ("contribution_id") REFERENCES "community_contribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution_status_history" ADD CONSTRAINT "contribution_status_history_contribution_id_fkey" FOREIGN KEY ("contribution_id") REFERENCES "community_contribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
