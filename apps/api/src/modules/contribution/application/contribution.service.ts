import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { AiPermission, ConsentScope, ContributionState } from "@phumspace/contracts";
import { AuditLogService } from "../../../common/audit/audit-log.service";
import { MediaStorageService } from "../../../common/storage/media-storage.service";
import { ALLOWED_AUDIO_MIME_TYPES, MAX_AUDIO_BYTES } from "../../handbook/application/handbook.service";
import { ContributionsRepository } from "../infrastructure/contributions.repository";
import type { Contribution, ContributionView } from "../domain/contribution";

const AUDIT_TARGET_TYPE = "contribution";
const CONTRIBUTION_TYPES = new Set(["ENTITY","CORRECTION","AUDIO","IMAGE","VIDEO","STORY","TERM","PLACE","SOURCE"]);

/**
 * ContributionService — CON-001..014. "Cong dong Khmer giu quyen ke cau chuyen cua chinh minh":
 * moi Registered User co the dong gop, khong can vai tro rieng — chi Moderation (vai tro
 * Reviewer+) moi can phan quyen dac biet. Xem ModerationService cho phan duyet/xuat ban.
 */
@Injectable()
export class ContributionService {
  constructor(
    private readonly contributionsRepository: ContributionsRepository,
    private readonly mediaStorageService: MediaStorageService,
    private readonly auditLogService: AuditLogService
  ) {}

  async submit(input: {
    contributorId: string;
    termId?: string;
    proposedKhmerText?: string;
    proposedLatinTransliteration?: string;
    proposedMeaningVi?: string;
    file: { buffer: Buffer; mimetype: string; size: number };
    region?: string;
    consentScope: ConsentScope;
    aiPermission?: AiPermission;
    attributionName?: string;
    sensitive?: boolean;
    contributionType?: string; language?: string; recordedAt?: Date; recordedBy?: string;
    contextNote?: string; locationNote?: string; consentVersion?: string;
    attributionRole?: string; attributionCommunity?: string;
  }): Promise<Contribution> {
    if (!ALLOWED_AUDIO_MIME_TYPES.has(input.file.mimetype)) {
      throw new BadRequestException("Chi chap nhan audio MP3/M4A/WAV/WebM/OGG.");
    }
    if (input.file.size > MAX_AUDIO_BYTES) {
      throw new BadRequestException("Audio vuot qua 10MB.");
    }
    if (!input.termId && !(input.proposedKhmerText && input.proposedMeaningVi)) {
      throw new BadRequestException(
        "Can chon tu vung co san (termId) hoac de xuat tu moi day du (proposedKhmerText va proposedMeaningVi)."
      );
    }

    const mediaKey = await this.mediaStorageService.upload(input.file.buffer, input.file.mimetype, "contributions");
    const contribution = await this.contributionsRepository.create({
      contributorId: input.contributorId,
      termId: input.termId,
      proposedKhmerText: input.proposedKhmerText,
      proposedLatinTransliteration: input.proposedLatinTransliteration,
      proposedMeaningVi: input.proposedMeaningVi,
      mediaKey,
      region: input.region,
      consentScope: input.consentScope,
      aiPermission: input.aiPermission ?? "RAG_ALLOWED",
      attributionName: input.attributionName,
      sensitive: input.sensitive ?? false,
      contributionType: input.contributionType, language: input.language, recordedAt: input.recordedAt,
      recordedBy: input.recordedBy, contextNote: input.contextNote, locationNote: input.locationNote,
      consentVersion: input.consentVersion, attributionRole: input.attributionRole,
      attributionCommunity: input.attributionCommunity,
    });

    await this.auditLogService.record({
      actorId: input.contributorId,
      action: "CONTRIBUTION_SUBMITTED",
      targetType: AUDIT_TARGET_TYPE,
      targetId: contribution.id,
    });

    return contribution;
  }

  async getById(id: string): Promise<Contribution> {
    const contribution = await this.contributionsRepository.findById(id);
    if (!contribution) throw new NotFoundException("Khong tim thay dong gop.");
    return contribution;
  }

  async getOwnedById(id: string, contributorId: string): Promise<Contribution> {
    const contribution = await this.getById(id);
    // 404 thay vi 403 khi khong phai chu so huu — chong IDOR (khong lo dong gop cua nguoi khac ton tai).
    if (contribution.contributorId !== contributorId) {
      throw new NotFoundException("Khong tim thay dong gop.");
    }
    return contribution;
  }

