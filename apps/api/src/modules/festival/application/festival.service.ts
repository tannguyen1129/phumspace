import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  AccessLevel,
  FestivalFacilityType,
  FestivalOccurrenceStatus,
  NotificationPriority,
  SensitivityLevel,
} from "@phumspace/contracts";
import { AuditLogService } from "../../../common/audit/audit-log.service";
import { PhumDataService } from "../../phumdata/application/phumdata.service";
import { NotificationService } from "../../notification/application/notification.service";
import { OrganizationService } from "../../organization/application/organization.service";
import { FestivalsRepository } from "../infrastructure/festivals.repository";
import { FestivalOccurrencesRepository } from "../infrastructure/festival-occurrences.repository";
import { FestivalEventsRepository } from "../infrastructure/festival-events.repository";
import { FestivalFacilitiesRepository } from "../infrastructure/festival-facilities.repository";
import { BoatTeamsRepository } from "../infrastructure/boat-teams.repository";
import type { BoatTeam, FestivalDetail, FestivalSummary } from "../domain/festival";

interface OccurrenceInput {
  placeId?: string;
  startsAt: Date;
  endsAt?: Date;
  status?: FestivalOccurrenceStatus;
  events?: Array<{ eventType: string; title: string; scheduledAt?: Date; note?: string }>;
  facilities?: Array<{ facilityType: FestivalFacilityType; note?: string; latitude?: number; longitude?: number }>;
}

/**
 * FestivalService — FR-FES-001/007 (MUST/R1, dong no ky thuat GD1 — xem plan.md Milestone M8).
 * Le hoi CUNG LA 1 heritage entity (entity_type='EVENT') de dung chung noi dung/nguon/publication
 * status voi phan con lai cua PhumData — dung facade PhumDataService y het DiscoveryService da
 * lam voi Place o M2 (bao gom compensating cleanup qua deleteDraftEntity neu buoc sau that bai).
 */
@Injectable()
export class FestivalService {
  constructor(
    private readonly phumDataService: PhumDataService,
    private readonly festivalsRepository: FestivalsRepository,
    private readonly occurrencesRepository: FestivalOccurrencesRepository,
    private readonly eventsRepository: FestivalEventsRepository,
    private readonly facilitiesRepository: FestivalFacilitiesRepository,
    private readonly boatTeamsRepository: BoatTeamsRepository,
    private readonly notificationService: NotificationService,
    private readonly organizationService: OrganizationService,
    private readonly auditLogService: AuditLogService
  ) {}

  async createFestival(input: {
    canonicalCode: string;
    preferredLabel: string;
    description?: string;
    accessLevel: AccessLevel;
    sensitivityLevel: SensitivityLevel;
    recurrenceRule?: string;
    organizerOrgId?: string;
    occurrences: OccurrenceInput[];
    createdBy: string;
  }): Promise<FestivalDetail> {
    const entityWithVersion = await this.phumDataService.createDraftEntity({
      canonicalCode: input.canonicalCode,
      entityType: "EVENT",
      accessLevel: input.accessLevel,
      preferredLabel: input.preferredLabel,
      description: input.description,
      sensitivityLevel: input.sensitivityLevel,
      createdBy: input.createdBy,
    });

    try {
      const festival = await this.festivalsRepository.create({
        entityId: entityWithVersion.id,
        recurrenceRule: input.recurrenceRule,
        organizerOrgId: input.organizerOrgId,
      });

      for (const occurrenceInput of input.occurrences) {
        const occurrence = await this.occurrencesRepository.create({
          festivalId: festival.id,
          placeId: occurrenceInput.placeId,
          startsAt: occurrenceInput.startsAt,
          endsAt: occurrenceInput.endsAt,
          status: occurrenceInput.status,
        });
        for (const eventInput of occurrenceInput.events ?? []) {
          await this.eventsRepository.create({ occurrenceId: occurrence.id, ...eventInput });
        }
        for (const facilityInput of occurrenceInput.facilities ?? []) {
          await this.facilitiesRepository.create({ occurrenceId: occurrence.id, ...facilityInput });
        }
      }
    } catch (error) {
      // Heritage entity da tao o buoc tren nhung chua publish — don sach thay vi de "mo coi"
      // (pattern giong het DiscoveryService.createPlace, xem fix M2).
      await this.phumDataService.deleteDraftEntity(entityWithVersion.id);
      throw error;
    }

    return this.getFestivalDetail(entityWithVersion.id);
  }

