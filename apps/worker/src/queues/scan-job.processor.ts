import { Injectable, Logger } from "@nestjs/common";
import { ScanPipelineService } from "../modules/scanner/application/scan-pipeline.service";

interface ScanJobPayload {
  scanRequestId: string;
}

/** Xu ly job cua queue "ai-scan" — dieu phoi qua ScanPipelineService (xem modules/scanner). */
@Injectable()
export class ScanJobProcessor {
  private readonly logger = new Logger(ScanJobProcessor.name);

  constructor(private readonly scanPipelineService: ScanPipelineService) {}

  async process(jobId: string, payload: unknown): Promise<void> {
    const { scanRequestId } = (payload ?? {}) as Partial<ScanJobPayload>;
    if (!scanRequestId) {
      this.logger.warn(`job ${jobId} thieu scanRequestId trong payload — bo qua.`);
      return;
    }
    await this.scanPipelineService.process(scanRequestId);
  }
}