  async listMine(contributorId: string): Promise<Contribution[]> {
    return this.contributionsRepository.listForContributor(contributorId);
  }

  /** Signed URL cho audio da upload — dung o man hinh chi tiet (contributor xem lai / reviewer nghe truoc khi duyet). */
  async attachAudioUrl(contribution: Contribution): Promise<ContributionView> {
    const audioUrl = await this.mediaStorageService.getPresignedUrl(contribution.mediaKey);
    return { ...contribution, audioUrl };
  }

  async withdraw(id: string, contributorId: string): Promise<Contribution> {
    const contribution = await this.getOwnedById(id, contributorId);
    if (contribution.status !== "SUBMITTED") {
      throw new ForbiddenException("Chi co the rut lai dong gop dang cho duyet.");
    }
    const updated = await this.contributionsRepository.updateStatus(id, "WITHDRAWN");
    await this.auditLogService.record({
      actorId: contributorId,
      action: "CONTRIBUTION_WITHDRAWN",
      targetType: AUDIT_TARGET_TYPE,
      targetId: id,
    });
    return updated;
  }

  saveDraft(userId: string, input: { id?: string; contributionType: string; payload: Record<string, unknown> }) {
    if (!CONTRIBUTION_TYPES.has(input.contributionType)) throw new BadRequestException("Loai dong gop khong hop le.");
    if (!input.payload || Array.isArray(input.payload) || JSON.stringify(input.payload).length > 100_000) throw new BadRequestException("Du lieu ban nhap khong hop le hoac qua lon.");
    return this.contributionsRepository.saveDraft(userId, input);
  }
  listDrafts(userId: string) { return this.contributionsRepository.listDrafts(userId); }
  async deleteDraft(id: string, userId: string) {
    if (!(await this.contributionsRepository.deleteDraft(id, userId))) throw new NotFoundException("Khong tim thay ban nhap.");
    return { deleted: true };
  }
  async resubmit(id: string, userId: string, updates: { contextNote?: string; locationNote?: string }) {
    const result = await this.contributionsRepository.resubmit(id, userId, updates);
    if (!result) throw new BadRequestException("Chi co the gui lai dong gop dang duoc yeu cau chinh sua.");
    await this.auditLogService.record({ actorId:userId, action:"CONTRIBUTION_RESUBMITTED", targetType:AUDIT_TARGET_TYPE, targetId:id });
    return result;
  }
  async createPostPublishRequest(id:string,userId:string,type:"TAKEDOWN"|"CORRECTION",reason:string) {
    if(!["TAKEDOWN","CORRECTION"].includes(type)) throw new BadRequestException("Loai yeu cau khong hop le.");
    const item=await this.getOwnedById(id,userId);
    if(item.status!=="PUBLISHED") throw new BadRequestException("Chi gui yeu cau sau khi noi dung da cong bo.");
    const request=await this.contributionsRepository.createRequest(id,userId,type,reason);
    await this.auditLogService.record({actorId:userId,action:`CONTRIBUTION_${type}_REQUESTED`,targetType:AUDIT_TARGET_TYPE,targetId:id,metadata:{requestId:request.id}});
    return request;
  }
  listRevisions(id:string){return this.contributionsRepository.listRevisions(id);}
  async assign(id:string,reviewerId:string){const value=await this.contributionsRepository.assign(id,reviewerId);if(!value)throw new BadRequestException("Case da duoc nhan boi reviewer khac hoac khong con trong hang doi.");return value;}

  // --- Dung boi ModerationService (facade, tranh module khac dong bo truc tiep vao repository) ---

  async listByStatus(status: ContributionState): Promise<Contribution[]> {
    return this.contributionsRepository.listByStatus(status);
  }
  listQueue(){return this.contributionsRepository.listQueue();}

  async markApproved(id: string): Promise<Contribution> {
    return this.contributionsRepository.updateStatus(id, "APPROVED");
  }

  async markRejected(id: string): Promise<Contribution> {
    return this.contributionsRepository.updateStatus(id, "REJECTED");
  }

  async markChangesRequested(id: string): Promise<Contribution> {
    return this.contributionsRepository.updateStatus(id, "CHANGES_REQUESTED");
  }

  async markPublished(id: string, resultTermId: string, resultAudioId: string): Promise<Contribution> {
    return this.contributionsRepository.markPublished(id, resultTermId, resultAudioId);
  }
}
