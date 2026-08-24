/**
 * Controlled vocabulary dung chung toan he thong.
 * Nguon: docs/PhumSpace_Tai_lieu_mo_ta_chi_tiet_du_an (Phu luc B) va
 * docs/PhumSpace_Database_Design_PhumData_Schema (Phu luc A).
 * Moi module PHAI dung lai cac enum nay thay vi tu dinh nghia trung lap.
 */

export const ENTITY_TYPES = [
  "PLACE",
  "TANGIBLE_HERITAGE",
  "INTANGIBLE_HERITAGE",
  "TERM",
  "PERSON",
  "ORGANIZATION",
  "EVENT",
  "MEDIA",
  "SOURCE",
] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

/** Muc do nhay cam noi dung — tach biet voi AccessLevel (ai duoc xem) va PublicationStatus (co cong bo chua). */
export const SENSITIVITY_LEVELS = ["PUBLIC", "CONTEXTUAL", "COMMUNITY_ONLY", "RESTRICTED"] as const;
export type SensitivityLevel = (typeof SENSITIVITY_LEVELS)[number];

/** Ai duoc phep truy cap ban ghi, doc lap voi trang thai xac minh/cong bo. */
export const ACCESS_LEVELS = ["PUBLIC", "EDUCATIONAL", "RESEARCH", "COMMUNITY_ONLY", "RESTRICTED"] as const;
export type AccessLevel = (typeof ACCESS_LEVELS)[number];

/** Vong doi xuat ban cua mot entity_version. */
export const PUBLICATION_STATUSES = [
  "DRAFT",
  "IN_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "SUPERSEDED",
  "WITHDRAWN",
] as const;
export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

/** Muc do noi dung da duoc doi chieu/xac nhan boi ai. */
export const VERIFICATION_LEVELS = [
  "UNVERIFIED",
  "COMMUNITY_CONFIRMED",
  "SOURCE_VERIFIED",
  "EXPERT_REVIEWED",
] as const;
export type VerificationLevel = (typeof VERIFICATION_LEVELS)[number];

export const RELATION_TYPES = [
  "LOCATED_AT",
  "PART_OF",
  "PRACTICED_BY",
  "PERFORMED_AT",
  "RELATED_TERM",
  "DEPICTED_IN",
  "VERIFIED_BY",
  "DERIVED_FROM",
] as const;
export type RelationType = (typeof RELATION_TYPES)[number];

/** Bang chung ung ho / mau thuan / bo sung ngu canh cho mot claim. */
export const RELATION_SUPPORT_TYPES = ["SUPPORTS", "CONTRADICTS", "CONTEXTUALIZES"] as const;
export type RelationSupportType = (typeof RELATION_SUPPORT_TYPES)[number];

export const CONSENT_SCOPES = ["PUBLIC", "EDUCATIONAL", "RESEARCH", "COMMUNITY_ONLY", "INTERNAL"] as const;
export type ConsentScope = (typeof CONSENT_SCOPES)[number];

export const AI_PERMISSIONS = [
  "RAG_ALLOWED",
  "EVALUATION_ONLY",
  "TRAINING_ALLOWED",
  "AI_NOT_ALLOWED",
] as const;
export type AiPermission = (typeof AI_PERMISSIONS)[number];

/** Trang thai vong doi mot contribution tu cong dong (SRS muc CON/MOD). */
export const CONTRIBUTION_STATES = [
  "DRAFT",
  "SUBMITTED",
  "TRIAGE",
  "CHANGES_REQUESTED",
  "EXPERT_REVIEW",
  "RIGHTS_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "REJECTED",
  "WITHDRAWN",
] as const;
export type ContributionState = (typeof CONTRIBUTION_STATES)[number];

/** Quyet dinh cua reviewer/publisher tren mot contribution (MOD-001..012). */
export const MODERATION_DECISIONS = ["APPROVED", "REJECTED", "CHANGES_REQUESTED"] as const;
export type ModerationDecision = (typeof MODERATION_DECISIONS)[number];

/** Trang thai thoi gian cua su kien/le hoi (bo sung v1.1 — luon phai co nguon + last_verified_at di kem). */
export const EVENT_TIME_STATUSES = ["TENTATIVE", "CONFIRMED", "CHANGED", "CANCELLED"] as const;
export type EventTimeStatus = (typeof EVENT_TIME_STATUSES)[number];

