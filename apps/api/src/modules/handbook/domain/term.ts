import type { LearningProgressStatus } from "@phumspace/contracts";

export interface HandbookTerm {
  id: string;
  khmerText: string;
  latinTransliteration: string | null;
  meaningVi: string;
  meaningEn: string | null;
  entityId: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TermExample {
  id: string;
  termId: string;
  exampleKhmer: string;
  exampleVi: string;
}

export interface TermAudio {
  id: string;
  termId: string;
  mediaKey: string;
  speakerName: string | null;
  region: string | null;
  recordedAt: Date | null;
  rightsNote: string | null;
  transcript: string | null;
  verificationStatus: string;
}

/** Audio kem signed URL — xem MediaStorageService.getPresignedUrl (client can URL truc tiep, khong the gui Authorization header tren tag <audio>). */
export interface TermAudioView extends TermAudio {
  audioUrl: string;
}

export interface TermDetail extends HandbookTerm {
  examples: TermExample[];
  audio: TermAudioView[];
  progress: LearningProgressStatus | null;
}

export interface LearningProgress {
  id: string;
  userId: string;
  termId: string;
  status: LearningProgressStatus;
  reviewCount: number;
  lastReviewedAt: Date | null;
  nextReviewAt: Date | null;
  lastResult: string | null;
}
