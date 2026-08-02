-- CreateTable
CREATE TABLE "scan_log" (
    "id" UUID NOT NULL,
    "scan_id" UUID NOT NULL,
    "decision" TEXT NOT NULL,
    "confidence_band" TEXT NOT NULL,
    "matched_entity_id" UUID,
    "model_alias" TEXT NOT NULL,
    "prompt_version" TEXT NOT NULL,
    "output_schema_version" TEXT NOT NULL,
    "latency_ms" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scan_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scan_log_scan_id_key" ON "scan_log"("scan_id");

-- CreateIndex
CREATE INDEX "scan_log_scan_id_idx" ON "scan_log"("scan_id");

-- CreateIndex
CREATE INDEX "scan_log_decision_idx" ON "scan_log"("decision");
