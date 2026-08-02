import { apiClient, ApiError } from '../../lib/api-client';

describe('AI Cultural Scanner Frontend (Sprint 4B Tests)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('1. uploadScanImage should send FormData with image file to /api/v1/scans', async () => {
    const mockScanResponse = {
      scanId: 'scan-123',
      status: 'SUCCESS',
      decision: 'MATCH',
      confidenceBand: 'HIGH',
      observationSummary: {
        objectTypes: ['temple'],
        visibleFeatures: ['multi-tiered roof'],
        imageQuality: 'HIGH',
      },
      matchedEntity: {
        id: '1',
        slug: 'chua-hang-tra-vinh',
        canonicalCode: 'chua-hang-tra-vinh',
        type: 'ARCHITECTURE',
        preferredViName: 'Chùa Âng',
        summary: 'Chùa Âng cổ kính',
        categories: ['Kiến trúc Tôn giáo'],
        places: ['Phường 8, TP. Trà Vinh'],
      },
      sources: [{ id: 'src-1', title: 'Địa chí Trà Vinh' }],
      warnings: [],
      createdAt: '2026-08-01T20:00:00.000Z',
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockScanResponse),
    } as any);

    const dummyFile = new File(['dummy content'], 'chua-ang.jpg', { type: 'image/jpeg' });
    const result = await apiClient.uploadScanImage(dummyFile);

    expect(result.decision).toBe('MATCH');
    expect(result.matchedEntity?.slug).toBe('chua-hang-tra-vinh');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/scans'),
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    );
  });

  it('2. uploadScanImage should map backend error codes into ApiError', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({
        errorCode: 'IMAGE_TOO_LARGE',
        message: 'Kích thước tệp hình ảnh vượt quá giới hạn 5MB.',
      }),
    } as any);

    const dummyFile = new File(['dummy'], 'large.jpg', { type: 'image/jpeg' });

    try {
      await apiClient.uploadScanImage(dummyFile);
      fail('Should have thrown ApiError');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.errorCode).toBe('IMAGE_TOO_LARGE');
    }
  });

  it('3. uploadScanImage should handle request cancellation (AbortSignal)', async () => {
    const controller = new AbortController();
    controller.abort();

    global.fetch = jest.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError'));

    const dummyFile = new File(['dummy'], 'chua-ang.jpg', { type: 'image/jpeg' });

    try {
      await apiClient.uploadScanImage(dummyFile, controller.signal);
      fail('Should have thrown SCAN_CANCELLED error');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.errorCode).toBe('SCAN_CANCELLED');
    }
  });
});
