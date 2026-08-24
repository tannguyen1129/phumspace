import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { CurrentUser } from "../../../common/auth/current-user.decorator";
import { JwtAuthGuard, type AuthenticatedUser } from "../../../common/auth/jwt-auth.guard";
import { Roles } from "../../../common/auth/roles.decorator";
import { RolesGuard } from "../../../common/auth/roles.guard";
import { OlympiadService } from "../application/olympiad.service";
import { CreateCompetitionDto } from "./dto/create-competition.dto";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { SubmitAnswerDto } from "./dto/submit-answer.dto";

const QUIZ_CREATOR_ROLES = ["TEACHER_ORGANIZER", "CONTRIBUTOR", "PUBLISHER", "SYSTEM_ADMIN"] as const;

/**
 * OlympiadController — Digital Culture Olympiad rut gon MVP (OLY-*). Quiz ca nhan mo cho moi
 * Registered User; tao cau hoi/phong thi can vai tro Giao vien/Contributor tro len — dung
 * theo SRS (Giao vien tao bo cau hoi, hoat dong ngoai khoa theo dia diem).
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("olympiad")
export class OlympiadController {
  constructor(private readonly olympiadService: OlympiadService) {}

  @Get("health")
  health() {
    return { module: "olympiad", status: "ok" };
  }

  @Get("questions")
  listQuestions(
    @Query("entityId") entityId?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string
  ) {
    return this.olympiadService.listQuestions({
      entityId,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Roles(...QUIZ_CREATOR_ROLES)
  @Post("questions")
  createQuestion(@CurrentUser() currentUser: AuthenticatedUser, @Body() dto: CreateQuestionDto) {
    return this.olympiadService.createQuestion({ ...dto, createdBy: currentUser.id });
  }

  @Get("quiz/solo")
  getSoloQuiz(@Query("count") count?: string, @Query("entityId") entityId?: string) {
    return this.olympiadService.getSoloQuiz(count ? Number(count) : 0, entityId);
  }

  @Post("quiz/solo/submit")
  submitSoloAnswer(@CurrentUser() currentUser: AuthenticatedUser, @Body() dto: SubmitAnswerDto) {
    return this.olympiadService.submitSoloAnswer({ userId: currentUser.id, ...dto });
  }

  // Khong gioi han @Roles o day nua — OlympiadService.createCompetition tu quyet dinh: gan to
  // chuc thi can Organization Manager (bat ky vai tro he thong nao), khong gan to chuc thi can
  // vai tro he thong thuoc PERSONAL_COMPETITION_CREATOR_ROLES (xem service, phat hien khi
  // dien tap M8 — Manager cua chua/truong co the chi la REGISTERED_USER thuong).
  @Post("competitions")
  createCompetition(@CurrentUser() currentUser: AuthenticatedUser, @Body() dto: CreateCompetitionDto) {
    return this.olympiadService.createCompetition({
      ...dto,
      createdBy: currentUser.id,
      createdByRole: currentUser.role,
    });
  }

  @Get("competitions/room/:roomCode")
  getCompetitionByRoomCode(@Param("roomCode") roomCode: string) {
    return this.olympiadService.getCompetitionByRoomCode(roomCode);
  }

  // Chan spam thu ma phong (System Design muc 16.2 "join competition co policy rieng").
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post("competitions/room/:roomCode/join")
  joinCompetition(@CurrentUser() currentUser: AuthenticatedUser, @Param("roomCode") roomCode: string) {
    return this.olympiadService.joinCompetition(roomCode, currentUser.id);
  }

  @Get("competitions/:id/questions")
  getCompetitionQuestions(@CurrentUser() currentUser: AuthenticatedUser, @Param("id") id: string) {
    return this.olympiadService.getCompetitionQuestions(id, currentUser.id);
  }

  @Get("competitions/:id/state")
  getCompetitionState(@CurrentUser() currentUser: AuthenticatedUser, @Param("id") id: string) {
    return this.olympiadService.getCompetitionState(id, currentUser.id);
  }

  @Post("competitions/:id/submit")
  submitCompetitionAnswer(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: SubmitAnswerDto
  ) {
    return this.olympiadService.submitCompetitionAnswer({ competitionId: id, userId: currentUser.id, ...dto });
  }

  @Get("competitions/:id/leaderboard")
  getLeaderboard(@Param("id") id: string) {
    return this.olympiadService.getLeaderboard(id);
  }

  // FR-ORG-003/004: chi Manager cua chinh to chuc do xem duoc — kiem tra o OlympiadService qua facade,
  // khong gioi han o day de tranh lo su ton tai cua to chuc (RolesGuard chi kiem tra dang nhap).
  @Get("organizations/:organizationId/report")
  getOrganizationReport(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("organizationId") organizationId: string
  ) {
    return this.olympiadService.getOrganizationReport(organizationId, currentUser.id);
  }

  // FR-ORG-005: export ket qua + danh sach thanh vien, co audit (xem OlympiadService.exportOrganizationData).
  @Get("organizations/:organizationId/export")
  exportOrganizationData(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("organizationId") organizationId: string
  ) {
    return this.olympiadService.exportOrganizationData(organizationId, currentUser.id);
  }
}
