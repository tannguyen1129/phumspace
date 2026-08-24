export interface QuestionChoice {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  entityId: string | null;
  questionText: string;
  choices: QuestionChoice[];
  correctChoiceId: string;
  explanation: string | null;
  createdBy: string;
  createdAt: Date;
  version: number;
  questionType: string;
  difficulty: string;
  topic: string | null;
  language: string;
  timeLimitSeconds: number | null;
  sourceNote: string | null;
}

/** Cau hoi khi tra cho nguoi choi lam quiz — KHONG duoc lo correctChoiceId/explanation. */
export type QuestionForPlayer = Pick<Question, "id" | "entityId" | "questionText" | "choices" | "version" | "questionType" | "timeLimitSeconds">;

export interface SubmissionResult {
  questionId: string;
  selectedChoiceId: string;
  isCorrect: boolean;
  correctChoiceId: string;
  explanation: string | null;
  acceptedAt: string;
  duplicate: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  correctCount: number;
  answeredCount: number;
}
