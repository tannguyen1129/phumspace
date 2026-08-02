import { Metadata } from 'next';
import type { MapMarkerContract } from '@phumspace/contracts';
import { apiClient } from '@/lib/api-client';
import { MapClientWrapper } from '@/components/map/map-client-wrapper';
import { ErrorState } from '@/components/common/error-state';

export const metadata: Metadata = {
  title: 'Bản đồ Di sản Văn hóa Khmer — PhumSpace',
  description: 'Bản đồ tương tác hiển thị các địa điểm di sản văn hóa Khmer Nam Bộ đã được công bố chính thức.',
};

export const revalidate = 60; // ISR 60s

export default async function MapPage() {
  let markers: MapMarkerContract[] = [];
  let errorMsg = null;

  try {
    const res = await apiClient.getMapPlaces();
    markers = res.data;
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : 'Không thể tải dữ liệu bản đồ từ máy chủ PhumSpace API';
  }

  return (
    <div className="space-y-6 py-8">
      {/* Header Banner */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
          Bản đồ Di sản Văn hóa Khmer
        </h1>
        <p className="text-sm text-slate-400">
          Không gian địa lý di sản trực quan hiển thị các điểm chùa chiền, di tích và không gian diễn ra lễ hội truyền thống.
        </p>
      </div>

      {errorMsg ? (
        <ErrorState message={errorMsg} />
      ) : (
        <MapClientWrapper initialMarkers={markers} />
      )}
    </div>
  );
}
