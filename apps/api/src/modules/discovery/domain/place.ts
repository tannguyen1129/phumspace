import type {
  PlaceType,
  PublicationStatus,
  VerificationLevel,
} from "@phumspace/contracts";

/** Dia diem — ket hop du lieu dia ly (place.places) va noi dung/provenance (heritage.entity_versions). */
export interface PlaceSummary {
  entityId: string;
  placeType: PlaceType;
  localName: string | null;
  latitude: number;
  longitude: number;
  visitorSummary: string | null;
  administrativeArea: string;
  preferredLabel: string;
  verificationLevel: VerificationLevel;
  lastVerifiedAt: Date | null;
  /** Chi co gia tri o ket qua Nearby Discovery. */
  distanceMeters: number | null;
  address: string | null;
  facilities: string[];
  visitStatus: "OPEN" | "CLOSED" | "TEMPORARILY_CLOSED" | "UNKNOWN";
  suggestedVisitMinutes: number | null;
  hasUpcomingEvent: boolean;
  recommendationReason: string | null;
}

export interface PlaceDetail extends PlaceSummary {
  description: string | null;
  openingHoursNote: string | null;
  etiquetteNote: string | null;
  contactNote: string | null;
  photoGuidanceNote: string | null;
  accessibilityNote: string | null;
  publicationStatus: PublicationStatus;
  sources: Array<{
    id: string;
    title: string;
    author: string | null;
    url: string | null;
    reliability: string | null;
  }>;
}
