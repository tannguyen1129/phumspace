import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { UserRole } from "@phumspace/contracts";
import { AuditLogService } from "../../../common/audit/audit-log.service";
import { OrganizationService } from "../../organization/application/organization.service";
import { CompetitionsRepository, type Competition } from "../infrastructure/competitions.repository";
import { QuestionsRepository } from "../infrastructure/questions.repository";
import { SubmissionsRepository } from "../infrastructure/submissions.repository";
import type { LeaderboardEntry, Question, QuestionChoice, QuestionForPlayer, SubmissionResult } from "../domain/quiz";

export interface OrganizationCompetitionReport {
  competitionId: string;
  title: string;
  status: string;
  participantCount: number;
  submissionCount: number;
  correctSubmissionCount: number;
}

const DEFAULT_SOLO_QUIZ_COUNT = 5;

/** Vai tro he thong duoc tao competition CA NHAN (khong gan to chuc) — xem createCompetition(). */
const PERSONAL_COMPETITION_CREATOR_ROLES: UserRole[] = [
  "TEACHER_ORGANIZER",
  "CONTRIBUTOR",
  "PUBLISHER",
  "SYSTEM_ADMIN",
];

function toPlayerView(question: Question): QuestionForPlayer {
  return {
    id: question.id,
    entityId: question.entityId,
    questionText: question.questionText,
    choices: question.choices,
    version: question.version,
    questionType: question.questionType,
    timeLimitSeconds: question.timeLimitSeconds,
  };
}

/**
 * OlympiadService — Digital Culture Olympiad rut gon cho MVP (OLY-*). Phong thi dung
 * polling leaderboard (GET lai) thay vi WebSocket gateway — xem ghi chu trong migration
 * olympiad-core va plan.md muc 2.4.
 */
@Injectable()
export class OlympiadService {
  constructor(
    private readonly questionsRepository: QuestionsRepository,
    private readonly submissionsRepository: SubmissionsRepository,
    private readonly competitionsRepository: CompetitionsRepository,
    private readonly organizationService: OrganizationService,
    private readonly auditLogService: AuditLogService
  ) {}

  async createQuestion(input: {
    entityId?: string;
    questionText: string;
    choices: QuestionChoice[];
    correctChoiceId: string;
    explanation?: string;
    createdBy: string;
  }): Promise<Question> {
    if (!input.choices.some((choice) => choice.id === input.correctChoiceId)) {
      throw new BadRequestException("correctChoiceId phai khop voi mot trong cac choices.");
    }
    return this.questionsRepository.create(input);
  }

  async listQuestions(input: { entityId?: string; limit?: number; offset?: number }): Promise<Question[]> {
    return this.questionsRepository.list({
      entityId: input.entityId,
      limit: input.limit ?? 20,
      offset: input.offset ?? 0,
    });
  }

  /** Quiz ca nhan: N cau hoi ngau nhien, khong lo dap an dung — co the lam lai nhieu lan. */
  async getSoloQuiz(count: number, entityId?: string): Promise<QuestionForPlayer[]> {
    const questions = await this.questionsRepository.findRandom(count || DEFAULT_SOLO_QUIZ_COUNT, entityId);
    return questions.map(toPlayerView);
  }

  async submitSoloAnswer(input: {
    userId: string;
    questionId: string;
    selectedChoiceId: string;
    idempotencyKey?: string;
  }): Promise<SubmissionResult> {
    const question = await this.questionsRepository.findById(input.questionId);
    if (!question) throw new NotFoundException("Khong tim thay cau hoi.");

    const isCorrect = question.correctChoiceId === input.selectedChoiceId;
    await this.submissionsRepository.create({
      userId: input.userId,
      questionId: input.questionId,
      selectedChoiceId: input.selectedChoiceId,
      isCorrect,
      idempotencyKey: input.idempotencyKey,
      questionVersion: question.version,
    });

    return {
      questionId: question.id,
      selectedChoiceId: input.selectedChoiceId,
      isCorrect,
      correctChoiceId: question.correctChoiceId,
      explanation: question.explanation,
      acceptedAt: new Date().toISOString(), duplicate: false,
    };
  }

