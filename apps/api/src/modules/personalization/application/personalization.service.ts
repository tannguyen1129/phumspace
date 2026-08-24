import { BadRequestException, Injectable } from "@nestjs/common";
import { AuditLogService } from "../../../common/audit/audit-log.service";
import { AuthService } from "../../identity/application/auth.service";
import { PhumDataService } from "../../phumdata/application/phumdata.service";
import { HandbookService } from "../../handbook/application/handbook.service";
import {
  ScannerService,
  type ScanHistoryItem,
} from "../../scanner/application/scanner.service";
import { ContributionService } from "../../contribution/application/contribution.service";
import { SavedItemsRepository } from "../infrastructure/saved-items.repository";
import { PrivacyRequestsRepository } from "../infrastructure/privacy-requests.repository";
import type { SavedItem, SavedItemView } from "../domain/saved-item";

export interface PersonalDataExport {
  exportedAt: string;
  profile: Awaited<ReturnType<AuthService["exportProfile"]>>;
  saved: SavedItemView[];
  scanHistory: ScanHistoryItem[];
  contributions: Awaited<ReturnType<ContributionService["listMine"]>>;
}

/**
 * PersonalizationService — Saved/History/Preferences/Export/Delete (SRS muc 7.3, FR-PER-001..008
 * tru FR-PER-008 recommendation, hoan lai GD2 de giu scope dung — xem README muc M6).
 * Chi goi cac module khac qua service da export (facade pattern, dung theo ADR-001), khong
 * dong truc tiep vao repository/schema cua PhumData/Handbook/Scanner/Identity/Contribution.
 */
@Injectable()
export class PersonalizationService {
  constructor(
    private readonly savedItemsRepository: SavedItemsRepository,
    private readonly phumDataService: PhumDataService,
    private readonly handbookService: HandbookService,
    private readonly scannerService: ScannerService,
    private readonly authService: AuthService,
    private readonly contributionService: ContributionService,
    private readonly auditLogService: AuditLogService,
    private readonly privacyRequestsRepository: PrivacyRequestsRepository,
  ) {}

  async saveEntity(userId: string, entityId: string): Promise<SavedItem> {
    await this.phumDataService.getEntity(entityId);
    return this.savedItemsRepository.save({ userId, entityId });
  }

  async saveTerm(userId: string, termId: string): Promise<SavedItem> {
    await this.handbookService.getTermDetail(termId, userId);
    return this.savedItemsRepository.save({ userId, termId });
  }

  async unsaveEntity(userId: string, entityId: string): Promise<void> {
    await this.savedItemsRepository.deleteByEntity(userId, entityId);
  }

  async unsaveTerm(userId: string, termId: string): Promise<void> {
    await this.savedItemsRepository.deleteByTerm(userId, termId);
  }

  /** FR-PER-003: xem theo nhom + tim kiem trong danh sach da luu. */
  async listSaved(
    userId: string,
    filter: { type?: "entity" | "term"; q?: string },
  ): Promise<SavedItemView[]> {
    const items = await this.savedItemsRepository.listForUser(userId);
    const filtered = filter.type
      ? items.filter((item) =>
          filter.type === "entity"
            ? item.entityId !== null
            : item.termId !== null,
        )
      : items;
    const views = await Promise.all(filtered.map((item) => this.toView(item)));
    const query = filter.q?.trim().toLowerCase();
    if (!query) return views;
    return views.filter(
      (view) =>
        view.title.toLowerCase().includes(query) ||
        (view.subtitle ?? "").toLowerCase().includes(query),
    );
  }

  private async toView(item: SavedItem): Promise<SavedItemView> {
    if (item.entityId) {
      const entity = await this.phumDataService.getEntity(item.entityId);
      return {
        id: item.id,
        entityId: item.entityId,
        termId: null,
        itemType: "ENTITY",
        title: entity.currentVersion?.preferredLabel ?? entity.canonicalCode,
        subtitle: entity.entityType,
        createdAt: item.createdAt,
      };
    }
    const term = await this.handbookService.getTermDetail(
      item.termId as string,
      item.userId,
    );
    return {
      id: item.id,
      entityId: null,
      termId: item.termId,
      itemType: "TERM",
      title: term.khmerText,
      subtitle: term.meaningVi,
      createdAt: item.createdAt,
    };
  }