  async getFestivalDetail(entityId: string): Promise<FestivalDetail> {
    const [entity, festival] = await Promise.all([
      this.phumDataService.getEntity(entityId),
      this.festivalsRepository.findByEntityId(entityId),
    ]);
    if (!festival) {
      throw new NotFoundException("Entity nay khong phai le hoi (khong co ban ghi place.festivals).");
    }
    if (!entity.currentVersion) {
      throw new NotFoundException("Le hoi chua co phien ban noi dung nao.");
    }

    const occurrences = await this.occurrencesRepository.listForFestival(festival.id);
    const occurrenceIds = occurrences.map((occurrence) => occurrence.id);
    const [eventsByOccurrence, facilitiesByOccurrence] = await Promise.all([
      this.eventsRepository.listForOccurrences(occurrenceIds),
      this.facilitiesRepository.listForOccurrences(occurrenceIds),
    ]);

    return {
      id: festival.id,
      entityId: entity.id,
      preferredLabel: entity.currentVersion.preferredLabel,
      description: entity.currentVersion.description,
      verificationLevel: entity.currentVersion.verificationLevel,
      publicationStatus: entity.currentVersion.publicationStatus,
      recurrenceRule: festival.recurrenceRule,
      organizerOrgId: festival.organizerOrgId,
      occurrences: occurrences.map((occurrence) => ({
        ...occurrence,
        events: eventsByOccurrence.get(occurrence.id) ?? [],
        facilities: facilitiesByOccurrence.get(occurrence.id) ?? [],
      })),
    };
  }

  /** Chi tra le hoi da PUBLISHED — giong nguyen tac listPlaces/search cua PhumData (khong lo noi dung DRAFT qua danh sach cong khai). */
  async listFestivals(): Promise<FestivalSummary[]> {
    const festivals = await this.festivalsRepository.listAll();
    const nextByFestival = await this.occurrencesRepository.findNextUpcomingByFestivalIds(
      festivals.map((festival) => festival.id)
    );
    const entities = await Promise.all(
      festivals.map((festival) => this.phumDataService.getEntity(festival.entityId))
    );
    return festivals
      .map((festival, index) => ({ festival, entity: entities[index] }))
      .filter(({ entity }) => entity.currentVersion?.publicationStatus === "PUBLISHED")
      .map(({ festival, entity }) => ({
        id: festival.id,
        entityId: festival.entityId,
        preferredLabel: entity.currentVersion?.preferredLabel ?? "(chua co ten)",
        publicationStatus: entity.currentVersion?.publicationStatus ?? "DRAFT",
        nextOccurrenceAt: nextByFestival.get(festival.id) ?? null,
      }));
  }

  /** Chi Organization Manager cua chinh to chuc to chuc le hoi do, hoac SYSTEM_ADMIN. */
  /**
   * Nhan entityId (dinh danh cong khai duy nhat cho 1 le hoi — dung xuyen suot route
   * `/festivals/:entityId`, follow target, va o day) chu KHONG phai `place.festivals.id` noi bo.
   * Tra ve ca 2 id vi cac repository con lai (occurrences...) van khoa ngoai theo festival.id noi bo.
   */
  private async assertCanManageFestival(
    entityId: string,
    actorId: string,
    actorRole: string
  ): Promise<{ festivalId: string; entityId: string }> {
    const festival = await this.festivalsRepository.findByEntityId(entityId);
    if (!festival) throw new NotFoundException("Khong tim thay le hoi.");
    if (actorRole !== "SYSTEM_ADMIN") {
      if (!festival.organizerOrgId) {
        throw new ForbiddenException("Le hoi nay chua gan to chuc quan ly.");
      }
      await this.organizationService.assertIsManager(festival.organizerOrgId, actorId);
    }
    return { festivalId: festival.id, entityId: festival.entityId };
  }

