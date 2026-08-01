import type {
  PaginatedResponseContract,
  HeritageEntityPublicContract,
  PlacePublicContract,
  CategoryPublicContract,
} from '@phumspace/contracts';
import { API_BASE_URL } from './constants';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
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
};
