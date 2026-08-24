import { enqueueOfflineMutation } from "./offline-mutation-queue";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
const ACCESS_TOKEN_KEY = "ps_access_token";
const REFRESH_TOKEN_KEY = "ps_refresh_token";
/**
 * Cookie khong-httpOnly, CHI de middleware.ts biet duong nao can redirect ve /welcome.
 * Day KHONG phai bien gioi bao mat — bien gioi that la JWT Authorization header o moi API call,
 * duoc JwtAuthGuard kiem tra phia server (xem apps/api/src/common/auth). Vi token nam trong
 * localStorage/header (khong phai cookie tu dong gui kem request), luong nay khong co "ambient
 * credential" nen khong can CSRF token — day la ly do kien truc chon Bearer header thay vi
 * session cookie tu M1, khong phai thieu sot can vá o M6 (hardening M6: CORS allowlist, rate
 * limit, EXIF strip — xem apps/api/src/common).
 */
const AUTH_COOKIE_NAME = "ps_auth";
const HTTP_NO_CONTENT = 204;
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
let refreshInFlight: Promise<AuthTokens | null> | null = null;

export interface AccessibilityPreferences {
  reducedMotion?: boolean;
  largeText?: boolean;
}
export interface NotificationPreferences {
  inApp?: boolean;
  email?: boolean;
  festivalUpdates?: boolean;
  securityAlerts?: boolean;
}

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  preferredLanguage: string | null;
  interests: string[] | null;
  accessibilityPreferences: AccessibilityPreferences | null;
  notificationPreferences: NotificationPreferences;
  emailVerifiedAt: string | null;
  mfaEnabled: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function refreshSession(): Promise<AuthTokens | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE_URL}/v1/identity/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const payload = (await response.json()) as { tokens: AuthTokens };
        saveTokens(payload.tokens);
        return payload.tokens;
      })
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

function expireSession(): void {
  clearTokens();
  if (
    typeof window !== "undefined" &&
    window.location.pathname !== "/welcome"
  ) {
    window.location.assign("/welcome?reason=session-expired");
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retried = false,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const refreshExcluded = [
    "/v1/identity/login",
    "/v1/identity/register",
    "/v1/identity/refresh",
    "/v1/identity/logout",
  ].includes(path);
  if (response.status === 401 && !retried && !refreshExcluded) {
    const tokens = await refreshSession();
    if (tokens) {
      return request<T>(
        path,
        {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        },
        true,
      );
    }
    expireSession();
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: undefined }));
    throw new ApiError(
      response.status,
      body.message ?? `Loi API (${response.status})`,
    );
  }

  if (response.status === HTTP_NO_CONTENT) return undefined as T;
  return response.json() as Promise<T>;
}

