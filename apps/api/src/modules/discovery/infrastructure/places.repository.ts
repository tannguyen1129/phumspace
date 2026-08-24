import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import type { PlaceType, VerificationLevel } from "@phumspace/contracts";
import { PG_POOL } from "../../../common/database/database.module";
import type { PlaceSummary } from "../domain/place";

export interface PlaceGeoRow {
  entityId: string;
  placeType: PlaceType;
  localName: string | null;
  latitude: number;
  longitude: number;
  visitorSummary: string | null;
  openingHoursNote: string | null;
  etiquetteNote: string | null;
  administrativeArea: string;
  lastVerifiedAt: Date | null;
  address: string | null;
  contactNote: string | null;
  photoGuidanceNote: string | null;
  accessibilityNote: string | null;
  facilities: string[];
  visitStatus: "OPEN" | "CLOSED" | "TEMPORARILY_CLOSED" | "UNKNOWN";
  suggestedVisitMinutes: number | null;
}

interface PlaceGeoSqlRow {
  entity_id: string;
  place_type: PlaceType;
  local_name: string | null;
  latitude: string;
  longitude: string;
  visitor_summary: string | null;
  opening_hours_note: string | null;
  etiquette_note: string | null;
  administrative_area: string;
  last_verified_at: Date | null;
  address: string | null;
  contact_note: string | null;
  photo_guidance_note: string | null;
  accessibility_note: string | null;
  facilities: string[];
  visit_status: PlaceGeoRow["visitStatus"];
  suggested_visit_minutes: number | null;
}

function mapGeoRow(row: PlaceGeoSqlRow): PlaceGeoRow {
  return {
    entityId: row.entity_id,
    placeType: row.place_type,
    localName: row.local_name,
    // ST_Y/ST_X tra ve numeric dang string qua node-postgres — parse lai thanh number.
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    visitorSummary: row.visitor_summary,
    openingHoursNote: row.opening_hours_note,
    etiquetteNote: row.etiquette_note,
    administrativeArea: row.administrative_area,
    lastVerifiedAt: row.last_verified_at,
    address: row.address,
    contactNote: row.contact_note,
    photoGuidanceNote: row.photo_guidance_note,
    accessibilityNote: row.accessibility_note,
    facilities: row.facilities,
    visitStatus: row.visit_status,
    suggestedVisitMinutes: row.suggested_visit_minutes,
  };
}

interface PlaceSummarySqlRow extends PlaceGeoSqlRow {
  preferred_label: string;
  verification_level: VerificationLevel;
  distance_meters: string | null;
  has_upcoming_event: boolean;
}

function mapSummaryRow(row: PlaceSummarySqlRow): PlaceSummary {
  const geo = mapGeoRow(row);
  return {
    entityId: geo.entityId,
    placeType: geo.placeType,
    localName: geo.localName,
    latitude: geo.latitude,
    longitude: geo.longitude,
    visitorSummary: geo.visitorSummary,
    administrativeArea: geo.administrativeArea,
    preferredLabel: row.preferred_label,
    verificationLevel: row.verification_level,
    lastVerifiedAt: geo.lastVerifiedAt,
    distanceMeters:
      row.distance_meters !== null ? Number(row.distance_meters) : null,
    address: geo.address,
    facilities: geo.facilities,
    visitStatus: geo.visitStatus,
    suggestedVisitMinutes: geo.suggestedVisitMinutes,
    hasUpcomingEvent: row.has_upcoming_event,
    recommendationReason: null,
  };
}

const SELECT_GEO_FIELDS = `
  p.entity_id,
  p.place_type,
  p.local_name,
  ST_Y(p.location::geometry) AS latitude,
  ST_X(p.location::geometry) AS longitude,
  p.visitor_summary,
  p.opening_hours_note,
  p.etiquette_note,
  p.administrative_area,
  p.last_verified_at,
  p.address,
  p.contact_note,
  p.photo_guidance_note,
  p.accessibility_note,
  p.facilities,
  p.visit_status,
  p.suggested_visit_minutes
`;

