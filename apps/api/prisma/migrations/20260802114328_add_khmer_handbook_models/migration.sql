-- CreateTable
CREATE TABLE "khmer_term" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "access_level" "AccessLevel" NOT NULL DEFAULT 'PUBLIC',
    "current_version_id" UUID,
    "heritage_entity_id" UUID,
    "place_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "khmer_term_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "khmer_term_version" (
    "id" UUID NOT NULL,
    "term_id" UUID NOT NULL,
    "version_no" INTEGER NOT NULL,
    "publication_status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "script_text" TEXT NOT NULL,
    "normalized_script_text" TEXT NOT NULL,
    "transliteration" TEXT,
    "transliteration_system" TEXT,
    "part_of_speech" TEXT,
    "usage_register" TEXT,
    "short_definition_vi" TEXT NOT NULL,
    "short_definition_en" TEXT,
    "cultural_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "khmer_term_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "khmer_term_meaning" (
    "id" UUID NOT NULL,
    "term_version_id" UUID NOT NULL,
    "language_code" "LanguageCode" NOT NULL DEFAULT 'vi',
    "meaning_text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "source_resource_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "khmer_term_meaning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "khmer_term_example" (
    "id" UUID NOT NULL,
    "term_version_id" UUID NOT NULL,
    "khmer_text" TEXT NOT NULL,
    "normalized_khmer_text" TEXT NOT NULL,
    "transliteration" TEXT,
    "translation_vi" TEXT,
    "translation_en" TEXT,
    "context_note" TEXT,
    "source_resource_id" UUID,
    "order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "khmer_term_example_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "khmer_pronunciation" (
    "id" UUID NOT NULL,
    "term_version_id" UUID NOT NULL,
    "media_storage_key" TEXT,
    "speaker_attribution" TEXT,
    "speaker_region" TEXT,
    "pronunciation_variant" TEXT,
    "duration_seconds" INTEGER,
    "rights_status" TEXT NOT NULL DEFAULT 'PUBLIC_ALLOWED',
    "consent_reference" TEXT,
    "verification_status" "VerificationOutcome" NOT NULL DEFAULT 'SOURCE_VERIFIED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "khmer_pronunciation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "handbook_topic" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title_vi" TEXT NOT NULL,
    "title_km" TEXT,
    "description" TEXT,
    "status" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED',
    "order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "handbook_topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "khmer_term_topic" (
    "term_id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,

    CONSTRAINT "khmer_term_topic_pkey" PRIMARY KEY ("term_id","topic_id")
);

-- CreateTable
CREATE TABLE "handbook_collection" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED',
    "difficulty" "QuizDifficulty" DEFAULT 'EASY',
    "order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "handbook_collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "handbook_collection_item" (
    "collection_id" UUID NOT NULL,
    "term_id" UUID NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "handbook_collection_item_pkey" PRIMARY KEY ("collection_id","term_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "khmer_term_slug_key" ON "khmer_term"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "khmer_term_current_version_id_key" ON "khmer_term"("current_version_id");

-- CreateIndex
CREATE INDEX "khmer_term_slug_idx" ON "khmer_term"("slug");

-- CreateIndex
CREATE INDEX "khmer_term_status_idx" ON "khmer_term"("status");

-- CreateIndex
CREATE INDEX "khmer_term_version_term_id_idx" ON "khmer_term_version"("term_id");

-- CreateIndex
CREATE INDEX "khmer_term_version_normalized_script_text_idx" ON "khmer_term_version"("normalized_script_text");

-- CreateIndex
CREATE UNIQUE INDEX "khmer_term_version_term_id_version_no_key" ON "khmer_term_version"("term_id", "version_no");

-- CreateIndex
CREATE INDEX "khmer_term_meaning_term_version_id_idx" ON "khmer_term_meaning"("term_version_id");

-- CreateIndex
CREATE INDEX "khmer_term_example_term_version_id_idx" ON "khmer_term_example"("term_version_id");

-- CreateIndex
CREATE INDEX "khmer_pronunciation_term_version_id_idx" ON "khmer_pronunciation"("term_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "handbook_topic_slug_key" ON "handbook_topic"("slug");

-- CreateIndex
CREATE INDEX "handbook_topic_slug_idx" ON "handbook_topic"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "handbook_collection_slug_key" ON "handbook_collection"("slug");

-- CreateIndex
CREATE INDEX "handbook_collection_slug_idx" ON "handbook_collection"("slug");

-- AddForeignKey
ALTER TABLE "khmer_term" ADD CONSTRAINT "khmer_term_current_version_id_fkey" FOREIGN KEY ("current_version_id") REFERENCES "khmer_term_version"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "khmer_term" ADD CONSTRAINT "khmer_term_heritage_entity_id_fkey" FOREIGN KEY ("heritage_entity_id") REFERENCES "heritage_entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "khmer_term" ADD CONSTRAINT "khmer_term_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "khmer_term_version" ADD CONSTRAINT "khmer_term_version_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "khmer_term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "khmer_term_meaning" ADD CONSTRAINT "khmer_term_meaning_term_version_id_fkey" FOREIGN KEY ("term_version_id") REFERENCES "khmer_term_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "khmer_term_meaning" ADD CONSTRAINT "khmer_term_meaning_source_resource_id_fkey" FOREIGN KEY ("source_resource_id") REFERENCES "source_resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "khmer_term_example" ADD CONSTRAINT "khmer_term_example_term_version_id_fkey" FOREIGN KEY ("term_version_id") REFERENCES "khmer_term_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "khmer_term_example" ADD CONSTRAINT "khmer_term_example_source_resource_id_fkey" FOREIGN KEY ("source_resource_id") REFERENCES "source_resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "khmer_pronunciation" ADD CONSTRAINT "khmer_pronunciation_term_version_id_fkey" FOREIGN KEY ("term_version_id") REFERENCES "khmer_term_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "khmer_term_topic" ADD CONSTRAINT "khmer_term_topic_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "khmer_term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "khmer_term_topic" ADD CONSTRAINT "khmer_term_topic_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "handbook_topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handbook_collection_item" ADD CONSTRAINT "handbook_collection_item_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "handbook_collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handbook_collection_item" ADD CONSTRAINT "handbook_collection_item_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "khmer_term"("id") ON DELETE CASCADE ON UPDATE CASCADE;
