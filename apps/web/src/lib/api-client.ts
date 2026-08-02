import type {
  PaginatedResponseContract,
  HeritageEntityPublicContract,
  PlacePublicContract,
  CategoryPublicContract,
  MapPlacesResponseContract,
  ScanResponseContract,
  QuizSummaryContract,
  QuizDetailContract,
  StartQuizAttemptResponseContract,
  SubmitQuizAnswerResponseContract,
  CompleteQuizResponseContract,
  QuizResultContract,
  PassportSummaryContract,
  PassportActivityContract,
  PassportAchievementContract,
  PassportSessionResponseContract,
  ContributionSummaryContract,
  ContributionDetailContract,
  CreateContributionRequestContract,
  AdminSessionContract,
  StaffProfileContract,
  AdminSecuritySessionContract,
  AdminContributionSummaryContract,
  AdminContributionDetailContract,
  AdminPublicationPlanContract,
  KhmerTermSummaryContract,
  KhmerTermDetailContract,
  HandbookTopicContract,
  HandbookCollectionSummaryContract,
  HandbookCollectionDetailContract,
  HandbookTermProgressContract,
  HandbookCollectionProgressContract,
  HandbookProgressSummaryContract,
  CompleteCollectionResponseContract,
} from '@phumspace/contracts';
import { API_BASE_URL } from './constants';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errorCode?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}/api/v1${endpoint}`;
  
  try {
    const res = await fetch(url, {
      ...options,
      credentials: 'include', // Ensure HttpOnly session cookies are sent!
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      next: { revalidate: 60, ...(options.next || {}) },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new ApiError(
        res.status,
        errorData.message || `Lỗi HTTP ${res.status} khi truy cập ${endpoint}`,
        errorData.errorCode,
      );
    }

    return await res.json();
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(0, err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ PhumSpace API');
  }
}

export const apiClient = {
  async getHeritageEntities(params: {
    page?: number;
    limit?: number;
    categorySlug?: string;
    placeSlug?: string;
  } = {}): Promise<PaginatedResponseContract<HeritageEntityPublicContract>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.categorySlug) query.append('categorySlug', params.categorySlug);
    if (params.placeSlug) query.append('placeSlug', params.placeSlug);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<PaginatedResponseContract<HeritageEntityPublicContract>>(
      `/heritage-entities${queryString}`,
      { cache: 'no-store' }
    );
  },

  async getHeritageEntityBySlug(slug: string): Promise<HeritageEntityPublicContract> {
    return fetchJson<HeritageEntityPublicContract>(`/heritage-entities/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
  },

  async getPlaces(): Promise<PlacePublicContract[]> {
    return fetchJson<PlacePublicContract[]>('/places', {
      next: { revalidate: 60 },
    });
  },

  async getPlaceBySlug(slug: string): Promise<PlacePublicContract> {
    return fetchJson<PlacePublicContract>(`/places/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
  },

  async getCategories(): Promise<CategoryPublicContract[]> {
    return fetchJson<CategoryPublicContract[]>('/categories', {
      next: { revalidate: 60 },
    });
  },

  async getMapPlaces(placeType?: string): Promise<MapPlacesResponseContract> {
    const query = placeType ? `?placeType=${encodeURIComponent(placeType)}` : '';
    return fetchJson<MapPlacesResponseContract>(`/map/places${query}`, {
      next: { revalidate: 60 },
    });
  },

  async uploadScanImage(file: File, signal?: AbortSignal): Promise<ScanResponseContract> {
    const url = `${API_BASE_URL}/api/v1/scans`;
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new ApiError(
          res.status,
          errorData.message || `Lỗi xử lý hình ảnh ${res.status}`,
          errorData.errorCode,
        );
      }

      return await res.json();
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      if (err?.name === 'AbortError' || err?.name === 'DOMException' || err?.message?.includes('Aborted')) {
        throw new ApiError(0, 'Đã hủy quá trình phân tích hình ảnh.', 'SCAN_CANCELLED');
      }
      throw new ApiError(0, err instanceof Error ? err.message : 'Không thể gửi yêu cầu phân tích hình ảnh');
    }
  },

  async getQuizzes(): Promise<QuizSummaryContract[]> {
    return fetchJson<QuizSummaryContract[]>('/quizzes', { cache: 'no-store' });
  },

  async getQuizBySlug(slug: string): Promise<QuizDetailContract> {
    return fetchJson<QuizDetailContract>(`/quizzes/${encodeURIComponent(slug)}`, { cache: 'no-store' });
  },

  async startQuizAttempt(slug: string): Promise<StartQuizAttemptResponseContract> {
    return fetchJson<StartQuizAttemptResponseContract>(`/quizzes/${encodeURIComponent(slug)}/attempts`, {
      method: 'POST',
    });
  },

  async submitQuizAnswer(
    attemptId: string,
    questionId: string,
    selectedOptionId?: string,
  ): Promise<SubmitQuizAnswerResponseContract> {
    return fetchJson<SubmitQuizAnswerResponseContract>(`/quiz-attempts/${encodeURIComponent(attemptId)}/answers`, {
      method: 'POST',
      body: JSON.stringify({ questionId, selectedOptionId }),
    });
  },

  async completeQuizAttempt(attemptId: string): Promise<CompleteQuizResponseContract> {
    return fetchJson<CompleteQuizResponseContract>(`/quiz-attempts/${encodeURIComponent(attemptId)}/complete`, {
      method: 'POST',
    });
  },

  async getQuizResult(attemptId: string): Promise<QuizResultContract> {
    return fetchJson<QuizResultContract>(`/quiz-attempts/${encodeURIComponent(attemptId)}/result`, {
      cache: 'no-store',
    });
  },

  async ensurePassportSession(): Promise<PassportSessionResponseContract> {
    return fetchJson<PassportSessionResponseContract>('/passport/session', {
      method: 'POST',
    });
  },

  async getPassport(): Promise<PassportSummaryContract> {
    return fetchJson<PassportSummaryContract>('/passport', {
      cache: 'no-store',
    });
  },

  async getPassportActivities(page: number = 1, limit: number = 10): Promise<{ data: PassportActivityContract[]; total: number }> {
    return fetchJson<{ data: PassportActivityContract[]; total: number }>(`/passport/activities?page=${page}&limit=${limit}`, {
      cache: 'no-store',
    });
  },

  async getPassportAchievements(): Promise<PassportAchievementContract[]> {
    return fetchJson<PassportAchievementContract[]>('/passport/achievements', {
      cache: 'no-store',
    });
  },

  async createContribution(data: CreateContributionRequestContract): Promise<ContributionDetailContract> {
    return fetchJson<ContributionDetailContract>('/contributions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMyContributions(page: number = 1, limit: number = 10): Promise<{ data: ContributionSummaryContract[]; total: number }> {
    return fetchJson<{ data: ContributionSummaryContract[]; total: number }>(`/contributions?page=${page}&limit=${limit}`, {
      cache: 'no-store',
    });
  },

  async getContributionDetail(publicId: string): Promise<ContributionDetailContract> {
    return fetchJson<ContributionDetailContract>(`/contributions/${encodeURIComponent(publicId)}`, {
      cache: 'no-store',
    });
  },

  async uploadContributionMedia(publicId: string, file: File): Promise<ContributionDetailContract> {
    const url = `${API_BASE_URL}/api/v1/contributions/${encodeURIComponent(publicId)}/media`;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new ApiError(
          res.status,
          errorData.message || `Lỗi tải tệp phương tiện ${res.status}`,
          errorData.errorCode,
        );
      }

      return await res.json();
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(0, err instanceof Error ? err.message : 'Không thể gửi tệp phương tiện đính kèm');
    }
  },

  async submitContribution(publicId: string): Promise<ContributionDetailContract> {
    return fetchJson<ContributionDetailContract>(`/contributions/${encodeURIComponent(publicId)}/submit`, {
      method: 'POST',
    });
  },

  async withdrawContribution(publicId: string): Promise<ContributionDetailContract> {
    return fetchJson<ContributionDetailContract>(`/contributions/${encodeURIComponent(publicId)}/withdraw`, {
      method: 'POST',
    });
  },

  async loginAdmin(idToken: string): Promise<AdminSessionContract> {
    return fetchJson<AdminSessionContract>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  },

  async logoutAdmin(): Promise<AdminSessionContract> {
    return fetchJson<AdminSessionContract>('/admin/auth/logout', {
      method: 'POST',
    });
  },

  async getAdminProfile(): Promise<StaffProfileContract> {
    return fetchJson<StaffProfileContract>('/admin/me', {
      cache: 'no-store',
    });
  },

  async getAdminSecuritySessions(): Promise<AdminSecuritySessionContract[]> {
    return fetchJson<AdminSecuritySessionContract[]>('/admin/security/sessions', {
      cache: 'no-store',
    });
  },

  async getAdminModerationQueue(params: {
    page?: number;
    limit?: number;
    status?: string;
    contributionType?: string;
  } = {}): Promise<{ data: AdminContributionSummaryContract[]; total: number }> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.status) query.append('status', params.status);
    if (params.contributionType) query.append('contributionType', params.contributionType);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<{ data: AdminContributionSummaryContract[]; total: number }>(`/admin/contributions${queryString}`, {
      cache: 'no-store',
    });
  },

  async getAdminContributionDetail(publicId: string): Promise<AdminContributionDetailContract> {
    return fetchJson<AdminContributionDetailContract>(`/admin/contributions/${encodeURIComponent(publicId)}`, {
      cache: 'no-store',
    });
  },

  async assignAdminReview(publicId: string): Promise<{ status: string; message: string }> {
    return fetchJson<{ status: string; message: string }>(`/admin/contributions/${encodeURIComponent(publicId)}/assign`, {
      method: 'POST',
    });
  },

  async requestAdminInformation(publicId: string, publicMessage: string, version?: number): Promise<{ status: string; message: string }> {
    return fetchJson<{ status: string; message: string }>(`/admin/contributions/${encodeURIComponent(publicId)}/request-information`, {
      method: 'POST',
      body: JSON.stringify({ publicMessage, version }),
    });
  },

  async submitAdminRecommendation(publicId: string, data: { recommendation: string; internalNote?: string; checklistResult?: any }): Promise<{ status: string; message: string }> {
    return fetchJson<{ status: string; message: string }>(`/admin/contributions/${encodeURIComponent(publicId)}/recommend`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async approveAdminContribution(publicId: string, internalNote?: string, version?: number): Promise<{ status: string; message: string }> {
    return fetchJson<{ status: string; message: string }>(`/admin/contributions/${encodeURIComponent(publicId)}/approve`, {
      method: 'POST',
      body: JSON.stringify({ internalNote, version }),
    });
  },

  async rejectAdminContribution(publicId: string, publicMessage: string, reasonCode?: string, version?: number): Promise<{ status: string; message: string }> {
    return fetchJson<{ status: string; message: string }>(`/admin/contributions/${encodeURIComponent(publicId)}/reject`, {
      method: 'POST',
      body: JSON.stringify({ publicMessage, reasonCode, version }),
    });
  },

  async publishAdminContribution(publicId: string, plan: AdminPublicationPlanContract): Promise<{ status: string; message: string; data: any }> {
    return fetchJson<{ status: string; message: string; data: any }>(`/admin/contributions/${encodeURIComponent(publicId)}/publish`, {
      method: 'POST',
      body: JSON.stringify(plan),
    });
  },

  async getHandbookTerms(params: {
    q?: string;
    topicSlug?: string;
    collectionSlug?: string;
    partOfSpeech?: string;
    page?: number;
    limit?: number;
  } = {}, signal?: AbortSignal): Promise<{ data: KhmerTermSummaryContract[]; total: number }> {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.topicSlug) query.append('topicSlug', params.topicSlug);
    if (params.collectionSlug) query.append('collectionSlug', params.collectionSlug);
    if (params.partOfSpeech) query.append('partOfSpeech', params.partOfSpeech);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<{ data: KhmerTermSummaryContract[]; total: number }>(`/handbook/terms${queryString}`, {
      cache: 'no-store',
      signal,
    });
  },

  async getHandbookTermBySlug(slug: string): Promise<KhmerTermDetailContract> {
    return fetchJson<KhmerTermDetailContract>(`/handbook/terms/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    });
  },

  async getHandbookTopics(): Promise<HandbookTopicContract[]> {
    return fetchJson<HandbookTopicContract[]>('/handbook/topics', {
      cache: 'no-store',
    });
  },

  async getTermsByTopicSlug(slug: string): Promise<{ topic: HandbookTopicContract; terms: KhmerTermSummaryContract[] }> {
    return fetchJson<{ topic: HandbookTopicContract; terms: KhmerTermSummaryContract[] }>(`/handbook/topics/${encodeURIComponent(slug)}/terms`, {
      cache: 'no-store',
    });
  },

  async getHandbookCollections(): Promise<HandbookCollectionSummaryContract[]> {
    return fetchJson<HandbookCollectionSummaryContract[]>('/handbook/collections', {
      cache: 'no-store',
    });
  },

  async getCollectionDetailBySlug(slug: string): Promise<HandbookCollectionDetailContract> {
    return fetchJson<HandbookCollectionDetailContract>(`/handbook/collections/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    });
  },

  async getHandbookOverallProgress(): Promise<HandbookProgressSummaryContract> {
    return fetchJson<HandbookProgressSummaryContract>('/handbook/progress', {
      cache: 'no-store',
    });
  },

  async getHandbookTermProgress(termId: string): Promise<HandbookTermProgressContract> {
    return fetchJson<HandbookTermProgressContract>(`/handbook/progress/terms/${encodeURIComponent(termId)}`, {
      cache: 'no-store',
    });
  },

  async updateHandbookTermProgress(termId: string, status: 'LEARNING' | 'LEARNED'): Promise<HandbookTermProgressContract> {
    return fetchJson<HandbookTermProgressContract>(`/handbook/progress/terms/${encodeURIComponent(termId)}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async getHandbookCollectionProgress(collectionId: string): Promise<HandbookCollectionProgressContract> {
    return fetchJson<HandbookCollectionProgressContract>(`/handbook/progress/collections/${encodeURIComponent(collectionId)}`, {
      cache: 'no-store',
    });
  },

  async startHandbookCollection(collectionId: string): Promise<HandbookCollectionProgressContract> {
    return fetchJson<HandbookCollectionProgressContract>(`/handbook/progress/collections/${encodeURIComponent(collectionId)}/start`, {
      method: 'POST',
    });
  },

  async completeHandbookCollection(collectionId: string): Promise<CompleteCollectionResponseContract> {
    return fetchJson<CompleteCollectionResponseContract>(`/handbook/progress/collections/${encodeURIComponent(collectionId)}/complete`, {
      method: 'POST',
    });
  },
};
