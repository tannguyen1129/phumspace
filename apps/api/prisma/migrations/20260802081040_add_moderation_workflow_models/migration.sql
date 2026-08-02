-- CreateEnum
CREATE TYPE "ReviewAssignmentStatus" AS ENUM ('ACTIVE', 'RELEASED', 'COMPLETED', 'EXPIRED');

-- AlterTable
ALTER TABLE "community_contribution" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "contribution_review_assignment" (
    "id" UUID NOT NULL,
    "contribution_id" UUID NOT NULL,
    "assigned_staff_user_id" UUID NOT NULL,
    "assigned_by_staff_user_id" UUID,
    "status" "ReviewAssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "released_at" TIMESTAMP(3),

    CONSTRAINT "contribution_review_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contribution_review" (
    "id" UUID NOT NULL,
    "contribution_id" UUID NOT NULL,
    "reviewer_staff_user_id" UUID NOT NULL,
    "recommendation" TEXT NOT NULL,
    "publicMessage" TEXT,
    "internalNote" TEXT,
    "checklist_result" JSONB,
    "reviewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contribution_review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contribution_review_assignment_contribution_id_idx" ON "contribution_review_assignment"("contribution_id");

-- CreateIndex
CREATE INDEX "contribution_review_assignment_assigned_staff_user_id_idx" ON "contribution_review_assignment"("assigned_staff_user_id");

-- CreateIndex
CREATE INDEX "contribution_review_contribution_id_idx" ON "contribution_review"("contribution_id");

-- AddForeignKey
ALTER TABLE "contribution_review_assignment" ADD CONSTRAINT "contribution_review_assignment_contribution_id_fkey" FOREIGN KEY ("contribution_id") REFERENCES "community_contribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution_review_assignment" ADD CONSTRAINT "contribution_review_assignment_assigned_staff_user_id_fkey" FOREIGN KEY ("assigned_staff_user_id") REFERENCES "staff_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution_review_assignment" ADD CONSTRAINT "contribution_review_assignment_assigned_by_staff_user_id_fkey" FOREIGN KEY ("assigned_by_staff_user_id") REFERENCES "staff_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution_review" ADD CONSTRAINT "contribution_review_contribution_id_fkey" FOREIGN KEY ("contribution_id") REFERENCES "community_contribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution_review" ADD CONSTRAINT "contribution_review_reviewer_staff_user_id_fkey" FOREIGN KEY ("reviewer_staff_user_id") REFERENCES "staff_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
