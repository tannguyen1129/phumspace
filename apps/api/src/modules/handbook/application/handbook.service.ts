import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { LearningProgressStatus } from "@phumspace/contracts";
import { MediaStorageService } from "../../../common/storage/media-storage.service";
import { LearningProgressRepository } from "../infrastructure/learning-progress.repository";
import { TermAudioRepository } from "../infrastructure/term-audio.repository";
import { TermsRepository } from "../infrastructure/terms.repository";
import type { HandbookTerm, LearningProgress, TermAudio, TermAudioView, TermDetail } from "../domain/term";

/** Dung chung voi ContributionModule (validate audio dong gop truoc khi upload) — xem contribution.service.ts. */
export const ALLOWED_AUDIO_MIME_TYPES = new Set(["audio/mpeg", "audio/mp4", "audio/wav", "audio/webm", "audio/ogg"]);
export const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

/**
 * HandbookService — Interactive Khmer Handbook (HBK-001..010).
 * Vi tri nam ben duoi tu vung PHAI la audio nguoi ban dia (uu tien hon TTS) — xem
 * docs/PhumSpace_Tai_lieu_mo_ta_chi_tiet_du_an muc 16.3.
 */
@Injectable()
export class HandbookService {
  constructor(
    private readonly termsRepository: TermsRepository,
    private readonly termAudioRepository: TermAudioRepository,
    private readonly learningProgressRepository: LearningProgressRepository,
    private readonly mediaStorageService: MediaStorageService
  ) {}

  async createTerm(input: {
    khmerText: string;
    latinTransliteration?: string;
    meaningVi: string;
    meaningEn?: string;
    entityId?: string;
    examples?: Array<{ exampleKhmer: string; exampleVi: string }>;
    createdBy: string;
  }): Promise<HandbookTerm> {
    const term = await this.termsRepository.create(input);
    if (input.examples) {
      for (const example of input.examples) {
        await this.termsRepository.addExample(term.id, example.exampleKhmer, example.exampleVi);
      }
    }
    return term;
  }

  async getTermDetail(termId: string, userId: string): Promise<TermDetail> {
    const term = await this.termsRepository.findById(termId);
    if (!term) throw new NotFoundException("Khong tim thay tu vung.");
    const [examples, audio, progress] = await Promise.all([
      this.termsRepository.listExamples(termId),
      this.termAudioRepository.listForTerm(termId),
      this.learningProgressRepository.findForUser(userId, termId),
    ]);
    const audioWithUrls = await this.attachAudioUrls(audio);
    return { ...term, examples, audio: audioWithUrls, progress: progress?.status ?? null };
  }

  private async attachAudioUrls(audio: TermAudio[]): Promise<TermAudioView[]> {
    return Promise.all(
      audio.map(async (item) => ({
        ...item,
        audioUrl: await this.mediaStorageService.getPresignedUrl(item.mediaKey),
      }))
    );
  }

  async listTerms(input: {
    entityId?: string;
    query?: string;
    limit?: number;
    offset?: number;
  }): Promise<HandbookTerm[]> {
    return this.termsRepository.list({
      entityId: input.entityId,
      query: input.query,
      limit: input.limit ?? 20,
      offset: input.offset ?? 0,
    });
  }

  async addAudio(input: {
    termId: string;
    file: { buffer: Buffer; mimetype: string; size: number };
    speakerName?: string;
    region?: string;
    recordedAt?: Date;
    rightsNote?: string;
    transcript?: string;
    createdBy: string;
  }): Promise<TermAudio> {
    if (!ALLOWED_AUDIO_MIME_TYPES.has(input.file.mimetype)) {
      throw new BadRequestException("Chi chap nhan audio MP3/M4A/WAV/WebM/OGG.");
    }
    if (input.file.size > MAX_AUDIO_BYTES) {
      throw new BadRequestException("Audio vuot qua 10MB.");
    }
    const term = await this.termsRepository.findById(input.termId);
    if (!term) throw new NotFoundException("Khong tim thay tu vung.");

    const mediaKey = await this.mediaStorageService.upload(input.file.buffer, input.file.mimetype, "handbook-audio");
    return this.termAudioRepository.create({
      termId: input.termId,
      mediaKey,
      speakerName: input.speakerName,
      region: input.region,
      recordedAt: input.recordedAt,
      rightsNote: input.rightsNote,
      transcript: input.transcript,
      createdBy: input.createdBy,
    });
  }

  /**
   * Dang ky audio DA co san trong object storage (khong upload lai) — dung boi ModerationService
   * khi publish mot contribution da duyet, tranh doc/ghi lai file nhi phan qua HTTP.
   */
  async registerAudioFromContribution(input: {
    termId: string;
    mediaKey: string;
    speakerName?: string;
    region?: string;
    createdBy: string;
  }): Promise<TermAudio> {
    const term = await this.termsRepository.findById(input.termId);
    if (!term) throw new NotFoundException("Khong tim thay tu vung.");
    return this.termAudioRepository.create({
      termId: input.termId,
      mediaKey: input.mediaKey,
      speakerName: input.speakerName,
      region: input.region,
      createdBy: input.createdBy,
    });
  }

  async updateProgress(userId: string, termId: string, status: LearningProgressStatus): Promise<LearningProgress> {
    const term = await this.termsRepository.findById(termId);
    if (!term) throw new NotFoundException("Khong tim thay tu vung.");
    return this.learningProgressRepository.upsert(userId, termId, status);
  }

  async listMyProgress(userId: string): Promise<LearningProgress[]> {
    return this.learningProgressRepository.listForUser(userId);
  }

  async getPracticeDeck(limit = 10): Promise<HandbookTerm[]> {
    return this.termsRepository.list({ limit: Math.min(Math.max(limit, 1), 30), offset: 0 });
  }

  async recordPractice(userId: string, termId: string, result: "AGAIN" | "HARD" | "GOOD") {
    if (!(await this.termsRepository.findById(termId))) throw new NotFoundException("Khong tim thay tu vung.");
    return this.learningProgressRepository.recordPractice(userId, termId, result);
  }
}
