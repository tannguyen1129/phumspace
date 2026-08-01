import { apiClient, ApiError } from './api-client';

describe('API Client (Sprint 2 Tests)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('1. getHeritageEntities should fetch paginated data from /api/v1/heritage-entities', async () => {
    const mockResponse = {
      data: [
        {
          id: '1',
          slug: 'chua-hang-tra-vinh',
          type: 'ARCHITECTURE',
          summary: 'Tóm tắt Chùa Âng',
          names: [{ language: 'vi', nameType: 'PREFERRED', originalValue: 'Chùa Âng', normalizedValue: 'chua ang' }],
          categories: [],
          places: [],
          createdAt: '2026-08-01T00:00:00Z',
          updatedAt: '2026-08-01T00:00:00Z',
        },
      ],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    } as any);

    const result = await apiClient.getHeritageEntities({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].slug).toBe('chua-hang-tra-vinh');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/heritage-entities?page=1&limit=10'),
      expect.anything(),
    );
  });

  it('2. getHeritageEntityBySlug should fetch single entity detail', async () => {
    const mockEntity = {
      id: '1',
      slug: 'chua-hang-tra-vinh',
      type: 'ARCHITECTURE',
      summary: 'Tóm tắt Chùa Âng',
      names: [],
      categories: [],
      places: [],
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockEntity),
    } as any);

    const result = await apiClient.getHeritageEntityBySlug('chua-hang-tra-vinh');
    expect(result.slug).toBe('chua-hang-tra-vinh');
  });

  it('3. Should throw ApiError with status 404 on 404 responses', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: jest.fn().mockResolvedValue({ message: 'Not Found' }),
    } as any);

    await expect(apiClient.getHeritageEntityBySlug('slug-khong-ton-tai')).rejects.toThrow(ApiError);
  });

  it('4. getPlaces should fetch places list', async () => {
    const mockPlaces = [
      { id: '1', slug: 'phuong-8-tp-tra-vinh', name: 'Phường 8', createdAt: '2026-08-01T00:00:00Z' },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockPlaces),
    } as any);

    const result = await apiClient.getPlaces();
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('phuong-8-tp-tra-vinh');
  });

  it('5. getCategories should fetch category list', async () => {
    const mockCategories = [
      { id: '1', slug: 'kien-truc-ton-giao', name: 'Kiến trúc Tôn giáo', createdAt: '2026-08-01T00:00:00Z' },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockCategories),
    } as any);

    const result = await apiClient.getCategories();
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('kien-truc-ton-giao');
  });
});
