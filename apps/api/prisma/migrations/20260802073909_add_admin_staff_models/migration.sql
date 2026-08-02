-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'REVOKED');

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('REVIEWER', 'EDITOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "SecurityEventType" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'SESSION_CREATED', 'SESSION_REVOKED', 'ACCESS_DENIED', 'ROLE_CHANGED');

-- CreateTable
CREATE TABLE "staff_user" (
    "id" UUID NOT NULL,
    "external_provider" TEXT NOT NULL DEFAULT 'google',
    "external_subject" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "status" "StaffStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "staff_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_session" (
    "id" UUID NOT NULL,
    "staff_user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_role_assignment" (
    "id" UUID NOT NULL,
    "staff_user_id" UUID NOT NULL,
    "role" "StaffRole" NOT NULL,
    "created_by_staff_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_role_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_security_event" (
    "id" UUID NOT NULL,
    "staff_user_id" UUID,
    "event_type" "SecurityEventType" NOT NULL,
    "outcome" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_security_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_user_email_key" ON "staff_user"("email");

-- CreateIndex
CREATE INDEX "staff_user_email_idx" ON "staff_user"("email");

-- CreateIndex
CREATE INDEX "staff_user_status_idx" ON "staff_user"("status");

-- CreateIndex
CREATE UNIQUE INDEX "staff_user_external_provider_external_subject_key" ON "staff_user"("external_provider", "external_subject");

-- CreateIndex
CREATE UNIQUE INDEX "staff_session_token_hash_key" ON "staff_session"("token_hash");

-- CreateIndex
CREATE INDEX "staff_session_staff_user_id_idx" ON "staff_session"("staff_user_id");

-- CreateIndex
CREATE INDEX "staff_session_token_hash_idx" ON "staff_session"("token_hash");

-- CreateIndex
CREATE INDEX "staff_role_assignment_staff_user_id_idx" ON "staff_role_assignment"("staff_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_role_assignment_staff_user_id_role_key" ON "staff_role_assignment"("staff_user_id", "role");

-- CreateIndex
CREATE INDEX "staff_security_event_staff_user_id_idx" ON "staff_security_event"("staff_user_id");

-- CreateIndex
CREATE INDEX "staff_security_event_event_type_idx" ON "staff_security_event"("event_type");

-- AddForeignKey
ALTER TABLE "staff_session" ADD CONSTRAINT "staff_session_staff_user_id_fkey" FOREIGN KEY ("staff_user_id") REFERENCES "staff_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_role_assignment" ADD CONSTRAINT "staff_role_assignment_staff_user_id_fkey" FOREIGN KEY ("staff_user_id") REFERENCES "staff_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_role_assignment" ADD CONSTRAINT "staff_role_assignment_created_by_staff_user_id_fkey" FOREIGN KEY ("created_by_staff_user_id") REFERENCES "staff_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_security_event" ADD CONSTRAINT "staff_security_event_staff_user_id_fkey" FOREIGN KEY ("staff_user_id") REFERENCES "staff_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
