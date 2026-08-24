import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../../common/auth/current-user.decorator";
import { JwtAuthGuard, type AuthenticatedUser } from "../../../common/auth/jwt-auth.guard";
import { Roles } from "../../../common/auth/roles.decorator";
import { RolesGuard } from "../../../common/auth/roles.guard";
import { FestivalService } from "../application/festival.service";
import { CreateFestivalDto } from "./dto/create-festival.dto";
import { UpdateOccurrenceStatusDto } from "./dto/update-occurrence-status.dto";
import { EmergencyBroadcastDto } from "./dto/emergency-broadcast.dto";
import { CreateBoatTeamDto } from "./dto/create-boat-team.dto";

/**
 * FestivalController — FR-FES-001..007. Dung `:entityId` thay vi `:slug` (UX doc goi y) de
 * nhat quan voi route `/places/:entityId` da co. Route `boat-teams` khai bao TRUOC `:entityId`
 * de NestJS khong nham "boat-teams" la 1 gia tri entityId.
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("festivals")
export class FestivalController {
  constructor(private readonly festivalService: FestivalService) {}

  @Get("health")
  health() {
    return { module: "festival", status: "ok" };
  }

  @Roles("PUBLISHER", "SYSTEM_ADMIN")
  @Post()
  create(@CurrentUser() currentUser: AuthenticatedUser, @Body() dto: CreateFestivalDto) {
    return this.festivalService.createFestival({
      canonicalCode: dto.canonicalCode,
      preferredLabel: dto.preferredLabel,
      description: dto.description,
      accessLevel: dto.accessLevel,
      sensitivityLevel: dto.sensitivityLevel,
      recurrenceRule: dto.recurrenceRule,
      organizerOrgId: dto.organizerOrgId,
      occurrences: dto.occurrences.map((occurrence) => ({
        placeId: occurrence.placeId,
        startsAt: new Date(occurrence.startsAt),
        endsAt: occurrence.endsAt ? new Date(occurrence.endsAt) : undefined,
        status: occurrence.status,
        events: occurrence.events?.map((event) => ({
          eventType: event.eventType,
          title: event.title,
          scheduledAt: event.scheduledAt ? new Date(event.scheduledAt) : undefined,
          note: event.note,
        })),
        facilities: occurrence.facilities,
      })),
      createdBy: currentUser.id,
    });
  }

  @Get()
  list() {
    return this.festivalService.listFestivals();
  }

  @Post("boat-teams")
  createBoatTeam(@CurrentUser() currentUser: AuthenticatedUser, @Body() dto: CreateBoatTeamDto) {
    return this.festivalService.createBoatTeam({ ...dto, createdBy: currentUser.id });
  }

  @Get("boat-teams")
  listBoatTeams() {
    return this.festivalService.listBoatTeams();
  }

  @Get("boat-teams/:id")
  getBoatTeam(@Param("id") id: string) {
    return this.festivalService.getBoatTeam(id);
  }

  @Get(":entityId")
  getDetail(@Param("entityId") entityId: string) {
    return this.festivalService.getFestivalDetail(entityId);
  }

  // FR-FES-003: chi Manager cua to chuc so huu le hoi (hoac SYSTEM_ADMIN) — kiem tra trong
  // FestivalService.assertCanManageFestival, khong gioi han @Roles o day de tranh lo su ton tai.
  @Patch("occurrences/:occurrenceId/status")
  updateOccurrenceStatus(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("occurrenceId") occurrenceId: string,
    @Body() dto: UpdateOccurrenceStatusDto
  ) {
    return this.festivalService.updateOccurrenceStatus(occurrenceId, dto.status, currentUser.id, currentUser.role);
  }

  // FR-FES-006: thong bao khan — cung dung assertCanManageFestival. :entityId khop voi
  // heritage.entities(id), giong het dinh danh cong khai dung o moi route/follow target khac.
  @Post(":entityId/broadcast")
  sendEmergencyBroadcast(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("entityId") entityId: string,
    @Body() dto: EmergencyBroadcastDto
  ) {
    return this.festivalService.sendEmergencyBroadcast(
      entityId,
      { ...dto, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined },
      currentUser.id,
      currentUser.role
    );
  }
}