  async createCompetition(input: {
    title: string;
    questionIds: string[];
    createdBy: string;
    createdByRole: UserRole;
    organizationId?: string;
  }): Promise<Competition> {
    if (input.questionIds.length === 0) {
      throw new BadRequestException("Phong thi can it nhat 1 cau hoi.");
    }
    // FR-ORG-003 (MUST/R1): competition gan cho to chuc chi can nguoi tao la Organization Manager
    // cua chinh to chuc do — KHONG doi hoi vai tro he thong rieng (vd TEACHER_ORGANIZER), vi
    // Manager cua chua/truong co the la REGISTERED_USER thuong. Competition CA NHAN (khong gan
    // to chuc) van giu gioi han theo vai tro he thong nhu truoc (xem PERSONAL_COMPETITION_CREATOR_ROLES).
    if (input.organizationId) {
      await this.organizationService.assertIsManager(input.organizationId, input.createdBy);
    } else if (!PERSONAL_COMPETITION_CREATOR_ROLES.includes(input.createdByRole)) {
      throw new ForbiddenException("Ban khong co quyen tao phong thi ca nhan.");
    }
    const competition = await this.competitionsRepository.create({
      title: input.title,
      createdBy: input.createdBy,
      organizationId: input.organizationId,
    });
    for (const [index, questionId] of input.questionIds.entries()) {
      await this.competitionsRepository.addQuestion(competition.id, questionId, index);
    }
    return this.competitionsRepository.updateStatus(competition.id, "OPEN");
  }

  /** FR-ORG-003/004: bao cao chi trong pham vi to chuc — 403 neu requestingUser khong phai Manager cua to chuc do. */
  async getOrganizationReport(
    organizationId: string,
    requestingUserId: string
  ): Promise<OrganizationCompetitionReport[]> {
    await this.organizationService.assertIsManager(organizationId, requestingUserId);
    const rows = await this.competitionsRepository.listStatsForOrganization(organizationId);
    return rows.map((row) => ({
      competitionId: row.id,
      title: row.title,
      status: row.status,
      participantCount: Number(row.participant_count),
      submissionCount: Number(row.submission_count),
      correctSubmissionCount: Number(row.correct_submission_count),
    }));
  }

  /**
   * FR-ORG-005: "To chuc phai co the export ket qua va danh sach theo quyen, co audit." Dat o
   * OlympiadService (khong phai OrganizationService) vi can ca competition report (thuoc
   * Olympiad) lan danh sach thanh vien (thuoc Organization, lay qua facade) — tranh import
   * 2 chieu OrganizationModule<->OlympiadModule (M8 da co huong Olympiad->Organization roi).
   */
  async exportOrganizationData(
    organizationId: string,
    requestingUserId: string
  ): Promise<{
    exportedAt: string;
    organization: Awaited<ReturnType<OrganizationService["getById"]>>;
    members: Awaited<ReturnType<OrganizationService["listMembers"]>>;
    competitions: OrganizationCompetitionReport[];
  }> {
    await this.organizationService.assertIsManager(organizationId, requestingUserId);
    const [organization, members, competitions] = await Promise.all([
      this.organizationService.getById(organizationId),
      this.organizationService.listMembers(organizationId, requestingUserId),
      this.getOrganizationReport(organizationId, requestingUserId),
    ]);
    await this.auditLogService.record({
      actorId: requestingUserId,
      action: "ORGANIZATION_DATA_EXPORTED",
      targetType: "organization",
      targetId: organizationId,
    });
    return { exportedAt: new Date().toISOString(), organization, members, competitions };
  }

  async getCompetitionByRoomCode(roomCode: string): Promise<Competition> {
    const competition = await this.competitionsRepository.findByRoomCode(roomCode);
    if (!competition) throw new NotFoundException("Khong tim thay phong thi voi ma nay.");
    return competition;
  }

