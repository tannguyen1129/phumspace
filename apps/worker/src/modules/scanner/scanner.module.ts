import { Module } from "@nestjs/common";
import { ScanPipelineService } from "./application/scan-pipeline.service";
import { GeminiAdapter } from "./application/gemini.adapter";
import { MediaFetcherService } from "./infrastructure/media-fetcher.service";
import { RetrievalRepository } from "./infrastructure/retrieval.repository";
import { ScanRequestsRepository } from "./infrastructure/scan-requests.repository";
import { ScanResultsRepository } from "./infrastructure/scan-results.repository";

/** ScannerModule (worker) — xu ly that pipeline Observe->Retrieve->Synthesize->Decide->Present. */
@Module({
  providers: [
    ScanPipelineService,
    GeminiAdapter,
    MediaFetcherService,
    RetrievalRepository,
    ScanRequestsRepository,
    ScanResultsRepository,
  ],
  exports: [ScanPipelineService],
})
export class ScannerModule {}
