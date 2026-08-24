import { Injectable, Logger } from "@nestjs/common";
import { getScannerThresholds, loadEnv } from "@phumspace/config";
import { decide } from "./decision-engine";
import { GeminiAdapter } from "./gemini.adapter";
import { MediaFetcherService } from "../infrastructure/media-fetcher.service";
import { RetrievalRepository } from "../infrastructure/retrieval.repository";
import { ScanRequestsRepository } from "../infrastructure/scan-requests.repository";
import { ScanResultsRepository } from "../infrastructure/scan-results.repository";

const RETRIEVAL_LIMIT = 5;

/**
 * ScanPipelineService — dieu phoi pipeline Intake(da xong o api)->Observe->Retrieve->Synthesize
 * ->Decide->Present (AI_Specification). Moi buoc that bai deu roi ve fallback UNKNOWN +
 * requiresHumanReview thay vi de job crash — dung nguyen tac "AI loi khong lam hong ung dung".
 */
@Injectable()
export class ScanPipelineService {
  private readonly logger = new Logger(ScanPipelineService.name);

  constructor(
    private readonly scanRequestsRepository: ScanRequestsRepository,
    private readonly scanResultsRepository: ScanResultsRepository,
    private readonly mediaFetcherService: MediaFetcherService,
    private readonly retrievalRepository: RetrievalRepository,
    private readonly geminiAdapter: GeminiAdapter,
  ) {}

  async process(scanRequestId: string): Promise<void> {
    const scanRequest =
      await this.scanRequestsRepository.findById(scanRequestId);
    if (!scanRequest) {
      this.logger.warn(
        `scan_request ${scanRequestId} khong ton tai — bo qua job.`,
      );
      return;
    }

    await this.scanRequestsRepository.markProcessing(scanRequestId);
    const thresholds = getScannerThresholds(loadEnv());

    try {
      if (!this.geminiAdapter.isConfigured()) {
        this.logger.log(
          `scan ${scanRequestId}: Gemini chua cau hinh, tra ve UNKNOWN (graceful-degradation).`,
        );
        await this.scanResultsRepository.save(
          scanRequestId,
          decide({
            topCandidate: null,
            synthesis: null,
            thresholds,
            geminiAvailable: false,
          }),
        );
        await this.scanRequestsRepository.markCompleted(scanRequestId);
        return;
      }

      const imageBytes = await this.mediaFetcherService.fetchImage(
        scanRequest.mediaKey,
      );
      const observation = await this.geminiAdapter.observeImage(
        imageBytes,
        scanRequest.mimeType,
      );

      const queryText =
        observation.observedFeatures.join(" ") || observation.sceneContext;
      const candidates = await this.retrievalRepository.findCandidates(
        queryText,
        RETRIEVAL_LIMIT,
        scanRequest.placeId ?? undefined,
      );

      if (candidates.length === 0) {
        this.logger.log(
          `scan ${scanRequestId}: khong tim thay ung vien trong PhumData.`,
        );
        await this.scanResultsRepository.save(
          scanRequestId,
          decide({
            topCandidate: null,
            synthesis: null,
            thresholds,
            geminiAvailable: true,
          }),
        );
        await this.scanRequestsRepository.markCompleted(scanRequestId);
        return;
      }

      const evidenceCandidates = await Promise.all(
        candidates.map(async (candidate) => ({
          entityId: candidate.entityId,
          title: candidate.preferredLabel,
          description: candidate.description,
          citationIds: await this.retrievalRepository.listSourceIdsForVersion(
            candidate.versionId,
          ),
        })),
      );

      const synthesis = await this.geminiAdapter.synthesize({
        observation,
        candidates: evidenceCandidates,
      });
      const decision = decide({
        topCandidate: candidates[0],
        synthesis,
        thresholds,
        geminiAvailable: true,
      });

      await this.scanResultsRepository.save(scanRequestId, decision);
      await this.scanRequestsRepository.markCompleted(scanRequestId);
      this.logger.log(
        `scan ${scanRequestId}: hoan tat, decision=${decision.decision} confidence=${decision.confidence.toFixed(2)}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `scan ${scanRequestId}: pipeline that bai — ${message}`,
      );
      await this.scanResultsRepository
        .save(
          scanRequestId,
          decide({
            topCandidate: null,
            synthesis: null,
            thresholds,
            geminiAvailable: false,
          }),
        )
        .catch(() => undefined);
      const safetyBlocked = message.includes("SAFETY_BLOCKED");
      if (safetyBlocked)
        await this.mediaFetcherService
          .deleteImage(scanRequest.mediaKey)
          .catch(() => undefined);
      await this.scanRequestsRepository.markFailed(
        scanRequestId,
        safetyBlocked
          ? "Ảnh không thể được xử lý theo chính sách an toàn."
          : message,
      );
      if (safetyBlocked) return;
      throw error;
    }
  }
}