  async joinCompetition(roomCode: string, userId: string): Promise<Competition> {
    const competition = await this.getCompetitionByRoomCode(roomCode);
    if (competition.status === "CLOSED" || competition.status === "DRAFT") {
      throw new ForbiddenException("Phong thi chua mo hoac da dong.");
    }
    await this.competitionsRepository.join(competition.id, userId);
    return competition;
  }

  async getCompetitionQuestions(competitionId: string, userId: string): Promise<QuestionForPlayer[]> {
    const isParticipant = await this.competitionsRepository.isParticipant(competitionId, userId);
    if (!isParticipant) throw new ForbiddenException("Ban chua tham gia phong thi nay.");

    const links = await this.competitionsRepository.listQuestions(competitionId);
    const questions = await Promise.all(links.map((link) => this.questionsRepository.findById(link.questionId)));
    return questions.filter((question): question is Question => question !== null).map(toPlayerView);
  }

  async submitCompetitionAnswer(input: {
    competitionId: string;
    userId: string;
    questionId: string;
    selectedChoiceId: string;
    idempotencyKey?: string;
    questionVersion?: number;
  }): Promise<SubmissionResult> {
    if (input.idempotencyKey) {
      const existing = await this.submissionsRepository.findByIdempotencyKey(input.userId, input.idempotencyKey);
      if (existing) {
        const question = await this.questionsRepository.findById(existing.questionId);
        if (!question) throw new NotFoundException("Khong tim thay cau hoi.");
        return { questionId: existing.questionId, selectedChoiceId: existing.selectedChoiceId, isCorrect: existing.isCorrect, correctChoiceId: question.correctChoiceId, explanation: question.explanation, acceptedAt: existing.submittedAt.toISOString(), duplicate: true };
      }
    }
    const competition = await this.competitionsRepository.findById(input.competitionId);
    if (!competition) throw new NotFoundException("Khong tim thay phong thi.");
    if (competition.status !== "OPEN" && competition.status !== "ACTIVE") {
      throw new ForbiddenException("Phong thi khong o trang thai nhan bai.");
    }

    const isParticipant = await this.competitionsRepository.isParticipant(input.competitionId, input.userId);
    if (!isParticipant) throw new ForbiddenException("Ban chua tham gia phong thi nay.");

    const alreadySubmitted = await this.submissionsRepository.hasSubmitted(
      input.userId,
      input.questionId,
      input.competitionId
    );
    if (alreadySubmitted) {
      throw new BadRequestException("Ban da tra loi cau hoi nay roi.");
    }

    const question = await this.questionsRepository.findById(input.questionId);
    if (!question) throw new NotFoundException("Khong tim thay cau hoi.");
    if (input.questionVersion && input.questionVersion !== question.version) throw new BadRequestException("Phien ban cau hoi da thay doi. Vui long dong bo lai phong thi.");

    const isCorrect = question.correctChoiceId === input.selectedChoiceId;
    await this.submissionsRepository.create({
      userId: input.userId,
      questionId: input.questionId,
      competitionId: input.competitionId,
      selectedChoiceId: input.selectedChoiceId,
      isCorrect,
      idempotencyKey: input.idempotencyKey,
      questionVersion: question.version,
    });

    return {
      questionId: question.id,
      selectedChoiceId: input.selectedChoiceId,
      isCorrect,
      correctChoiceId: question.correctChoiceId,
      explanation: question.explanation,
      acceptedAt: new Date().toISOString(), duplicate: false,
    };
  }

  async getCompetitionState(competitionId: string, userId: string) {
    const competition = await this.competitionsRepository.findById(competitionId);
    if (!competition) throw new NotFoundException("Khong tim thay phong thi.");
    if (!(await this.competitionsRepository.isParticipant(competitionId, userId))) throw new ForbiddenException("Ban chua tham gia phong thi nay.");
    return { competitionId, status: competition.status, serverTime: new Date().toISOString() };
  }

  async getLeaderboard(competitionId: string): Promise<LeaderboardEntry[]> {
    const competition = await this.competitionsRepository.findById(competitionId);
    if (!competition) throw new NotFoundException("Khong tim thay phong thi.");
    return this.submissionsRepository.leaderboard(competitionId);
  }
}
