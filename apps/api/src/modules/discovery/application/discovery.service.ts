import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  AccessLevel,
  PlaceType,
  SensitivityLevel,
} from "@phumspace/contracts";
import { PhumDataService } from "../../phumdata/application/phumdata.service";
import { PlacesRepository } from "../infrastructure/places.repository";
import type { PlaceDetail, PlaceSummary } from "../domain/place";

/**
 * DiscoveryService — Map & Discovery (System Design Document).
 * Tao dia diem = tao heritage entity (qua PhumDataService, entityType='PLACE') + ban ghi
 * toa do/thong tin thuc te trong place.places. Publish/version van do PhumDataService quan ly —
 * Discovery khong tu lam lai logic provenance/publication.
 */
@Injectable()
export class DiscoveryService {
  constructor(
    private readonly phumDataService: PhumDataService,
    private readonly placesRepository: PlacesRepository,
  ) {}

  async createPlace(input: {
    canonicalCode: string;
    placeType: PlaceType;
    preferredLabel: string;
    localName?: string;
    description?: string;
    accessLevel: AccessLevel;
    sensitivityLevel: SensitivityLevel;
    latitude: number;
    longitude: number;
    visitorSummary?: string;
    openingHoursNote?: string;
    etiquetteNote?: string;
    administrativeArea?: string;
    createdBy: string;
  }): Promise<PlaceDetail> {
    const entityWithVersion = await this.phumDataService.createDraftEntity({
      canonicalCode: input.canonicalCode,
      entityType: "PLACE",
      accessLevel: input.accessLevel,
      preferredLabel: input.preferredLabel,
      description: input.description,
      sensitivityLevel: input.sensitivityLevel,
      createdBy: input.createdBy,
    });

    try {
      await this.placesRepository.create({
        entityId: entityWithVersion.id,
        placeType: input.placeType,
        localName: input.localName,
        latitude: input.latitude,
        longitude: input.longitude,
        visitorSummary: input.visitorSummary,
        openingHoursNote: input.openingHoursNote,
        etiquetteNote: input.etiquetteNote,
        administrativeArea: input.administrativeArea,
      });
    } catch (error) {
      // Heritage entity da tao o buoc tren nhung chua publish — don sach de tranh entity
      // "mo coi" khong co du lieu dia ly, thay vi de canonicalCode bi chiem vinh vien.
      await this.phumDataService.deleteDraftEntity(entityWithVersion.id);
      throw error;
    }

    return this.getPlaceDetail(entityWithVersion.id);
  }

  async getPlaceDetail(entityId: string): Promise<PlaceDetail> {
    const [entity, geo] = await Promise.all([
      this.phumDataService.getEntity(entityId),
      this.placesRepository.findByEntityId(entityId),
    ]);
    if (!geo) {
      throw new NotFoundException(
        "Entity nay khong phai mot dia diem (khong co ban ghi place.places).",
      );
    }
    if (!entity.currentVersion) {
      throw new NotFoundException("Dia diem chua co phien ban noi dung nao.");
    }
    const sources = await this.phumDataService.listSourcesForVersion(
      entity.currentVersion.id,
    );

    return {
      entityId: entity.id,
      placeType: geo.placeType,
      localName: geo.localName,
      latitude: geo.latitude,
      longitude: geo.longitude,
      visitorSummary: geo.visitorSummary,
      administrativeArea: geo.administrativeArea,
      preferredLabel: entity.currentVersion.preferredLabel,
      description: entity.currentVersion.description,
      verificationLevel: entity.currentVersion.verificationLevel,
      publicationStatus: entity.currentVersion.publicationStatus,
      openingHoursNote: geo.openingHoursNote,
      etiquetteNote: geo.etiquetteNote,
      lastVerifiedAt: geo.lastVerifiedAt,
      distanceMeters: null,
      address: geo.address,
      facilities: geo.facilities,
      visitStatus: geo.visitStatus,
      suggestedVisitMinutes: geo.suggestedVisitMinutes,
      hasUpcomingEvent: false,
      recommendationReason: null,
      contactNote: geo.contactNote,
      photoGuidanceNote: geo.photoGuidanceNote,
      accessibilityNote: geo.accessibilityNote,
      sources: sources.map(({ id, title, author, url, reliability }) => ({
        id,
        title,
        author,
        url,
        reliability,
      })),
    };
  }

