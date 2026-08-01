-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('PUBLIC', 'EDUCATIONAL', 'RESEARCH', 'COMMUNITY_ONLY', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('ARTIFACT', 'ARCHITECTURE', 'FESTIVAL', 'PERFORMING_ART', 'CRAFT', 'BELIEF', 'LITERATURE', 'PLACE');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "NameType" AS ENUM ('PREFERRED', 'ALTERNATE', 'HISTORICAL', 'LOCAL', 'TRANSLITERATION', 'TRANSLATION');

-- CreateEnum
CREATE TYPE "LanguageCode" AS ENUM ('vi', 'km', 'en');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('BOOK', 'ARTICLE', 'ARCHIVE', 'INTERVIEW', 'FIELD_NOTE', 'PHOTO', 'AUDIO', 'VIDEO', 'WEBSITE', 'DATASET');

-- CreateEnum
CREATE TYPE "SupportType" AS ENUM ('SUPPORTS', 'CONTRADICTS', 'CONTEXTUALIZES');

-- CreateEnum
CREATE TYPE "VerificationOutcome" AS ENUM ('UNVERIFIED', 'COMMUNITY_CONFIRMED', 'SOURCE_VERIFIED', 'EXPERT_REVIEWED');

-- CreateEnum
CREATE TYPE "PublicationEventType" AS ENUM ('PUBLISH', 'ROLLBACK');

-- CreateTable
CREATE TABLE "heritage_entity" (
    "id" UUID NOT NULL,
    "canonical_code" TEXT NOT NULL,
    "type" "EntityType" NOT NULL,
    "access_level" "AccessLevel" NOT NULL DEFAULT 'PUBLIC',
    "current_version_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "heritage_entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "heritage_entity_version" (
    "id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "version_no" INTEGER NOT NULL,
    "publication_status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "summary" TEXT NOT NULL,
    "historical_content" TEXT,
    "cultural_meaning" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "heritage_entity_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "heritage_entity_name" (
    "id" UUID NOT NULL,
    "version_id" UUID NOT NULL,
    "language" "LanguageCode" NOT NULL,
    "name_type" "NameType" NOT NULL,
    "original_value" TEXT NOT NULL,
    "normalized_value" TEXT NOT NULL,
    "script" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "heritage_entity_name_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "heritage_category" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "heritage_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "heritage_entity_category" (
    "entity_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,

    CONSTRAINT "heritage_entity_category_pkey" PRIMARY KEY ("entity_id","category_id")
);

-- CreateTable
CREATE TABLE "place" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "summary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "heritage_entity_place" (
    "entity_id" UUID NOT NULL,
    "place_id" UUID NOT NULL,

    CONSTRAINT "heritage_entity_place_pkey" PRIMARY KEY ("entity_id","place_id")
);

-- CreateTable
CREATE TABLE "source_resource" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "creator" TEXT,
    "source_type" "SourceType" NOT NULL,
    "locator" TEXT,
    "rights" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "source_resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_assertion" (
    "id" UUID NOT NULL,
    "version_id" UUID NOT NULL,
    "source_id" UUID NOT NULL,
    "claim_text" TEXT NOT NULL,
    "field_path" TEXT,
    "support_type" "SupportType" NOT NULL DEFAULT 'SUPPORTS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evidence_assertion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_record" (
    "id" UUID NOT NULL,
    "version_id" UUID NOT NULL,
    "reviewer_name" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "outcome" "VerificationOutcome" NOT NULL,
    "verified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publication_event" (
    "id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "version_id" UUID NOT NULL,
    "publisher_name" TEXT NOT NULL,
    "event_type" "PublicationEventType" NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publication_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "heritage_entity_canonical_code_key" ON "heritage_entity"("canonical_code");

-- CreateIndex
CREATE UNIQUE INDEX "heritage_entity_current_version_id_key" ON "heritage_entity"("current_version_id");

-- CreateIndex
CREATE INDEX "heritage_entity_canonical_code_idx" ON "heritage_entity"("canonical_code");

-- CreateIndex
CREATE INDEX "heritage_entity_type_idx" ON "heritage_entity"("type");

-- CreateIndex
CREATE INDEX "heritage_entity_access_level_idx" ON "heritage_entity"("access_level");

-- CreateIndex
CREATE INDEX "heritage_entity_version_entity_id_idx" ON "heritage_entity_version"("entity_id");

-- CreateIndex
CREATE INDEX "heritage_entity_version_publication_status_idx" ON "heritage_entity_version"("publication_status");

-- CreateIndex
CREATE UNIQUE INDEX "heritage_entity_version_entity_id_version_no_key" ON "heritage_entity_version"("entity_id", "version_no");

-- CreateIndex
CREATE INDEX "heritage_entity_name_version_id_idx" ON "heritage_entity_name"("version_id");

-- CreateIndex
CREATE INDEX "heritage_entity_name_normalized_value_idx" ON "heritage_entity_name"("normalized_value");

-- CreateIndex
CREATE UNIQUE INDEX "heritage_entity_name_version_id_language_name_type_original_key" ON "heritage_entity_name"("version_id", "language", "name_type", "original_value");

-- CreateIndex
CREATE UNIQUE INDEX "heritage_category_slug_key" ON "heritage_category"("slug");

-- CreateIndex
CREATE INDEX "heritage_category_slug_idx" ON "heritage_category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "place_slug_key" ON "place"("slug");

-- CreateIndex
CREATE INDEX "place_slug_idx" ON "place"("slug");

-- CreateIndex
CREATE INDEX "evidence_assertion_version_id_idx" ON "evidence_assertion"("version_id");

-- CreateIndex
CREATE INDEX "evidence_assertion_source_id_idx" ON "evidence_assertion"("source_id");

-- CreateIndex
CREATE INDEX "verification_record_version_id_idx" ON "verification_record"("version_id");

-- CreateIndex
CREATE INDEX "publication_event_entity_id_idx" ON "publication_event"("entity_id");

-- AddForeignKey
ALTER TABLE "heritage_entity" ADD CONSTRAINT "heritage_entity_current_version_id_fkey" FOREIGN KEY ("current_version_id") REFERENCES "heritage_entity_version"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heritage_entity_version" ADD CONSTRAINT "heritage_entity_version_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "heritage_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heritage_entity_name" ADD CONSTRAINT "heritage_entity_name_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "heritage_entity_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heritage_entity_category" ADD CONSTRAINT "heritage_entity_category_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "heritage_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heritage_entity_category" ADD CONSTRAINT "heritage_entity_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "heritage_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heritage_entity_place" ADD CONSTRAINT "heritage_entity_place_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "heritage_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heritage_entity_place" ADD CONSTRAINT "heritage_entity_place_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_assertion" ADD CONSTRAINT "evidence_assertion_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "heritage_entity_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_assertion" ADD CONSTRAINT "evidence_assertion_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "source_resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_record" ADD CONSTRAINT "verification_record_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "heritage_entity_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publication_event" ADD CONSTRAINT "publication_event_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "heritage_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
