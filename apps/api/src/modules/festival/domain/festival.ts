import type { FestivalFacilityType, FestivalOccurrenceStatus } from "@phumspace/contracts";

export interface Festival {
  id: string;
  entityId: string;
  recurrenceRule: string | null;
  organizerOrgId: string | null;
  createdAt: Date;
}

export interface FestivalOccurrence {
  id: string;
  festivalId: string;
  placeId: string | null;
  startsAt: Date;
  endsAt: Date | null;
  status: FestivalOccurrenceStatus;
  createdAt: Date;
}

export interface FestivalEvent {
  id: string;
  occurrenceId: string;
  eventType: string;
  title: string;
  scheduledAt: Date | null;
  note: string | null;
  createdAt: Date;
}

export interface FestivalFacility {
  id: string;
  occurrenceId: string;
  facilityType: FestivalFacilityType;
  note: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface FestivalOccurrenceDetail extends FestivalOccurrence {
  events: FestivalEvent[];
  facilities: FestivalFacility[];
}

export interface FestivalDetail {
  id: string;
  entityId: string;
  preferredLabel: string;
  description: string | null;
  verificationLevel: string;
  publicationStatus: string;
  recurrenceRule: string | null;
  organizerOrgId: string | null;
  occurrences: FestivalOccurrenceDetail[];
}

export interface FestivalSummary {
  id: string;
  entityId: string;
  preferredLabel: string;
  publicationStatus: string;
  nextOccurrenceAt: Date | null;
}

export interface BoatTeam {
  id: string;
  organizationId: string | null;
  displayName: string;
  homePlaceId: string | null;
  symbolColor: string | null;
  story: string | null;
  createdBy: string;
  createdAt: Date;
}
