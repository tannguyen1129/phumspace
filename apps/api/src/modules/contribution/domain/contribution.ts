import type { AiPermission, ConsentScope, ContributionState } from "@phumspace/contracts";

/**
 * Mot dong gop cong dong (M5, CON-001..014). O MVP chi co 1 loai: audio cho tu vung Handbook
 * (tu da co qua termId, hoac de xuat tu moi qua proposedKhmerText/proposedMeaningVi).
 */
export interface Contribution {
  id: string;
  contributorId: string;
  termId: string | null;
  proposedKhmerText: string | null;
  proposedLatinTransliteration: string | null;
  proposedMeaningVi: string | null;
  mediaKey: string;
  region: string | null;
  consentScope: ConsentScope;
  aiPermission: AiPermission;
  /** null = an danh — nguoi dong gop co quyen yeu cau khong ghi ten (docs muc 6.5). */
  attributionName: string | null;
  sensitive: boolean;
  status: ContributionState;
  resultTermId: string | null;
  resultAudioId: string | null;
  createdAt: Date;
  updatedAt: Date;
  contributionType: string;
  language: string;
  recordedAt: Date | null;
  recordedBy: string | null;
  contextNote: string | null;
  locationNote: string | null;
  consentVersion: string;
  consentConfirmedAt: Date;
  consentMethod: string;
  attributionRole: string | null;
  attributionCommunity: string | null;
  assignedReviewerId: string | null;
  priority: string;
}

/** Dung o man hinh chi tiet (contributor xem lai / reviewer nghe truoc khi duyet) — xem ContributionService.attachAudioUrl. */
export interface ContributionView extends Contribution {
  audioUrl: string;
}
