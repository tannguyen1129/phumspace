import { Injectable, Inject, Optional, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../prisma/prisma.service';
import { ImageValidatorService } from './image-validator.service';
import { CandidateRetrievalService } from './candidate-retrieval.service';
import { DecisionEngineService } from './decision-engine.service';
import { AiProvider } from '../interfaces/ai-provider.interface';
import { PassportRewardService } from '../../passport/services/passport-reward.service';
import { PassportService } from '../../passport/services/passport.service';
import { ScanResponseDto } from '../dto/scan-response.dto';
import { VISUAL_OBSERVATION_PROMPT_VERSION } from '../prompts/visual-observation.prompt';

@Injectable()
export class ScannerService {
  private readonly logger = new Logger(ScannerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly imageValidator: ImageValidatorService,
    private readonly candidateRetrieval: CandidateRetrievalService,
    private readonly decisionEngine: DecisionEngineService,
    @Inject('AiProvider') private readonly aiProvider: AiProvider,
    @Optional() private readonly passportRewardService?: PassportRewardService,
    @Optional() private readonly passportService?: PassportService,
  ) {}

  async processScan(file?: Express.Multer.File, rawPassportToken?: string): Promise<ScanResponseDto> {
    const startTime = Date.now();
    const scanId = randomUUID();

    // 1. Validate & Sanitize Image Input
    const validatedImage = this.imageValidator.validateAndSanitize(file);

    // 2. Stage 1 — Visual Observation (Gemini Vision)
    const observation = await this.aiProvider.analyzeImageObservation({
      imageBuffer: validatedImage.buffer,
      mimeType: validatedImage.mimeType,
    });

    // 3. Stage 2 — PhumData Grounding (Candidate Retrieval from DB)
    const candidates = await this.candidateRetrieval.findPublishedCandidates(observation);

    // 4. Stage 3 — Grounded Synthesis & Decision Engine
    let synthesis = {
      selectedCandidateId: candidates.length > 0 ? candidates[0].entityId : null,
      alternativeCandidateIds: candidates.slice(1).map((c) => c.entityId),
      explanationGrounded: candidates.length > 0 ? `Đặc điểm khớp với di sản ${candidates[0].preferredViName}` : 'Không tìm thấy candidate phù hợp',
      observedFeatureAgreement: observation.architecturalElements.slice(0, 2),
      unsupportedClaimsAvoided: true,
    };

    if (candidates.length > 0) {
      try {
        synthesis = await this.aiProvider.synthesizeGroundedAnalysis({
          observation,
          candidates,
        });
      } catch (err: any) {
        this.logger.warn(`Stage 3 Synthesis error, fallback to local decision engine: ${err.message}`);
      }
    }

    const evaluation = this.decisionEngine.evaluateDecision({
      observation,
      candidates,
      synthesis,
    });

    const latencyMs = Date.now() - startTime;

    // 5. Persist Scan Audit Metadata (ScanLog)
    await this.prisma.scanLog.create({
      data: {
        scanId,
        decision: evaluation.decision,
        confidenceBand: evaluation.confidenceBand,
        matchedEntityId: evaluation.matchedEntity?.entityId ?? null,
        modelAlias: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        promptVersion: VISUAL_OBSERVATION_PROMPT_VERSION,
        outputSchemaVersion: '1.0.0',
        latencyMs,
      },
    });

    // Fail-safe Passport Reward for MATCH
    if (
      evaluation.decision === 'MATCH' &&
      rawPassportToken &&
      this.passportService &&
      this.passportRewardService
    ) {
      const passport = await this.passportService.getPassportByRawToken(rawPassportToken);
      if (passport) {
        await this.passportRewardService.rewardScanLog(
          passport.id,
          scanId,
          evaluation.matchedEntity?.entityId,
        );
      }
    }

    // 6. Format Response DTO
    const sourcesMap = new Map<string, { id: string; title: string; creator?: string; locator?: string }>();
    if (evaluation.matchedEntity) {
      evaluation.matchedEntity.sources.forEach((src) => sourcesMap.set(src.id, src));
    }
    if (evaluation.candidates) {
      evaluation.candidates.forEach((cand) => {
        cand.sources.forEach((src) => sourcesMap.set(src.id, src));
      });
    }

    return {
      scanId,
      status: 'SUCCESS',
      decision: evaluation.decision,
      confidenceBand: evaluation.confidenceBand,
      observationSummary: {
        objectTypes: observation.objectTypes,
        visibleFeatures: observation.visibleFeatures,
        imageQuality: observation.imageQuality,
      },
      matchedEntity: evaluation.matchedEntity
        ? {
            id: evaluation.matchedEntity.entityId,
            slug: evaluation.matchedEntity.slug,
            canonicalCode: evaluation.matchedEntity.canonicalCode,
            type: evaluation.matchedEntity.type,
            preferredViName: evaluation.matchedEntity.preferredViName,
            preferredKmName: evaluation.matchedEntity.preferredKmName,
            summary: evaluation.matchedEntity.summary,
            culturalMeaning: evaluation.matchedEntity.culturalMeaning,
            categories: evaluation.matchedEntity.categories,
            places: evaluation.matchedEntity.places,
          }
        : undefined,
      candidates: evaluation.candidates
        ? evaluation.candidates.map((c) => ({
            id: c.entityId,
            slug: c.slug,
            canonicalCode: c.canonicalCode,
            type: c.type,
            preferredViName: c.preferredViName,
            preferredKmName: c.preferredKmName,
            summary: c.summary,
            culturalMeaning: c.culturalMeaning,
            categories: c.categories,
            places: c.places,
          }))
        : undefined,
      verificationLabel: evaluation.matchedEntity ? 'SOURCE_VERIFIED' : undefined,
      sources: Array.from(sourcesMap.values()),
      warnings: evaluation.warnings,
      createdAt: new Date().toISOString(),
    };
  }
}