export function saveTokens(tokens: AuthTokens): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function register(input: {
  email: string;
  password: string;
  displayName: string;
}): Promise<{
  user: PublicUser;
  tokens: AuthTokens;
  devEmailVerificationToken?: string;
}> {
  return request("/v1/identity/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function login(input: {
  email: string;
  password: string;
  mfaCode?: string;
}): Promise<{ user: PublicUser; tokens: AuthTokens }> {
  return request("/v1/identity/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function setupMfa(): Promise<{
  secret: string;
  provisioningUri: string;
}> {
  return request("/v1/identity/mfa/setup", {
    method: "POST",
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
}
export async function enableMfa(code: string): Promise<void> {
  await request("/v1/identity/mfa/enable", {
    method: "POST",
    headers: { Authorization: `Bearer ${getAccessToken()}` },
    body: JSON.stringify({ code }),
  });
}
export async function disableMfa(code: string): Promise<void> {
  await request("/v1/identity/mfa/disable", {
    method: "POST",
    headers: { Authorization: `Bearer ${getAccessToken()}` },
    body: JSON.stringify({ code }),
  });
}

export async function verifyEmail(token: string): Promise<void> {
  await request("/v1/identity/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export async function resendVerification(): Promise<{
  accepted: boolean;
  devEmailVerificationToken?: string;
}> {
  return request("/v1/identity/resend-verification", {
    method: "POST",
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
}

export async function forgotPassword(
  email: string,
): Promise<{ message: string; devPasswordResetToken?: string }> {
  return request("/v1/identity/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<void> {
  await request("/v1/identity/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

export async function fetchMe(): Promise<PublicUser> {
  return request("/v1/identity/me", {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
}

export async function updatePreferences(input: {
  displayName?: string;
  preferredLanguage?: string;
  interests?: string[];
  accessibilityPreferences?: AccessibilityPreferences;
  notificationPreferences?: NotificationPreferences;
}): Promise<PublicUser> {
  return request("/v1/identity/me/preferences", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${getAccessToken()}` },
    body: JSON.stringify(input),
  });
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    await request<void>("/v1/identity/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined);
  }
  clearTokens();
}

export interface PlaceSummary {
  entityId: string;
  placeType: string;
  localName: string | null;
  latitude: number;
  longitude: number;
  visitorSummary: string | null;
  administrativeArea: string;
  preferredLabel: string;
  verificationLevel: string;
  lastVerifiedAt: string | null;
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
  publicationStatus: string;
  sources: Array<{
    id: string;
    title: string;
    author: string | null;
    url: string | null;
    reliability: string | null;
  }>;
}

function authHeaders(): HeadersInit {
  return { Authorization: `Bearer ${getAccessToken()}` };
}

export async function listPlaces(
  params: {
    placeType?: string;
    q?: string;
    visitStatus?: string;
    facility?: string;
    hasEvent?: boolean;
  } = {},
): Promise<PlaceSummary[]> {
  const query = new URLSearchParams();
  if (params.placeType) query.set("placeType", params.placeType);
  if (params.q) query.set("q", params.q);
  if (params.visitStatus) query.set("visitStatus", params.visitStatus);
  if (params.facility) query.set("facility", params.facility);
  if (params.hasEvent) query.set("hasEvent", "true");
  const qs = query.toString();
  return request(`/v1/discovery/places${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(),
  });
}

export async function getPlaceDetail(entityId: string): Promise<PlaceDetail> {
  return request(`/v1/discovery/places/${entityId}`, {
    headers: authHeaders(),
  });
}

export async function nearbyPlaces(
  latitude: number,
  longitude: number,
  radiusMeters = 5000,
  filters: {
    placeType?: string;
    facility?: string;
    includeClosed?: boolean;
  } = {},
): Promise<PlaceSummary[]> {
  const query = new URLSearchParams({
    lat: String(latitude),
    lng: String(longitude),
    radiusMeters: String(radiusMeters),
  });
  if (filters.placeType) query.set("placeType", filters.placeType);
  if (filters.facility) query.set("facility", filters.facility);
  if (filters.includeClosed) query.set("includeClosed", "true");
  return request(`/v1/discovery/nearby?${query.toString()}`, {
    headers: authHeaders(),
  });
}

export interface HeritageSearchResult {
  id: string;
  entityId: string;
  preferredLabel: string;
  description: string | null;
  verificationLevel: string;
  sensitivityLevel: string;
}

export async function searchHeritage(
  query: string,
): Promise<HeritageSearchResult[]> {
  return request(`/v1/phumdata/search?q=${encodeURIComponent(query)}`, {
    headers: authHeaders(),
  });
}

export interface HeritageEntityDetail {
  id: string;
  entityType: string;
  accessLevel: string;
  currentVersion: {
    id: string;
    preferredLabel: string;
    description: string | null;
    verificationLevel: string;
    publicationStatus: string;
  } | null;
}
export interface HeritageSource {
  id: string;
  title: string;
  author: string | null;
  url: string | null;
  reliability: string | null;
}
export async function getHeritageEntity(
  id: string,
): Promise<HeritageEntityDetail> {
  return request(`/v1/phumdata/entities/${id}`, { headers: authHeaders() });
}
export async function getHeritageSources(
  versionId: string,
): Promise<HeritageSource[]> {
  return request(`/v1/phumdata/versions/${versionId}/sources`, {
    headers: authHeaders(),
  });
}

export interface Itinerary {
  stops: Array<{
    order: number;
    entityId: string;
    preferredLabel: string;
    distanceFromPreviousMeters: number;
    travelMinutesFromPrevious: number;
    suggestedVisitMinutes: number;
  }>;
  totalTravelMinutes: number;
  totalVisitMinutes: number;
  totalDurationMinutes: number;
  note: string;
}

export async function buildItinerary(placeIds: string[]): Promise<Itinerary> {
  return request("/v1/discovery/itinerary", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ placeIds }),
  });
}

export interface ModelSynthesis {
  decisionHint: string;
  primaryCandidateId: string | null;
  alternativeCandidateIds: string[];
  observedFeatures: string[];
  title: string;
  summary: string;
  culturalMeaning?: string;
  citationIds: string[];
  verificationLabel: string;
  uncertaintyNote?: string;
  nextActions: string[];
}

export interface ScanResult {
  decision: string;
  confidence: number;
  entityId: string | null;
  alternativeEntityIds: string[];
  synthesis: ModelSynthesis;
  requiresHumanReview: boolean;
  citationCoverageComplete: boolean;
}

export interface ScanStatus {
  id: string;
  status: string;
  errorMessage: string | null;
  result: ScanResult | null;
}

/** Upload multipart — khong the dung request() vi FormData can trinh duyet tu dat Content-Type (kem boundary). */
export async function createScan(
  file: File,
  placeId?: string,
): Promise<{ id: string; status: string }> {
  const formData = new FormData();
  formData.append("image", file);
  if (placeId) formData.append("placeId", placeId);

  const response = await fetch(`${API_BASE_URL}/v1/scanner/scans`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: undefined }));
    throw new ApiError(
      response.status,
      body.message ?? `Loi API (${response.status})`,
    );
  }
  return response.json();
}

export async function getScan(id: string): Promise<ScanStatus> {
  return request(`/v1/scanner/scans/${id}`, { headers: authHeaders() });
}
export async function sendScanFeedback(
  id: string,
  feedbackType:
    | "CORRECT"
    | "INCORRECT"
    | "UNSURE"
    | "SELECTED_CANDIDATE"
    | "REQUEST_REVIEW",
  selectedEntityId?: string,
): Promise<void> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await enqueueOfflineMutation({ path: `/v1/scanner/scans/${id}/feedback`, method: "POST", body: JSON.stringify({ feedbackType, selectedEntityId }), label: "Phản hồi nhận diện" });
    return;
  }
  await request(`/v1/scanner/scans/${id}/feedback`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ feedbackType, selectedEntityId }),
  });
}