@Injectable()
export class PlacesRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(input: {
    entityId: string;
    placeType: PlaceType;
    localName?: string;
    latitude: number;
    longitude: number;
    visitorSummary?: string;
    openingHoursNote?: string;
    etiquetteNote?: string;
    administrativeArea?: string;
  }): Promise<PlaceGeoRow> {
    const { rows } = await this.pool.query<PlaceGeoSqlRow>(
      `INSERT INTO place.places AS p
         (entity_id, place_type, local_name, location, visitor_summary, opening_hours_note,
          etiquette_note, administrative_area)
       VALUES
         ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography, $6, $7, $8, COALESCE($9, 'Trà Vinh'))
       RETURNING ${SELECT_GEO_FIELDS}`,
      [
        input.entityId,
        input.placeType,
        input.localName ?? null,
        input.longitude,
        input.latitude,
        input.visitorSummary ?? null,
        input.openingHoursNote ?? null,
        input.etiquetteNote ?? null,
        input.administrativeArea ?? null,
      ],
    );
    return mapGeoRow(rows[0]);
  }

  async findByEntityId(entityId: string): Promise<PlaceGeoRow | null> {
    const { rows } = await this.pool.query<PlaceGeoSqlRow>(
      `SELECT ${SELECT_GEO_FIELDS} FROM place.places p WHERE p.entity_id = $1`,
      [entityId],
    );
    return rows[0] ? mapGeoRow(rows[0]) : null;
  }

  /** Danh sach dia diem da PUBLISHED — dung cho Map/List (MAP-001..004). */
  async listPublished(input: {
    placeType?: PlaceType;
    query?: string;
    visitStatus?: "OPEN" | "UNKNOWN";
    facility?: string;
    hasEvent?: boolean;
    limit: number;
    offset: number;
  }): Promise<PlaceSummary[]> {
    const conditions = [`v.publication_status = 'PUBLISHED'`];
    const params: unknown[] = [];
    if (input.placeType) {
      params.push(input.placeType);
      conditions.push(`p.place_type = $${params.length}`);
    }
    if (input.query) {
      params.push(`%${input.query.trim()}%`);
      conditions.push(`(
        unaccent(lower(v.preferred_label)) LIKE unaccent(lower($${params.length})) OR
        unaccent(lower(COALESCE(p.local_name, ''))) LIKE unaccent(lower($${params.length})) OR
        unaccent(lower(COALESCE(v.description, ''))) LIKE unaccent(lower($${params.length})) OR
        unaccent(lower(COALESCE(p.visitor_summary, ''))) LIKE unaccent(lower($${params.length})) OR
        EXISTS (SELECT 1 FROM heritage.entity_categories ec JOIN heritage.taxonomy_terms tt ON tt.id=ec.term_id
                WHERE ec.entity_id=p.entity_id AND unaccent(lower(tt.label)) LIKE unaccent(lower($${params.length})))
      )`);
    }
    if (input.visitStatus) {
      params.push(input.visitStatus);
      conditions.push(`p.visit_status = $${params.length}`);
    }
    if (input.facility) {
      params.push(input.facility);
      conditions.push(`$${params.length} = ANY(p.facilities)`);
    }
    if (input.hasEvent)
      conditions.push(
        `EXISTS (SELECT 1 FROM place.festival_occurrences fo WHERE fo.place_id=p.entity_id AND fo.status IN ('PLANNED','CONFIRMED') AND fo.starts_at >= now())`,
      );
    params.push(input.limit, input.offset);

    const { rows } = await this.pool.query<PlaceSummarySqlRow>(
      `SELECT ${SELECT_GEO_FIELDS}, v.preferred_label, v.verification_level, NULL::double precision AS distance_meters,
              EXISTS (SELECT 1 FROM place.festival_occurrences fo WHERE fo.place_id=p.entity_id AND fo.status IN ('PLANNED','CONFIRMED') AND fo.starts_at >= now()) AS has_upcoming_event
       FROM place.places p
       JOIN heritage.entities e ON e.id = p.entity_id
       JOIN heritage.entity_versions v ON v.id = e.current_version_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY v.preferred_label
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    return rows.map(mapSummaryRow);
  }

  /** Nearby Discovery (MAP-005) — xep hang theo khoang cach thuc te bang PostGIS. */
  async nearby(input: {
    latitude: number;
    longitude: number;
    radiusMeters: number;
    limit: number;
    placeType?: PlaceType;
    facility?: string;
    includeClosed?: boolean;
  }): Promise<PlaceSummary[]> {
    const { rows } = await this.pool.query<PlaceSummarySqlRow>(
      `SELECT ${SELECT_GEO_FIELDS}, v.preferred_label, v.verification_level,
              ST_Distance(p.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance_meters,
              EXISTS (SELECT 1 FROM place.festival_occurrences fo WHERE fo.place_id=p.entity_id AND fo.status IN ('PLANNED','CONFIRMED') AND fo.starts_at >= now()) AS has_upcoming_event
       FROM place.places p
       JOIN heritage.entities e ON e.id = p.entity_id
       JOIN heritage.entity_versions v ON v.id = e.current_version_id
       WHERE v.publication_status = 'PUBLISHED'
         AND ST_DWithin(p.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
         AND ($5::text IS NULL OR p.place_type = $5)
         AND ($6::text IS NULL OR $6 = ANY(p.facilities))
         AND ($7::boolean OR p.visit_status NOT IN ('CLOSED','TEMPORARILY_CLOSED'))
       ORDER BY CASE WHEN p.visit_status='OPEN' THEN 0 WHEN p.visit_status='UNKNOWN' THEN 1 ELSE 2 END, distance_meters ASC
       LIMIT $4`,
      [
        input.longitude,
        input.latitude,
        input.radiusMeters,
        input.limit,
        input.placeType ?? null,
        input.facility ?? null,
        input.includeClosed ?? false,
      ],
    );
    return rows.map(mapSummaryRow);
  }
}