  async listPlaces(input: {
    placeType?: PlaceType;
    query?: string;
    visitStatus?: "OPEN" | "UNKNOWN";
    facility?: string;
    hasEvent?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<PlaceSummary[]> {
    return this.placesRepository.listPublished({
      placeType: input.placeType,
      query: input.query,
      visitStatus: input.visitStatus,
      facility: input.facility,
      hasEvent: input.hasEvent,
      limit: input.limit ?? 20,
      offset: input.offset ?? 0,
    });
  }

  async nearby(input: {
    latitude: number;
    longitude: number;
    radiusMeters?: number;
    limit?: number;
    placeType?: PlaceType;
    facility?: string;
    includeClosed?: boolean;
  }): Promise<PlaceSummary[]> {
    const places = await this.placesRepository.nearby({
      latitude: input.latitude,
      longitude: input.longitude,
      radiusMeters: input.radiusMeters ?? 5000,
      limit: input.limit ?? 20,
      placeType: input.placeType,
      facility: input.facility,
      includeClosed: input.includeClosed,
    });
    return places.map((place) => ({
      ...place,
      recommendationReason: place.hasUpcomingEvent
        ? "Gần bạn và đang có lịch sự kiện đã công bố"
        : place.visitStatus === "OPEN"
          ? "Gần bạn và đang có trạng thái mở cửa"
          : "Được xếp theo khoảng cách từ vị trí bạn chọn",
    }));
  }

  async buildItinerary(placeIds: string[]) {
    const uniqueIds = [...new Set(placeIds)];
    const remaining = await Promise.all(
      uniqueIds.map((id) => this.getPlaceDetail(id)),
    );
    const ordered = [remaining.shift()!];
    while (remaining.length) {
      const previous = ordered[ordered.length - 1];
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      remaining.forEach((candidate, index) => {
        const distance = haversineMeters(
          previous.latitude,
          previous.longitude,
          candidate.latitude,
          candidate.longitude,
        );
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      ordered.push(remaining.splice(nearestIndex, 1)[0]);
    }
    let totalTravelMinutes = 0;
    const stops = ordered.map((place, index) => {
      const distanceFromPreviousMeters =
        index === 0
          ? 0
          : haversineMeters(
              ordered[index - 1].latitude,
              ordered[index - 1].longitude,
              place.latitude,
              place.longitude,
            );
      const travelMinutesFromPrevious =
        index === 0
          ? 0
          : Math.max(1, Math.round(distanceFromPreviousMeters / 500));
      totalTravelMinutes += travelMinutesFromPrevious;
      return {
        order: index + 1,
        entityId: place.entityId,
        preferredLabel: place.preferredLabel,
        distanceFromPreviousMeters: Math.round(distanceFromPreviousMeters),
        travelMinutesFromPrevious,
        suggestedVisitMinutes: place.suggestedVisitMinutes ?? 45,
      };
    });
    const totalVisitMinutes = stops.reduce(
      (sum, stop) => sum + stop.suggestedVisitMinutes,
      0,
    );
    return {
      stops,
      totalTravelMinutes,
      totalVisitMinutes,
      totalDurationMinutes: totalTravelMinutes + totalVisitMinutes,
      note: "Thứ tự là gợi ý theo khoảng cách; PhumSpace không tự thay đổi lộ trình sau khi bạn bắt đầu.",
    };
  }
}

function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const radius = 6371000;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(value));
}