/**
 * Vai tro nguoi dung (SRS muc 15.1 Mo hinh phan quyen / System Design "phan quyen").
 * REGISTERED_USER la vai tro mac dinh khi dang ky (account-required baseline);
 * cac vai tro con lai duoc SYSTEM_ADMIN cap them, khong tu dang ky duoc.
 */
export const USER_ROLES = [
  "REGISTERED_USER",
  "TEACHER_ORGANIZER",
  "CONTRIBUTOR",
  "REVIEWER",
  "PUBLISHER",
  "SYSTEM_ADMIN",
  "RESEARCHER",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Loai dia diem — dung cho filter Discovery Map (UX Flow "Discovery Map"). */
export const PLACE_TYPES = [
  "PAGODA",
  "MUSEUM",
  "LAKE",
  "MARKET",
  "CRAFT_VILLAGE",
  "FESTIVAL_GROUND",
  "RESTAURANT",
  "OTHER",
] as const;
export type PlaceType = (typeof PLACE_TYPES)[number];

/** Tien do hoc mot tu vung (Handbook) — khong dung spaced-repetition algorithm o M4, de ngo R2. */
export const LEARNING_PROGRESS_STATUSES = ["NEW", "LEARNING", "LEARNED"] as const;
export type LearningProgressStatus = (typeof LEARNING_PROGRESS_STATUSES)[number];

/** Vong doi mot phong thi (Olympiad, rut gon cho M4 — polling leaderboard thay vi WebSocket realtime). */
export const COMPETITION_STATUSES = ["DRAFT", "OPEN", "ACTIVE", "CLOSED"] as const;
export type CompetitionStatus = (typeof COMPETITION_STATUSES)[number];

/**
 * Loai to chuc doi tac (SRS muc 7.12 FR-ORG, DB Design "iam.organization" — "Chua, truong, CLB,
 * bao tang, co quan, doi du an"). Khac voi ENTITY_TYPES.ORGANIZATION (do la loai noi dung
 * PhumData mo ta 1 to chuc, con day la thuc the quan tri/so huu du lieu that trong he thong).
 */
export const ORGANIZATION_TYPES = [
  "PAGODA",
  "SCHOOL",
  "CLUB",
  "MUSEUM",
  "AGENCY",
  "PROJECT_TEAM",
] as const;
export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];

/** Vong doi to chuc self-service (FR-ORG-001, M9) — SYSTEM_ADMIN tao thang ACTIVE; nguoi dung thuong gui yeu cau PENDING_APPROVAL cho toi khi duoc duyet. */
export const ORGANIZATION_STATUSES = ["PENDING_APPROVAL", "ACTIVE", "SUSPENDED", "REJECTED"] as const;
export type OrganizationStatus = (typeof ORGANIZATION_STATUSES)[number];

/** Vai tro thanh vien trong 1 to chuc (FR-ORG-002) — pham vi trong to chuc, khong phai UserRole he thong. */
export const ORGANIZATION_MEMBER_ROLES = ["MANAGER", "MEMBER"] as const;
export type OrganizationMemberRole = (typeof ORGANIZATION_MEMBER_ROLES)[number];

/** Trang thai 1 lan to chuc le hoi cu the (place.festival_occurrence). */
export const FESTIVAL_OCCURRENCE_STATUSES = ["PLANNED", "CONFIRMED", "POSTPONED", "CANCELLED"] as const;
export type FestivalOccurrenceStatus = (typeof FESTIVAL_OCCURRENCE_STATUSES)[number];

/** Loai tien ich/an toan hien thi tren Festival Detail (FR-FES-002, M10). */
export const FESTIVAL_FACILITY_TYPES = [
  "PARKING",
  "MEDICAL",
  "RESTROOM",
  "VIEWING_POINT",
  "SAFETY_WARNING",
] as const;
export type FestivalFacilityType = (typeof FESTIVAL_FACILITY_TYPES)[number];

/** Doi tuong nguoi dung co the theo doi de nhan thong bao (FR-FES-005, M10). */
export const FOLLOW_TARGET_TYPES = ["FESTIVAL", "BOAT_TEAM"] as const;
export type FollowTargetType = (typeof FOLLOW_TARGET_TYPES)[number];

/** Muc uu tien thong bao (FR-FES-006 "co thoi han va muc uu tien"). */
export const NOTIFICATION_PRIORITIES = ["NORMAL", "URGENT"] as const;
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];