  /**
   * FR-FES-003: cap nhat trang thai 1 lan to chuc (du kien/xac nhan/hoan/huy), ghi lich su qua
   * ops.audit_events (khong tao bang "revision" rieng — xem ghi chu migration 1700000013000) va
   * bao cho nguoi theo doi le hoi (FR-FES-005 "thay doi lich phat thong bao").
   */
  async updateOccurrenceStatus(
    occurrenceId: string,
    status: FestivalOccurrenceStatus,
    actorId: string,
    actorRole: string
  ): Promise<void> {
    const occurrence = await this.occurrencesRepository.findById(occurrenceId);
    if (!occurrence) throw new NotFoundException("Khong tim thay lan to chuc.");
    // occurrence.festivalId la id noi bo — phai tra ve entityId truoc khi dung lam follow target
    // (day chinh la loi tim thay khi dien tap M10: broadcast truoc day dung nham festival.id noi
    // bo trong khi FollowButton luon theo doi theo entityId, nen thong bao khong bao gio den noi).
    const festivalRow = await this.festivalsRepository.findById(occurrence.festivalId);
    if (!festivalRow) throw new NotFoundException("Khong tim thay le hoi.");
    const festival = await this.assertCanManageFestival(festivalRow.entityId, actorId, actorRole);
    const entity = await this.phumDataService.getEntity(festival.entityId);

    await this.occurrencesRepository.updateStatus(occurrenceId, status);
    await this.auditLogService.record({
      actorId,
      action: "FESTIVAL_OCCURRENCE_STATUS_CHANGED",
      targetType: "festival_occurrence",
      targetId: occurrenceId,
      metadata: { from: occurrence.status, to: status },
    });
    await this.notificationService.broadcast({
      targetType: "FESTIVAL",
      targetId: festival.entityId,
      title: `${entity.currentVersion?.preferredLabel ?? "Lễ hội"}: cập nhật lịch`,
      body: `Trạng thái thay đổi từ ${occurrence.status} sang ${status}.`,
      priority: "NORMAL",
    });
  }

  /** FR-FES-006: thong bao khan/cap nhat co thoi han va muc uu tien, chi Manager cua to chuc so huu le hoi hoac SYSTEM_ADMIN. */
  async sendEmergencyBroadcast(
    entityId: string,
    input: { title: string; body: string; priority?: NotificationPriority; expiresAt?: Date },
    actorId: string,
    actorRole: string
  ): Promise<number> {
    const festival = await this.assertCanManageFestival(entityId, actorId, actorRole);
    const recipientCount = await this.notificationService.broadcast({
      targetType: "FESTIVAL",
      targetId: festival.entityId,
      title: input.title,
      body: input.body,
      priority: input.priority ?? "URGENT",
      expiresAt: input.expiresAt,
    });
    await this.auditLogService.record({
      actorId,
      action: "FESTIVAL_EMERGENCY_BROADCAST_SENT",
      targetType: "festival",
      targetId: festival.entityId,
      metadata: { title: input.title, recipientCount },
    });
    return recipientCount;
  }

  /** FR-FES-004: ho so doi ghe Ngo — chi ten/dia phuong/mau sac/cau chuyen da duyet, khong co du lieu thanh vien ca nhan. */
  async createBoatTeam(input: {
    displayName: string;
    organizationId?: string;
    homePlaceId?: string;
    symbolColor?: string;
    story?: string;
    createdBy: string;
  }): Promise<BoatTeam> {
    return this.boatTeamsRepository.create(input);
  }

  async getBoatTeam(id: string): Promise<BoatTeam> {
    const team = await this.boatTeamsRepository.findById(id);
    if (!team) throw new NotFoundException("Khong tim thay doi ghe.");
    return team;
  }

  async listBoatTeams(): Promise<BoatTeam[]> {
    return this.boatTeamsRepository.list();
  }
}
