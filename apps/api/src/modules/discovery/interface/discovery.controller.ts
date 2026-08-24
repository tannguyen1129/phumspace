import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { PLACE_TYPES, type PlaceType } from "@phumspace/contracts";
import { CurrentUser } from "../../../common/auth/current-user.decorator";
import {
  JwtAuthGuard,
  type AuthenticatedUser,
} from "../../../common/auth/jwt-auth.guard";
import { Roles } from "../../../common/auth/roles.decorator";
import { RolesGuard } from "../../../common/auth/roles.guard";
import { DiscoveryService } from "../application/discovery.service";
import { CreatePlaceDto } from "./dto/create-place.dto";
import { BuildItineraryDto } from "./dto/build-itinerary.dto";

/**
 * DiscoveryController — Map & Discovery (MAP-001..014, TOUR-001..009).
 * Doc (list/detail/nearby) mo cho moi Registered User; tao dia diem can CONTRIBUTOR tro len.
 * Publish van qua PATCH /v1/phumdata/versions/:id/publish (PhumDataController).
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("discovery")
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get("health")
  health() {
    return { module: "discovery", status: "ok" };
  }

  @Get("places")
  listPlaces(
    @Query("placeType") placeType?: string,
    @Query("q") query?: string,
    @Query("visitStatus") visitStatus?: string,
    @Query("facility") facility?: string,
    @Query("hasEvent") hasEvent?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    const validPlaceType = isPlaceType(placeType) ? placeType : undefined;
    return this.discoveryService.listPlaces({
      placeType: validPlaceType,
      query,
      visitStatus:
        visitStatus === "OPEN" || visitStatus === "UNKNOWN"
          ? visitStatus
          : undefined,
      facility: facility?.trim() || undefined,
      hasEvent: hasEvent === "true",
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get("places/:entityId")
  getPlaceDetail(@Param("entityId") entityId: string) {
    return this.discoveryService.getPlaceDetail(entityId);
  }

  @Roles("CONTRIBUTOR", "REVIEWER", "PUBLISHER", "SYSTEM_ADMIN")
  @Post("places")
  createPlace(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreatePlaceDto,
  ) {
    return this.discoveryService.createPlace({
      ...dto,
      createdBy: currentUser.id,
    });
  }

  /** Nearby Discovery (MAP-005) — chi goi khi nguoi dung chu dong bam "Gan toi" (UX-V11-06 just-in-time). */
  @Get("nearby")
  nearby(
    @Query("lat") lat?: string,
    @Query("lng") lng?: string,
    @Query("radiusMeters") radiusMeters?: string,
    @Query("limit") limit?: string,
    @Query("placeType") placeType?: string,
    @Query("facility") facility?: string,
    @Query("includeClosed") includeClosed?: string,
  ) {
    const latitude = Number(lat);
    const longitude = Number(lng);
    if (!lat || !lng || Number.isNaN(latitude) || Number.isNaN(longitude)) {
      throw new BadRequestException("Thieu hoac sai dinh dang lat/lng.");
    }
    return this.discoveryService.nearby({
      latitude,
      longitude,
      radiusMeters: radiusMeters ? Number(radiusMeters) : undefined,
      limit: limit ? Number(limit) : undefined,
      placeType: isPlaceType(placeType) ? placeType : undefined,
      facility: facility?.trim() || undefined,
      includeClosed: includeClosed === "true",
    });
  }

  @Post("itinerary")
  buildItinerary(@Body() dto: BuildItineraryDto) {
    return this.discoveryService.buildItinerary(dto.placeIds);
  }
}

function isPlaceType(value: string | undefined): value is PlaceType {
  return !!value && (PLACE_TYPES as readonly string[]).includes(value);
}
