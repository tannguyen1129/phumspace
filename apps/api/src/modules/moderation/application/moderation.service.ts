import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import type { ModerationDecision } from "@phumspace/contracts";
import { AuditLogService } from "../../../common/audit/audit-log.service";
import { ContributionService } from "../../contribution/application/contribution.service";
import type { Contribution, ContributionView } from "../../contribution/domain/contribution";
import { HandbookService } from "../../handbook/application/handbook.service";
import {
  ModerationDecisionsRepository,
  type ModerationDecisionRecord,
} from "../infrastructure/moderation-decisions.repository";

const AUDIT_TARGET_TYPE = "contribution";

/**
 * ModerationService — MOD-001..012. Day la noi "khep vong du lieu" (docs muc 5.2, 17.2):
 * quyet dinh APPROVED se goi qua HandbookService (facade, khong dong bo truc tiep) de tao/cap
 * nhat tu vung — noi dung xuat hien lai trong Handbook ngay sau khi duyet, khong can buoc rieng.
 */
@Injectable()
export class ModerationService {
  constructor(
    private readonly contributionService: ContributionService,
    private readonly handbookService: HandbookService,
    private readonly moderationDecisionsRepository: ModerationDecisionsRepository,
    private readonly auditLogService: AuditLogService
  ) {}

  async getQueue(): Promise<Contribution[]> {
    return this.contributionService.listQueue();
  }

  async getContributionForReview(id: string): Promise<ContributionView> {
    const contribution = await this.contributionService.getById(id);
    return this.contributionService.attachAudioUrl(contribution);
  }

  async decide(input: {
    contributionId: string;
    reviewerId: string;
    decision: ModerationDecision;
    reason?: string;
  }): Promise<Contribution> {
    const contribution = await this.contributionService.getById(input.contributionId);
    if (!["SUBMITTED","TRIAGE","EXPERT_REVIEW","RIGHTS_REVIEW"].includes(contribution.status)) {
      throw new BadRequestException("Dong gop nay khong o trang thai cho duyet.");
    }
    if (contribution.assignedReviewerId && contribution.assignedReviewerId !== input.reviewerId) {
      throw new ForbiddenException("Case dang duoc reviewer khac xu ly.");
    }
    if (input.decision !== "APPROVED" && !input.reason) {
      throw new BadRequestException("Can ghi ly do khi tu choi hoac yeu cau chinh sua.");
    }

    await this.moderationDecisionsRepository.create({
      contributionId: input.contributionId,
      reviewerId: input.reviewerId,
      decision: input.decision,
      reason: input.reason,
    });

    let updated: Contribution;
    if (input.decision === "APPROVED") {
      updated = await this.publish(contribution);
    } else if (input.decision === "REJECTED") {
      updated = await this.contributionService.markRejected(contribution.id);
    } else {
      updated = await this.contributionService.markChangesRequested(contribution.id);
    }

    await this.auditLogService.record({
      actorId: input.reviewerId,
      action: `CONTRIBUTION_${input.decision}`,
      targetType: AUDIT_TARGET_TYPE,
      targetId: contribution.id,
      metadata: input.reason ? { reason: input.reason } : undefined,
    });

    return updated;
  }

  async claim(contributionId:string,reviewerId:string){const value=await this.contributionService.assign(contributionId,reviewerId);await this.auditLogService.record({actorId:reviewerId,action:"CONTRIBUTION_CLAIMED",targetType:AUDIT_TARGET_TYPE,targetId:contributionId});return value;}
  async getRevisions(contributionId:string){await this.contributionService.getById(contributionId);return this.contributionService.listRevisions(contributionId);}

  async getHistory(contributionId: string): Promise<ModerationDecisionRecord[]> {
    await this.contributionService.getById(contributionId); // 404 neu khong ton tai
    return this.moderationDecisionsRepository.listForContribution(contributionId);
  }

  /**
   * Publish: tao tu vung moi neu can (proposedKhmerText), gan audio da upload san vao Handbook,
   * roi danh dau contribution APPROVED -> PUBLISHED. Day la buoc duy nhat trong toan he thong
   * dua noi dung cong dong quay tro lai kho tri thuc dung (nguyen tac "verified before viral").
   */
  private async publish(contribution: Contribution): Promise<Contribution> {
    let termId = contribution.termId;
    if (!termId) {
      if (!contribution.proposedKhmerText || !contribution.proposedMeaningVi) {
        throw new BadRequestException("Dong gop thieu du lieu de tao tu vung moi.");
      }
      const newTerm = await this.handbookService.createTerm({
        khmerText: contribution.proposedKhmerText,
        latinTransliteration: contribution.proposedLatinTransliteration ?? undefined,
        meaningVi: contribution.proposedMeaningVi,
        createdBy: contribution.contributorId,
      });
      termId = newTerm.id;
    }

    const audio = await this.handbookService.registerAudioFromContribution({
      termId,
      mediaKey: contribution.mediaKey,
      speakerName: contribution.attributionName ?? undefined,
      region: contribution.region ?? undefined,
      createdBy: contribution.contributorId,
    });

    await this.contributionService.markApproved(contribution.id);
    return this.contributionService.markPublished(contribution.id, termId, audio.id);
  }
}