  /** FR-PER-002: lich su quet ca nhan, qua facade ScannerService. */
  async listHistory(userId: string): Promise<ScanHistoryItem[]> {
    return this.scannerService.listHistoryForUser(userId);
  }

  async deleteHistoryItem(
    userId: string,
    scanRequestId: string,
  ): Promise<void> {
    await this.scannerService.deleteScanForUser(scanRequestId, userId);
  }

  /** FR-PER-007: xuat toan bo du lieu ca nhan dang JSON tai ve. */
  async exportPersonalData(userId: string): Promise<PersonalDataExport> {
    const [profile, saved, scanHistory, contributions] = await Promise.all([
      this.authService.exportProfile(userId),
      this.listSaved(userId, {}),
      this.scannerService.listHistoryForUser(userId),
      this.contributionService.listMine(userId),
    ]);
    await this.auditLogService.record({
      actorId: userId,
      action: "PERSONAL_DATA_EXPORTED",
      targetType: "user",
      targetId: userId,
    });
    return {
      exportedAt: new Date().toISOString(),
      profile,
      saved,
      scanHistory,
      contributions,
    };
  }

  async createPrivacyRequest(userId: string, type: "EXPORT" | "DELETE") {
    const existing = (await this.privacyRequestsRepository.list(userId)).find(
      (item) =>
        item.requestType === type &&
        ["REQUESTED", "PROCESSING"].includes(item.status),
    );
    if (existing) return existing;
    const dueAt = new Date(
      Date.now() + (type === "DELETE" ? 7 : 1) * 24 * 60 * 60 * 1000,
    );
    const request = await this.privacyRequestsRepository.create(
      userId,
      type,
      dueAt,
    );
    await this.auditLogService.record({
      actorId: userId,
      action: `PRIVACY_${type}_REQUESTED`,
      targetType: "privacy_request",
      targetId: request.id,
    });
    if (type === "EXPORT") {
      const data = await this.exportPersonalData(userId);
      await this.privacyRequestsRepository.complete(request.id, data);
      return (await this.privacyRequestsRepository.findOwned(
        request.id,
        userId,
      ))!;
    }
    return request;
  }
  listPrivacyRequests(userId: string) {
    return this.privacyRequestsRepository.list(userId);
  }
  async cancelPrivacyRequest(userId: string, id: string) {
    if (!(await this.privacyRequestsRepository.cancel(id, userId)))
      throw new BadRequestException(
        "Yêu cầu không thể hủy ở trạng thái hiện tại.",
      );
    await this.auditLogService.record({
      actorId: userId,
      action: "PRIVACY_REQUEST_CANCELLED",
      targetType: "privacy_request",
      targetId: id,
    });
  }
  async executeDeleteRequest(userId: string, id: string) {
    const request = await this.privacyRequestsRepository.findOwned(id, userId);
    if (
      !request ||
      request.requestType !== "DELETE" ||
      request.status !== "REQUESTED"
    )
      throw new BadRequestException("Yêu cầu xóa không hợp lệ.");
    if (request.dueAt.getTime() > Date.now())
      throw new BadRequestException(
        "Yêu cầu đang trong thời gian chờ và vẫn có thể hủy.",
      );
    await this.deleteAccount(userId);
    await this.privacyRequestsRepository.complete(id);
    await this.auditLogService.record({
      actorId: userId,
      action: "PRIVACY_DELETE_COMPLETED",
      targetType: "privacy_request",
      targetId: id,
    });
  }

  /**
   * FR-PER-007: xoa tai khoan. Du lieu hoan toan rieng tu (saved items, scan history + anh)
   * duoc xoa that; ho so dinh danh duoc an danh hoa (xem AuthService.deleteAccount) vi noi
   * dung da cong bo (contributions, entities, terms da tao...) van can giu attribution/audit.
   */
  async deleteAccount(userId: string): Promise<void> {
    await this.auditLogService.record({
      actorId: userId,
      action: "ACCOUNT_DELETE_REQUESTED",
      targetType: "user",
      targetId: userId,
    });
    await this.savedItemsRepository.deleteAllForUser(userId);
    const history = await this.scannerService.listHistoryForUser(userId);
    for (const item of history) {
      await this.scannerService.deleteScanForUser(item.id, userId);
    }
    await this.authService.deleteAccount(userId);
  }
}
