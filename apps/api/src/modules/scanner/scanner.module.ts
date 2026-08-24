import { Module } from "@nestjs/common";
import { ScannerController } from "./interface/scanner.controller";
import { ScannerService } from "./application/scanner.service";
import { ScanRequestsRepository } from "./infrastructure/scan-requests.repository";
import { ScanResultsRepository } from "./infrastructure/scan-results.repository";
import { ScanFeedbackRepository } from "./infrastructure/scan-feedback.repository";

/**
 * ScannerModule — AI Cultural Scanner (goi la AI Orchestrator trong System Design).
 * Chi dam nhan buoc Intake (nhan anh, upload, tao job) va Present (tra ket qua qua poll) —
 * Observe/Retrieve/Synthesize/Decide chay trong apps/worker (queue "ai-scan").
 * MediaStorageService la global provider tu common/storage (dung chung voi Handbook).
 */
@Module({
  controllers: [ScannerController],
  providers: [
    ScannerService,
    ScanRequestsRepository,
    ScanResultsRepository,
    ScanFeedbackRepository,
  ],
  exports: [ScannerService],
})
export class ScannerModule {}
