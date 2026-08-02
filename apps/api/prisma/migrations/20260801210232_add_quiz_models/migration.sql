-- CreateEnum
CREATE TYPE "QuizStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "QuizDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateTable
CREATE TABLE "quiz" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "QuizStatus" NOT NULL DEFAULT 'DRAFT',
    "difficulty" "QuizDifficulty" NOT NULL DEFAULT 'EASY',
    "passing_score" INTEGER NOT NULL DEFAULT 70,
    "estimated_minutes" INTEGER NOT NULL DEFAULT 5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_question" (
    "id" UUID NOT NULL,
    "quiz_id" UUID NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_type" "QuestionType" NOT NULL DEFAULT 'SINGLE_CHOICE',
    "explanation" TEXT,
    "order" INTEGER NOT NULL DEFAULT 1,
    "points" INTEGER NOT NULL DEFAULT 10,
    "status" "QuizStatus" NOT NULL DEFAULT 'PUBLISHED',
    "heritage_entity_id" UUID,
    "source_resource_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_question_option" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "option_text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_question_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempt" (
    "id" UUID NOT NULL,
    "attempt_token" TEXT NOT NULL,
    "quiz_id" UUID NOT NULL,
    "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "total_questions" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "max_possible_score" INTEGER NOT NULL DEFAULT 0,
    "percentage_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_passed" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_answer" (
    "id" UUID NOT NULL,
    "attempt_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "selected_option_id" UUID,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "awarded_points" INTEGER NOT NULL DEFAULT 0,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quiz_slug_key" ON "quiz"("slug");

-- CreateIndex
CREATE INDEX "quiz_slug_idx" ON "quiz"("slug");

-- CreateIndex
CREATE INDEX "quiz_status_idx" ON "quiz"("status");

-- CreateIndex
CREATE INDEX "quiz_question_quiz_id_idx" ON "quiz_question"("quiz_id");

-- CreateIndex
CREATE INDEX "quiz_question_status_idx" ON "quiz_question"("status");

-- CreateIndex
CREATE INDEX "quiz_question_option_question_id_idx" ON "quiz_question_option"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_attempt_attempt_token_key" ON "quiz_attempt"("attempt_token");

-- CreateIndex
CREATE INDEX "quiz_attempt_attempt_token_idx" ON "quiz_attempt"("attempt_token");

-- CreateIndex
CREATE INDEX "quiz_attempt_quiz_id_idx" ON "quiz_attempt"("quiz_id");

-- CreateIndex
CREATE INDEX "quiz_answer_attempt_id_idx" ON "quiz_answer"("attempt_id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_answer_attempt_id_question_id_key" ON "quiz_answer"("attempt_id", "question_id");

-- AddForeignKey
ALTER TABLE "quiz_question" ADD CONSTRAINT "quiz_question_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_question" ADD CONSTRAINT "quiz_question_heritage_entity_id_fkey" FOREIGN KEY ("heritage_entity_id") REFERENCES "heritage_entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_question" ADD CONSTRAINT "quiz_question_source_resource_id_fkey" FOREIGN KEY ("source_resource_id") REFERENCES "source_resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_question_option" ADD CONSTRAINT "quiz_question_option_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quiz_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempt" ADD CONSTRAINT "quiz_attempt_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answer" ADD CONSTRAINT "quiz_answer_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answer" ADD CONSTRAINT "quiz_answer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quiz_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answer" ADD CONSTRAINT "quiz_answer_selected_option_id_fkey" FOREIGN KEY ("selected_option_id") REFERENCES "quiz_question_option"("id") ON DELETE SET NULL ON UPDATE CASCADE;