export interface HandbookTerm {
  id: string;
  khmerText: string;
  latinTransliteration: string | null;
  meaningVi: string;
  meaningEn: string | null;
  entityId: string | null;
}

export interface TermExample {
  id: string;
  exampleKhmer: string;
  exampleVi: string;
}

export interface TermAudio {
  id: string;
  mediaKey: string;
  /** Signed URL tu MediaStorageService — dung truc tiep lam src cho <audio>, khong can Authorization header. */
  audioUrl: string;
  speakerName: string | null;
  region: string | null;
  recordedAt: string | null;
  rightsNote: string | null;
  transcript: string | null;
  verificationStatus: string;
}

export interface TermDetail extends HandbookTerm {
  examples: TermExample[];
  audio: TermAudio[];
  progress: string | null;
}

export async function listTerms(
  params: { q?: string; entityId?: string } = {},
): Promise<HandbookTerm[]> {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.entityId) query.set("entityId", params.entityId);
  const qs = query.toString();
  return request(`/v1/handbook/terms${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(),
  });
}

export async function getTermDetail(id: string): Promise<TermDetail> {
  return request(`/v1/handbook/terms/${id}`, { headers: authHeaders() });
}

export async function updateTermProgress(
  id: string,
  status: string,
): Promise<void> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await enqueueOfflineMutation({ path: `/v1/handbook/terms/${id}/progress`, method: "PATCH", body: JSON.stringify({ status }), label: "Tiến độ học" });
    return;
  }
  await request(`/v1/handbook/terms/${id}/progress`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
}

export async function getPracticeDeck(limit = 10): Promise<HandbookTerm[]> {
  return request(`/v1/handbook/practice/deck?limit=${limit}`, { headers: authHeaders() });
}
export async function recordPractice(termId: string, result: "AGAIN" | "HARD" | "GOOD"): Promise<void> {
  await request(`/v1/handbook/practice/result`, { method: "POST", headers: authHeaders(), body: JSON.stringify({ termId, result }) });
}

export interface QuizQuestion {
  id: string;
  entityId: string | null;
  questionText: string;
  choices: Array<{ id: string; text: string }>;
  version: number;
  questionType: string;
  timeLimitSeconds: number | null;
}

export interface QuizSubmissionResult {
  questionId: string;
  selectedChoiceId: string;
  isCorrect: boolean;
  correctChoiceId: string;
  explanation: string | null;
  acceptedAt: string;
  duplicate: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  correctCount: number;
  answeredCount: number;
}

export interface Competition {
  id: string;
  title: string;
  status: string;
  roomCode: string;
}

export async function getSoloQuiz(count = 5): Promise<QuizQuestion[]> {
  return request(`/v1/olympiad/quiz/solo?count=${count}`, {
    headers: authHeaders(),
  });
}

export async function submitSoloAnswer(
  questionId: string,
  selectedChoiceId: string,
): Promise<QuizSubmissionResult> {
  return request(`/v1/olympiad/quiz/solo/submit`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ questionId, selectedChoiceId }),
  });
}

export async function getCompetitionByRoomCode(
  roomCode: string,
): Promise<Competition> {
  return request(`/v1/olympiad/competitions/room/${roomCode}`, {
    headers: authHeaders(),
  });
}

export async function joinCompetition(roomCode: string): Promise<Competition> {
  return request(`/v1/olympiad/competitions/room/${roomCode}/join`, {
    method: "POST",
    headers: authHeaders(),
  });
}

export async function getCompetitionQuestions(
  competitionId: string,
): Promise<QuizQuestion[]> {
  return request(`/v1/olympiad/competitions/${competitionId}/questions`, {
    headers: authHeaders(),
  });
}

export async function submitCompetitionAnswer(
  competitionId: string,
  questionId: string,
  selectedChoiceId: string,
  questionVersion: number,
  idempotencyKey: string,
): Promise<QuizSubmissionResult> {
  return request(`/v1/olympiad/competitions/${competitionId}/submit`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ questionId, selectedChoiceId, questionVersion, idempotencyKey }),
  });
}

export async function getCompetitionState(competitionId: string): Promise<{ status: string; serverTime: string }> {
  return request(`/v1/olympiad/competitions/${competitionId}/state`, { headers: authHeaders() });
}

export async function trackAnalytics(eventName:string,properties:Record<string,unknown>={}):Promise<void>{await request(`/v1/analytics/events`,{method:"POST",headers:authHeaders(),body:JSON.stringify({eventName,properties,schemaVersion:1})});}
export async function setAnalyticsOptOut(optOut:boolean):Promise<void>{await request(`/v1/analytics/preferences`,{method:"PATCH",headers:authHeaders(),body:JSON.stringify({optOut})});}
export async function getAnalyticsOverview():Promise<Record<string,string>>{return request(`/v1/analytics/admin/overview`,{headers:authHeaders()});}
export async function getTechnicalOverview():Promise<Record<string,string>>{return request(`/v1/analytics/admin/technical`,{headers:authHeaders()});}
export async function acceptOrganizationInvite(token:string):Promise<{organizationId:string;role:string}>{return request(`/v1/organizations/invites/accept`,{method:"POST",headers:authHeaders(),body:JSON.stringify({token})});}
export async function inviteOrganizationMember(organizationId:string,email:string,role:"MANAGER"|"MEMBER"):Promise<void>{await request(`/v1/organizations/${organizationId}/invites`,{method:"POST",headers:authHeaders(),body:JSON.stringify({email,role})});}

export async function getLeaderboard(
  competitionId: string,
): Promise<LeaderboardEntry[]> {
  return request(`/v1/olympiad/competitions/${competitionId}/leaderboard`, {
    headers: authHeaders(),
  });
}

export interface Contribution {
  id: string;
  contributorId: string;
  termId: string | null;
  proposedKhmerText: string | null;
  proposedLatinTransliteration: string | null;
  proposedMeaningVi: string | null;
  mediaKey: string;
  region: string | null;
  consentScope: string;
  aiPermission: string;
  attributionName: string | null;
  sensitive: boolean;
  status: string;
  resultTermId: string | null;
  resultAudioId: string | null;
  createdAt: string;
  contributionType: string; language: string; recordedAt: string | null; recordedBy: string | null;
  contextNote: string | null; locationNote: string | null; consentVersion: string;
  consentConfirmedAt: string; consentMethod: string; attributionRole: string | null;
  attributionCommunity: string | null; assignedReviewerId: string | null; priority: string;
}

export interface ContributionDraft { id:string; contribution_type:string; payload:Record<string,unknown>; updated_at:string; }
export async function listContributionDrafts():Promise<ContributionDraft[]>{return request(`/v1/contribution/drafts`,{headers:authHeaders()});}
export async function saveContributionDraft(input:{id?:string;contributionType:string;payload:Record<string,unknown>}):Promise<ContributionDraft>{return request(`/v1/contribution/drafts`,{method:"PUT",headers:authHeaders(),body:JSON.stringify(input)});}
export async function deleteContributionDraft(id:string):Promise<void>{await request(`/v1/contribution/drafts/${id}`,{method:"DELETE",headers:authHeaders()});}
export async function claimContribution(id:string):Promise<Contribution>{return request(`/v1/moderation/contributions/${id}/claim`,{method:"POST",headers:authHeaders()});}
export async function getContributionRevisions(id:string):Promise<Array<{id:string;revision_number:number;snapshot:Record<string,unknown>;created_at:string}>>{return request(`/v1/moderation/contributions/${id}/revisions`,{headers:authHeaders()});}

export interface ContributionDetail extends Contribution {
  audioUrl: string;
}

export interface ModerationDecisionRecord {
  id: string;
  reviewerId: string;
  decision: string;
  reason: string | null;
  createdAt: string;
}

/** Upload multipart — xem ghi chu tuong tu createScan() ve ly do khong dung request(). */
export async function submitContribution(input: {
  file: File;
  termId?: string;
  proposedKhmerText?: string;
  proposedLatinTransliteration?: string;
  proposedMeaningVi?: string;
  region?: string;
  consentScope: string;
  aiPermission?: string;
  attributionName?: string;
  sensitive?: boolean;
  language?: string;
  recordedAt?: string;
  recordedBy?: string;
  contextNote?: string;
  locationNote?: string;
  consentVersion?: string;
  attributionRole?: string;
  attributionCommunity?: string;
}): Promise<Contribution> {
  const formData = new FormData();
  formData.append("audio", input.file);
  if (input.termId) formData.append("termId", input.termId);
  if (input.proposedKhmerText)
    formData.append("proposedKhmerText", input.proposedKhmerText);
  if (input.proposedLatinTransliteration) {
    formData.append(
      "proposedLatinTransliteration",
      input.proposedLatinTransliteration,
    );
  }
  if (input.proposedMeaningVi)
    formData.append("proposedMeaningVi", input.proposedMeaningVi);
  if (input.region) formData.append("region", input.region);
  formData.append("consentScope", input.consentScope);
  if (input.aiPermission) formData.append("aiPermission", input.aiPermission);
  if (input.attributionName)
    formData.append("attributionName", input.attributionName);
  formData.append("sensitive", String(input.sensitive ?? false));
  formData.append("language", input.language ?? "km");
  formData.append("consentVersion", input.consentVersion ?? "2026-08");
  if (input.recordedAt) formData.append("recordedAt", input.recordedAt);
  if (input.recordedBy) formData.append("recordedBy", input.recordedBy);
  if (input.contextNote) formData.append("contextNote", input.contextNote);
  if (input.locationNote) formData.append("locationNote", input.locationNote);
  if (input.attributionRole) formData.append("attributionRole", input.attributionRole);
  if (input.attributionCommunity) formData.append("attributionCommunity", input.attributionCommunity);

  const response = await fetch(
    `${API_BASE_URL}/v1/contribution/contributions`,
    {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: undefined }));
    throw new ApiError(
      response.status,
      body.message ?? `Loi API (${response.status})`,
    );
  }
  return response.json();
}

export async function listMyContributions(): Promise<Contribution[]> {
  return request(`/v1/contribution/contributions/me`, {
    headers: authHeaders(),
  });
}

export async function getMyContribution(
  id: string,
): Promise<ContributionDetail> {
  return request(`/v1/contribution/contributions/${id}`, {
    headers: authHeaders(),
  });
}

export async function withdrawContribution(id: string): Promise<Contribution> {
  return request(`/v1/contribution/contributions/${id}/withdraw`, {
    method: "POST",
    headers: authHeaders(),
  });
}

export async function getModerationQueue(): Promise<Contribution[]> {
  return request(`/v1/moderation/queue`, { headers: authHeaders() });
}

export async function getContributionForReview(
  id: string,
): Promise<ContributionDetail> {
  return request(`/v1/moderation/contributions/${id}`, {
    headers: authHeaders(),
  });
}

export async function decideContribution(
  id: string,
  decision: string,
  reason?: string,
): Promise<Contribution> {
  return request(`/v1/moderation/contributions/${id}/decide`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ decision, reason }),
  });
}

export async function getModerationHistory(
  id: string,
): Promise<ModerationDecisionRecord[]> {
  return request(`/v1/moderation/contributions/${id}/history`, {
    headers: authHeaders(),
  });
}

export interface SavedItem {
  id: string;
  entityId: string | null;
  termId: string | null;
  itemType: "ENTITY" | "TERM";
  title: string;
  subtitle: string | null;
  createdAt: string;
}

export interface ScanHistoryItem extends ScanStatus {
  createdAt: string;
  imageUrl: string;
}

export interface PersonalDataExport {
  exportedAt: string;
  profile: PublicUser;
  saved: SavedItem[];
  scanHistory: ScanHistoryItem[];
  contributions: Contribution[];
}
export interface PrivacyRequest {
  id: string;
  requestType: "EXPORT" | "DELETE";
  status: string;
  dueAt: string;
  completedAt: string | null;
  resultPayload: PersonalDataExport | null;
  createdAt: string;
}
export async function createPrivacyRequest(
  requestType: "EXPORT" | "DELETE",
): Promise<PrivacyRequest> {
  return request("/v1/personalization/privacy-requests", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ requestType }),
  });
}
export async function listPrivacyRequests(): Promise<PrivacyRequest[]> {
  return request("/v1/personalization/privacy-requests", {
    headers: authHeaders(),
  });
}
export async function cancelPrivacyRequest(id: string): Promise<void> {
  await request(`/v1/personalization/privacy-requests/${id}/cancel`, {
    method: "POST",
    headers: authHeaders(),
  });
}

export async function saveEntity(entityId: string): Promise<SavedItem> {
  return request(`/v1/personalization/saved`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ entityId }),
  });
}

export async function saveTerm(termId: string): Promise<SavedItem> {
  return request(`/v1/personalization/saved`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ termId }),
  });
}

export async function unsaveEntity(entityId: string): Promise<void> {
  await request(`/v1/personalization/saved/entity/${entityId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

export async function unsaveTerm(termId: string): Promise<void> {
  await request(`/v1/personalization/saved/term/${termId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

export async function listSaved(
  params: { type?: "entity" | "term"; q?: string } = {},
): Promise<SavedItem[]> {
  const query = new URLSearchParams();
  if (params.type) query.set("type", params.type);
  if (params.q) query.set("q", params.q);
  const qs = query.toString();
  return request(`/v1/personalization/saved${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(),
  });
}

export async function listScanHistory(): Promise<ScanHistoryItem[]> {
  return request(`/v1/personalization/history`, { headers: authHeaders() });
}

export async function deleteScanHistoryItem(id: string): Promise<void> {
  await request(`/v1/personalization/history/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

export async function exportPersonalData(): Promise<PersonalDataExport> {
  return request(`/v1/personalization/export`, { headers: authHeaders() });
}

export interface FestivalSummary {
  id: string;
  entityId: string;
  preferredLabel: string;
  publicationStatus: string;
  nextOccurrenceAt: string | null;
}

export interface FestivalEvent {
  id: string;
  eventType: string;
  title: string;
  scheduledAt: string | null;
  note: string | null;
}

export interface FestivalFacility {
  id: string;
  facilityType: string;
  note: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface FestivalOccurrence {
  id: string;
  startsAt: string;
  endsAt: string | null;
  status: string;
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
  occurrences: FestivalOccurrence[];
}

export async function listFestivals(): Promise<FestivalSummary[]> {
  return request(`/v1/festivals`, { headers: authHeaders() });
}

export async function getFestivalDetail(
  entityId: string,
): Promise<FestivalDetail> {
  return request(`/v1/festivals/${entityId}`, { headers: authHeaders() });
}

export async function updateOccurrenceStatus(
  occurrenceId: string,
  status: string,
): Promise<void> {
  await request(`/v1/festivals/occurrences/${occurrenceId}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
}

export async function sendEmergencyBroadcast(
  festivalId: string,
  input: { title: string; body: string; priority?: string; expiresAt?: string },
): Promise<number> {
  return request(`/v1/festivals/${festivalId}/broadcast`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
}

export interface BoatTeam {
  id: string;
  organizationId: string | null;
  displayName: string;
  homePlaceId: string | null;
  symbolColor: string | null;
  story: string | null;
}

export async function listBoatTeams(): Promise<BoatTeam[]> {
  return request(`/v1/festivals/boat-teams`, { headers: authHeaders() });
}

export async function getBoatTeam(id: string): Promise<BoatTeam> {
  return request(`/v1/festivals/boat-teams/${id}`, { headers: authHeaders() });
}

export async function createBoatTeam(input: {
  displayName: string;
  organizationId?: string;
  homePlaceId?: string;
  symbolColor?: string;
  story?: string;
}): Promise<BoatTeam> {
  return request(`/v1/festivals/boat-teams`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
}

export interface Follow {
  id: string;
  targetType: string;
  targetId: string;
}

export async function followTarget(
  targetType: string,
  targetId: string,
): Promise<Follow> {
  return request(`/v1/notifications/follow`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ targetType, targetId }),
  });
}

export async function unfollowTarget(
  targetType: string,
  targetId: string,
): Promise<void> {
  await request(`/v1/notifications/follow/${targetType}/${targetId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

export async function listMyFollows(): Promise<Follow[]> {
  return request(`/v1/notifications/follows`, { headers: authHeaders() });
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  priority: string;
  targetType: string | null;
  targetId: string | null;
  createdAt: string;
  readAt: string | null;
}

export async function listMyNotifications(): Promise<AppNotification[]> {
  return request(`/v1/notifications`, { headers: authHeaders() });
}

export async function markNotificationRead(id: string): Promise<void> {
  await request(`/v1/notifications/${id}/read`, {
    method: "PATCH",
    headers: authHeaders(),
  });
}

export interface Organization {
  id: string;
  name: string;
  orgType: string;
  status: string;
  brandColor: string | null;
  homePlaceId: string | null;
  createdBy: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: "MANAGER" | "MEMBER";
  displayName: string;
  email: string;
}

export async function createOrganization(input: {
  name: string;
  orgType: string;
  homePlaceId?: string;
}): Promise<Organization> {
  return request(`/v1/organizations`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
}

export async function listOrganizations(): Promise<Organization[]> {
  return request(`/v1/organizations`, { headers: authHeaders() });
}

export async function listPendingOrganizations(): Promise<Organization[]> {
  return request(`/v1/organizations/pending`, { headers: authHeaders() });
}

export async function getOrganization(id: string): Promise<Organization> {
  return request(`/v1/organizations/${id}`, { headers: authHeaders() });
}

export async function approveOrganization(id: string): Promise<Organization> {
  return request(`/v1/organizations/${id}/approve`, {
    method: "PATCH",
    headers: authHeaders(),
  });
}

export async function rejectOrganization(
  id: string,
  reason: string,
): Promise<Organization> {
  return request(`/v1/organizations/${id}/reject`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ reason }),
  });
}

export async function listOrganizationMembers(
  id: string,
): Promise<OrganizationMember[]> {
  return request(`/v1/organizations/${id}/members`, { headers: authHeaders() });
}

export async function addOrganizationMember(
  id: string,
  input: { userId: string; role: "MANAGER" | "MEMBER" },
): Promise<void> {
  await request(`/v1/organizations/${id}/members`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
}

export async function removeOrganizationMember(
  id: string,
  userId: string,
): Promise<void> {
  await request(`/v1/organizations/${id}/members/${userId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

export async function updateOrganizationBranding(
  id: string,
  brandColor: string | null,
): Promise<Organization> {
  return request(`/v1/organizations/${id}/branding`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ brandColor: brandColor ?? undefined }),
  });
}

export interface OrganizationCompetitionReport {
  competitionId: string;
  title: string;
  status: string;
  participantCount: number;
  submissionCount: number;
  correctSubmissionCount: number;
}

export async function getOrganizationReport(
  organizationId: string,
): Promise<OrganizationCompetitionReport[]> {
  return request(`/v1/olympiad/organizations/${organizationId}/report`, {
    headers: authHeaders(),
  });
}

export interface OrganizationExport {
  exportedAt: string;
  organization: Organization;
  members: OrganizationMember[];
  competitions: OrganizationCompetitionReport[];
}

export async function exportOrganizationData(
  organizationId: string,
): Promise<OrganizationExport> {
  return request(`/v1/olympiad/organizations/${organizationId}/export`, {
    headers: authHeaders(),
  });
}
